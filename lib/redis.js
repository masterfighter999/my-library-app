import { Redis } from '@upstash/redis';

// Initializes the HTTP-based Redis client (Serverless friendly)
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default redis;