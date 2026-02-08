import dbConnect from '../../../lib/mongodb';
import Book from '../../../models/Book';
import redis from '../../../lib/redis';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();

    const session = await getServerSession(req, res, authOptions);
    if (!session || session.user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden: Admins only' });
    }

    const { title, author, isbn, copies } = req.body;

    if (!title || !author || !isbn) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    await dbConnect();

    try {
        const newBook = await Book.create({
            title,
            author,
            isbn,
            copies: parseInt(copies) || 1,
            status: (parseInt(copies) || 1) > 0 ? 'available' : 'borrowed'
        });

        // Invalidate Cache
        await redis.del('books:all');
        const keys = await redis.keys('search:*');
        if (keys.length > 0) await redis.del(keys);

        res.status(201).json({ message: 'Book added successfully', book: newBook });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Book with this ISBN already exists' });
        }
        console.error("Add book error:", error);
        res.status(500).json({ message: 'Server error' });
    }
}
