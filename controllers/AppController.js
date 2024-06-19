import redisClient from '../utils/redis';
import dbClient from '../utils/db';

async function getStatus(req, res) {
  const status = {
    redis: await redisClient.isAliveAsync(),
    db: await dbClient.isAliveAsync(),
  };
  res.json(status);
}

async function getStats(req, res) {
  const stats = {
    users: await dbClient.nbUsers(),
    files: await dbClient.nbFiles(),
  };
  res.json(stats);
}

export { getStatus, getStats };
