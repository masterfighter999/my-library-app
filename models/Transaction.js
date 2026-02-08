import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
    userId: { type: String, required: true }, // Storing email or unique ID from session
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    borrowDate: { type: Date, default: Date.now },
    dueDate: { type: Date },
    returnDate: { type: Date },
    status: { type: String, enum: ['active', 'returned'], default: 'active' },
    fine: { type: Number, default: 0 }
});

// Prevent recompilation errors
export default mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);
