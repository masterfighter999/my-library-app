import dbConnect from '../../../lib/mongodb';
import Transaction from '../../../models/Transaction';
import Book from '../../../models/Book'; // Ensure Book is registered
import SystemSettings from '../../../models/SystemSettings';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
    if (req.method !== 'GET') return res.status(405).end();

    const session = await getServerSession(req, res, authOptions);
    if (!session || session.user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden: Admins only' });
    }

    await dbConnect();

    try {
        const settings = await SystemSettings.getSettings();

        // Fetch all active transactions using populate
        const activeLoans = await Transaction.find({ status: 'active' })
            .populate('bookId', 'title author isbn')
            .sort({ borrowDate: -1 })
            .lean();

        const now = new Date();
        const finePerDay = settings.finePerDay || 0;

        // Enhance with dynamic fine calculation
        const loansWithFines = activeLoans.map(loan => {
            let fine = 0;
            let overdueDays = 0;

            // Calculate due date if missing (migration fallback)
            let dueDate = loan.dueDate;
            if (!dueDate) {
                dueDate = new Date(loan.borrowDate);
                dueDate.setDate(dueDate.getDate() + settings.borrowPeriod);
            }

            if (now > dueDate) {
                const diffTime = Math.abs(now - dueDate);
                overdueDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                fine = overdueDays * finePerDay;
            }

            return {
                ...loan,
                book: loan.bookId, // Flatten/Renamed for convenience
                dueDate,
                fine,
                overdueDays
            };
        });

        res.status(200).json(loansWithFines);
    } catch (error) {
        console.error("Failed to fetch loans:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}
