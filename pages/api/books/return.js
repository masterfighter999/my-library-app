import dbConnect from '../../../lib/mongodb';
import Book from '../../../models/Book';
import Transaction from '../../../models/Transaction';
import redis from '../../../lib/redis';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();

    const session = await getServerSession(req, res, authOptions);
    if (!session) return res.status(401).json({ message: 'Unauthorized' });

    const { bookId } = req.body;
    const userId = session.user.email;

    await dbConnect();

    // 1. FIND Active Transaction
    const transaction = await Transaction.findOne({
        userId,
        bookId,
        status: 'active'
    });

    if (!transaction) {
        return res.status(400).json({ message: 'No active borrow record found for this book' });
    }

    // 2. MARK as Returned
    transaction.status = 'returned';
    transaction.returnDate = new Date();
    await transaction.save();

    // 3. RESTOCK Book
    const book = await Book.findByIdAndUpdate(
        bookId,
        {
            $inc: { copies: 1 },
            $set: { status: 'available' }
        },
        { new: true }
    );

    // 4. INVALIDATE Cache
    const keys = await redis.keys('search:*');
    if (keys.length > 0) await redis.del(keys);
    await redis.del('books:all');

    res.status(200).json({ message: 'Book returned successfully', book });
}
