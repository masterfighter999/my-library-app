import dbConnect from '../../../lib/mongodb';
import Book from '../../../models/Book';
import redis from '../../../lib/redis';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  // 1. SECURITY: Ensure user is logged in
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ message: 'Unauthorized' });

  const { bookId } = req.body;
  await dbConnect();

  // 2. TRANSACTION: Atomic update in MongoDB to prevent race conditions
  const book = await Book.findOneAndUpdate(
    { _id: bookId, copies: { $gt: 0 } },
    { 
      $inc: { copies: -1 },
      $set: { status: 'borrowed' } // Simplified: logic for 'borrowed' status might need more nuance if copies > 1
    },
    { new: true }
  );
  
  if (!book) {
    return res.status(400).json({ message: 'Book unavailable or out of stock' });
  }

  // Refined status logic: Only set to 'borrowed' if copies actually reached 0
  if (book.copies > 0) {
    book.status = 'available';
    await book.save();
  }

  // 3. CACHE INVALIDATION: Clear stale data
  // In a real app, you might use specific tags, here we clear searches
  const keys = await redis.keys('search:*');
  if (keys.length > 0) await redis.del(keys);
  await redis.del('books:all');

  res.status(200).json({ message: 'Success', book });
}