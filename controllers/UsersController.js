import sha1 from 'sha1';

import dbClient from '../utils/db';

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

export { postNew as default, postNew };
