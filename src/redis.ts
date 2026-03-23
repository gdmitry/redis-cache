import { createClient, RedisClientType } from 'redis';

// create and configure a shared Redis client instance
export const client: RedisClientType = createClient({
  url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
  password: process.env.REDIS_PASSWORD,
});

client.on('error', (err: Error) => {
  console.error('Redis connection error:', err);
});

export async function connectRedis(): Promise<void> {
  await client.connect();
  console.log('Successfully connected to Redis');
}
