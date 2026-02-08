import dbConnect from '../../../lib/mongodb';
import SystemSettings from '../../../models/SystemSettings';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
    await dbConnect();
    const session = await getServerSession(req, res, authOptions);

    if (req.method === 'GET') {
        const settings = await SystemSettings.getSettings();
        return res.status(200).json(settings);
    }

    if (req.method === 'POST') {
        if (!session || session.user.role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden: Admins only' });
        }

        const { borrowPeriod, finePerDay } = req.body;
        let settings = await SystemSettings.findOne();

        if (!settings) {
            settings = new SystemSettings({ borrowPeriod, finePerDay });
        } else {
            settings.borrowPeriod = borrowPeriod;
            settings.finePerDay = finePerDay;
            settings.updatedAt = Date.now();
        }

        await settings.save();
        return res.status(200).json(settings);
    }

    res.status(405).end();
}
