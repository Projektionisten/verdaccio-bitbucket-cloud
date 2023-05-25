import { createClient } from 'redis';

export const getRedisClient = (redisOptions) => {
  const client = createClient(redisOptions);

  return client;
};
