import mongoose from 'mongoose';

const SystemSettingsSchema = new mongoose.Schema({
    borrowPeriod: { type: Number, default: 14 }, // Days
    finePerDay: { type: Number, default: 10 },   // Currency unit
    updatedAt: { type: Date, default: Date.now }
});

// Singleton pattern helper
SystemSettingsSchema.statics.getSettings = async function () {
    const settings = await this.findOne();
    if (settings) return settings;
    return await this.create({}); // Create default if not exists
};

export default mongoose.models.SystemSettings || mongoose.model('SystemSettings', SystemSettingsSchema);
