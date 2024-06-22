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
const PAGE_SIZE = 20;

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
    if (!parent) {
      res.status(400).json({ error: 'Parent not found' });
      return;
    }
    if (parent.type !== 'folder') {
      res.status(400).json({ error: 'Parent is not a folder' });
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

async function getShow(req, res) {
  const user = await authenticateUser(req, res);

  if (!user) {
    return;
  }

  let file;
  try {
    file = await dbClient.files.findOne({
      _id: ObjectId(req.params.id),
      userId: user._id,
    });
  } catch (err) {
    console.log(err.message || err.toString());
    file = false;
  }

  if (!file) {
    res.status(404).json({ error: 'Not found' });
    return;
  }

  const result = {
    id: file._id,
    userId: file.userId,
    name: file.name,
    type: file.type,
    isPublic: file.isPublic,
    parentId: file.parentId,
  };

  if (result.type !== 'folder') result.localPath = file.localPath;

  res.json(result);
}

async function getIndex(req, res) {
  const user = await authenticateUser(req, res);

  if (!user) {
    return;
  }

  let parentId;
  if (req.query.parentId) {
    parentId = ObjectId(req.query.parentId);
  } else {
    parentId = '0';
  }
  const page = req.query.page || 0;

  let result;
  try {
    result = await dbClient.files.find(
      { parentId, userId: user._id },
      { skip: PAGE_SIZE * page, limit: PAGE_SIZE },
    ).toArray();
  } catch (err) {
    console.log(err.message || err.toString());
    result = false;
  }

  if (!result) {
    res.status(500).json({ error: 'List retrieval failed' });
    return;
  }

  result = result.map((file) => {
    const obj = {
      id: file._id,
      userId: file.userId,
      name: file.name,
      type: file.type,
      isPublic: file.isPublic,
      parentId: file.parentId,
    };

    if (file.type !== 'folder') obj.localPath = file.localPath;
    return obj;
  });

  res.json(result);
}

export { getShow, getIndex, postUpload };
