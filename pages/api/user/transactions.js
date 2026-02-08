import dbConnect from '../../../lib/mongodb';
import Transaction from '../../../models/Transaction';
import SystemSettings from '../../../models/SystemSettings';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    await dbConnect();

    try {
        const settings = await SystemSettings.getSettings();
        const finePerDay = settings.finePerDay;

        const transactions = await Transaction.find({
            userId: session.user.email,
            status: 'active'
        }).lean();

        const now = new Date();
        const transactionsWithFines = transactions.map(t => {
            let fine = 0;
            let dueDate = t.dueDate;

            // Fallback for old records
            if (!dueDate) {
                dueDate = new Date(t.borrowDate);
                dueDate.setDate(dueDate.getDate() + settings.borrowPeriod);
            }

            if (now > dueDate) {
                const diffTime = Math.abs(now - dueDate);
                const overdueDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                fine = overdueDays * finePerDay;
            }

            return { ...t, fine, dueDate };
        });

        // Return both the IDs (for UI state) and full objects (for display)
        res.status(200).json({
            borrowedBookIds: transactions.map(t => t.bookId.toString()),
            activeLoans: transactionsWithFines
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}
