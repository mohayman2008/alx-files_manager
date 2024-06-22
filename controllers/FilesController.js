import fs from 'fs';
import { ObjectId } from 'mongodb';
import { resolve } from 'path';
import { v4 as uuidv4 } from 'uuid';

// import redisClient from '../utils/redis';
import dbClient from '../utils/db';
import { authenticateUser } from './AuthController';

const FILE_TYPES = ['folder', 'file', 'image'];
let FOLDER_PATH;
if (process.env.FOLDER_PATH && process.env.FOLDER_PATH.length) {
  FOLDER_PATH = process.env.FOLDER_PATH;
} else {
  FOLDER_PATH = '/tmp/files_manager';
}

async function postUpload(req, res) {
  const user = await authenticateUser(req, res);

  if (!user) {
    return;
  }
  const params = req.body;
  const { name, type, data } = params;
  if (!name) {
    res.status(400).json({ error: 'Missing name' });
    return;
  }
  if (!type || !FILE_TYPES.includes(type)) {
    res.status(400).json({ error: 'Missing type' });
    return;
  }
  if (type !== 'folder' && !data) {
    res.status(400).json({ error: 'Missing data' });
    return;
  }
  const parentId = params.parentId || 0;
  const isPublic = params.isPublic || false;

  if (parentId !== 0) {
    const parent = await dbClient.files.findOne((ObjectId(parentId)));
    if (!parent || parent.type !== 'folder') {
      res.status(400).json({ error: 'Parent not found' });
      return;
    }
  }

  const file = {
    id: null,
    userId: user._id.toString(),
    name,
    type,
    isPublic,
    parentId,
  };

  if (type !== 'folder') {
    if (!await fs.existsSync(FOLDER_PATH)) {
      await fs.mkdirSync(FOLDER_PATH, { recursive: true });
    }

    const localPath = resolve(FOLDER_PATH, uuidv4());
    await fs.writeFileSync(localPath, Buffer.from(data, 'base64'));
    file.localPath = localPath;
  }

  try {
    await dbClient.files.insertOne(file);
  } catch (err) {
    console.log(err.message || err.toString());
    res.status(500).json({ error: 'File creation failed' });
    await fs.rmSync(file.localPath);
    return;
  }
  file.id = file._id;
  delete file._id;

  res.status(201).json(file);
}

export { postUpload }; // eslint-disable-line import/prefer-default-export
