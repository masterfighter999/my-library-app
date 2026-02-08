import dbConnect from '../../../lib/mongodb';
import Book from '../../../models/Book';
import Transaction from '../../../models/Transaction';
import SystemSettings from '../../../models/SystemSettings';
import redis from '../../../lib/redis';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  // 1. SECURITY: Ensure user is logged in
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ message: 'Unauthorized' });

  const { bookId } = req.body;
  const userId = session.user.email; // Using email as user identifier for now

  await dbConnect();

  // 2. CHECK: Prevent duplicate borrowing
  const existingTransaction = await Transaction.findOne({
    userId,
    bookId,
    status: 'active'
  });

  if (existingTransaction) {
    return res.status(400).json({ message: 'You have already borrowed this book' });
  }

  // 3. TRANSACTION: Atomic update in MongoDB
  // We first try to find the book and decrement copies only if copies > 0
  const book = await Book.findOneAndUpdate(
    { _id: bookId, copies: { $gt: 0 } },
    {
      $inc: { copies: -1 },
    },
    { new: true }
  );

  if (!book) {
    return res.status(400).json({ message: 'Book unavailable or out of stock' });
  }

  // Update status if copies reached 0
  if (book.copies === 0) {
    book.status = 'borrowed'; // 'borrowed' implies 'out of stock' in this simple model if we use it for display
    await book.save();
  } else {
    // Ensure it stays available if we still have copies (e.g. if it was previously 0 but somehow got here, though unlikely with $gt:0 query)
    if (book.status === 'borrowed') {
      book.status = 'available';
      await book.save();
    }
  }

  // 3. GET SETTINGS & CALCULATE DUE DATE
  const settings = await SystemSettings.getSettings();
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + settings.borrowPeriod);

  // 4. CREATE TRANSACTION
  const transaction = await Transaction.create({
    userId: session.user.email,
    bookId,
    dueDate // Add due date
  });

  // 5. CACHE INVALIDATION: Clear stale data
  const keys = await redis.keys('search:*');
  if (keys.length > 0) await redis.del(keys);
  await redis.del('books:all');

  res.status(200).json({ message: 'Success', book });
}