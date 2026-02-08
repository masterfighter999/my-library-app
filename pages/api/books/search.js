import dbConnect from '../../../lib/mongodb';
import Book from '../../../models/Book';
import redis from '../../../lib/redis';

export default async function handler(req, res) {
  const { q } = req.query;
  const query = q ? q.toLowerCase() : '';
  const cacheKey = query ? `search:${query}` : 'books:all';

  // 1. CACHE STRATEGY: Check Redis first
  let cachedData = null;
  try {
    cachedData = await redis.get(cacheKey);
  } catch (error) {
    console.error("Redis connection error:", error);
    // Continue to MongoDB if Redis fails
  }

  if (cachedData) {
    return res.status(200).json({
      source: 'redis',
      latency: 'fast',
      data: typeof cachedData === 'string' ? JSON.parse(cachedData) : cachedData
    });
  }

  // 2. DATABASE STRATEGY: Fallback to MongoDB
  await dbConnect();

  const filter = query
    ? {
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { author: { $regex: query, $options: 'i' } }
      ]
    }
    : {};

  const books = await Book.find(filter);

  // 3. WRITE TO CACHE: Save for next time (expires in 60s)
  try {
    await redis.set(cacheKey, JSON.stringify(books), { ex: 60 });
  } catch (error) {
    console.error("Redis write error:", error);
  }

  return res.status(200).json({
    source: 'mongodb',
    latency: 'slow',
    data: books
  });
}