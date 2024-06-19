import sha1 from 'sha1';
import { v4 as uuidv4 } from 'uuid';

import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const SENCONDS_IN_DAY = 24 * 60 * 60;

async function getConnect(req, res) {
  const authHeader = req.header('authorization');
  if (!authHeader || authHeader.slice(0, 6) !== 'Basic ') {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const b64EncodedAuth = authHeader.slice(6).trim();
  const [email, password] = Buffer.from(b64EncodedAuth, 'base64').toString().split(/(?<!.*:.*):/);

  const user = await dbClient.collectionFindOne('users', { email, password: sha1(password) });

  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const token = uuidv4();
  await redisClient.set(`auth_${token}`, user._id.toString(), SENCONDS_IN_DAY);
  res.status(200).json({ token });
}

async function getDisconnect(req, res) {
  const token = (req.header('X-token') || '').trim();
  const userId = await redisClient.get(`auth_${token}`);
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  await redisClient.del(`auth_${token}`);
  res.status(204).send();
}

export { getConnect, getDisconnect };
