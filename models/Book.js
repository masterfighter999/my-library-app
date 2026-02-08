import mongoose from 'mongoose';

const BookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  isbn: { type: String, unique: true },
  status: { type: String, enum: ['available', 'borrowed'], default: 'available' },
  copies: { type: Number, default: 1 },
});

// Checks if model exists to prevent Next.js recompilation errors
export default mongoose.models.Book || mongoose.model('Book', BookSchema);