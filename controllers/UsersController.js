import sha1 from 'sha1';
import { ObjectId } from 'mongodb';

import dbClient from '../utils/db';
import redisClient from '../utils/redis';

async function postNew(req, res) {
  const user = req.body;
  if (user.email === undefined) {
    res.status(400).json({ error: 'Missing email' });
    return;
  }
  if (user.password === undefined) {
    res.status(400).json({ error: 'Missing password' });
    return;
  }
  if (await dbClient.userExists(user.email)) {
    res.status(400).json({ error: 'Already exist' });
    return;
  }

  const userObj = await dbClient.collectionInsertOne('users', {
    email: user.email,
    password: sha1(user.password),
  });

  if (!userObj) {
    res.status(500).json({ error: 'User creation failed' });
    return;
  }

  res.status(201).json({
    id: userObj._id.toString(),
    email: userObj.email,
  });
}

async function getMe(req, res) {
  const token = (req.header('X-token') || '').trim();
  const userId = await redisClient.get(`auth_${token}`);
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const user = await dbClient.collectionFindOne('users', ObjectId(userId), { projection: { email: 1 } });
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  res.status(200).json({ id: user._id.toString(), email: user.email });
}

export { postNew, getMe };
