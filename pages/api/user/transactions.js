import dbConnect from '../../../lib/mongodb';
import Transaction from '../../../models/Transaction';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
    if (req.method !== 'GET') return res.status(405).end();

    const session = await getServerSession(req, res, authOptions);
    if (!session) return res.status(401).json({ message: 'Unauthorized' });

    await dbConnect();

    const transactions = await Transaction.find({
        userId: session.user.email,
        status: 'active'
    });

    const borrowedBookIds = transactions.map(t => t.bookId);

    res.status(200).json({ borrowedBookIds });
}
