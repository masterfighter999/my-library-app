import dbConnect from '../../../lib/mongodb';
import Book from '../../../models/Book';
import Transaction from '../../../models/Transaction';
import redis from '../../../lib/redis';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
    if (req.method !== 'DELETE') return res.status(405).end();

    const session = await getServerSession(req, res, authOptions);
    if (!session || session.user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden: Admins only' });
    }

    const { bookId } = req.body;
    if (!bookId) {
        return res.status(400).json({ message: 'Book ID is required' });
    }

    await dbConnect();

    // 1. CHECK: active transactions
    const activeTransaction = await Transaction.findOne({
        bookId,
        status: 'active'
    });

    if (activeTransaction) {
        return res.status(400).json({ message: 'Cannot delete book: Currently borrowed by a student' });
    }

    // 2. DELETE
    const deletedBook = await Book.findByIdAndDelete(bookId);

    if (!deletedBook) {
        return res.status(404).json({ message: 'Book not found' });
    }

    // 3. INVALIDATE CACHE
    await redis.del('books:all');
    const keys = await redis.keys('search:*');
    if (keys.length > 0) await redis.del(keys);

    res.status(200).json({ message: 'Book deleted successfully', bookId });
}
