import sha1 from 'sha1';
import { v4 as uuidv4 } from 'uuid';

import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const SENCONDS_IN_DAY = 24 * 60 * 60;

function errorUnauthorized(res) {
  res.status(401).json({ error: 'Unauthorized' });
}

async function getConnect(req, res) {
  const authHeader = req.header('authorization');
  if (!authHeader || authHeader.slice(0, 6) !== 'Basic ') { return errorUnauthorized(res); }

  const b64EncodedAuth = authHeader.slice(6).trim();
  const [email, password] = Buffer.from(b64EncodedAuth, 'base64').toString('utf8').split(/(?<!.*:.*):/);
  if (!password) { return errorUnauthorized(res); }

  let user;
  try {
    user = dbClient.users.findOne('users', { email, password: sha1(password) });
  } catch (err) {
    console.log(err.message || err.toString());
    user = false;
  }
  if (!user) { return errorUnauthorized(res); }

  const token = uuidv4();
  await redisClient.set(`auth_${token}`, user._id.toString(), SENCONDS_IN_DAY);
  return res.status(200).json({ token });
}

async function getDisconnect(req, res) {
  const token = (req.header('X-token') || '').trim();
  const userId = await redisClient.get(`auth_${token}`);
  if (!userId) { return errorUnauthorized(res); }

  await redisClient.del(`auth_${token}`);
  return res.status(204).send();
}

export { getConnect, getDisconnect };
