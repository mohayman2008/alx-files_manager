import fs from 'fs';
import { ObjectId } from 'mongodb';

import dbClient from './utils/db';

const FILES = [
  {
    _id: ObjectId('66762cd2f3513a13ca7c0020'),
    userId: ObjectId('667b422524c1f5d984ee7d2d'),
    name: 'myText.txt',
    type: 'file',
    data: 'SGVsbG8gV2Vic3RhY2shCg==',
    parentId: '0',
    isPublic: false,
    localPath: '/tmp/files_manager/16871943-0ec1-4cc6-82cd-9128a915a2cc',
  },
  {
    _id: ObjectId('66762d5b84ddc4143782fd0e'),
    userId: ObjectId('667b422524c1f5d984ee7d2d'),
    name: 'myText.txt',
    type: 'file',
    isPublic: false,
    parentId: '0',
    localPath: '/tmp/files_manager/534d7793-cd6b-4629-834d-43adbf381c4a',
  },
  {
    _id: ObjectId('66762e0d23aad1147eff9b00'),
    userId: ObjectId('667b422524c1f5d984ee7d2d'),
    name: 'myText.txt',
    type: 'file',
    isPublic: false,
    parentId: '0',
    localPath: '/tmp/files_manager/ccd0f675-7f8e-433d-9c9a-0294130b9c0d',
  },
  {
    _id: ObjectId('66762e59bf2ed814c6971521'),
    userId: ObjectId('667b422524c1f5d984ee7d2d'),
    name: 'myText.txt',
    type: 'file',
    isPublic: false,
    parentId: '0',
    localPath: '/tmp/files_manager/8ffe9e92-5aac-446e-aae4-a8cf55ee0a16',
  },
  {
    _id: ObjectId('66762ed6bf2ed814c6971522'),
    userId: ObjectId('667b422524c1f5d984ee7d2d'),
    name: 'images',
    type: 'folder',
    isPublic: false,
    parentId: '0',
  },
  {
    _id: ObjectId('6676308abf2ed814c6971523'),
    userId: ObjectId('667b422524c1f5d984ee7d2d'),
    name: 'alx-logo.png',
    type: 'image',
    isPublic: false,
    parentId: ObjectId('66762ed6bf2ed814c6971522'),
    localPath: '/tmp/files_manager/19f2d346-ac41-49a5-b2d7-8d3462a32079',
  },
  {
    _id: ObjectId('667631d079b9d81603267ad1'),
    userId: ObjectId('667b422524c1f5d984ee7d2d'),
    name: 'images',
    type: 'folder',
    isPublic: false,
    parentId: '0',
  },
  {
    _id: ObjectId('66763212e8fce3162e5e21ae'),
    userId: ObjectId('667b422524c1f5d984ee7d2d'),
    name: 'images',
    type: 'folder',
    isPublic: false,
    parentId: '0',
  },
  {
    _id: ObjectId('6676323a2afebf166b4abc32'),
    userId: ObjectId('667b422524c1f5d984ee7d2d'),
    name: 'images',
    type: 'folder',
    isPublic: false,
    parentId: '0',
  },
  {
    _id: ObjectId('667632820d408216ad73ff94'),
    userId: ObjectId('667b422524c1f5d984ee7d2d'),
    name: 'images',
    type: 'folder',
    isPublic: false,
    parentId: '0',
  },
  {
    _id: ObjectId('667632920d408216ad73ff95'),
    userId: ObjectId('667b422524c1f5d984ee7d2d'),
    name: 'myText.txt',
    type: 'file',
    isPublic: false,
    parentId: '0',
    localPath: '/tmp/files_manager/e7faaf1b-4a7d-4b31-b314-dfa3835b871d',
  },
];

(async function main() {
  // await dbClient.files.deleteMany({});
  const result = await dbClient.files.insertMany(FILES);

  console.log(await result.ops);

  FILES.forEach(async (file) => {
    const data = file.data || '';
    if (file.localPath) {
      await fs.writeFileSync(file.localPath, Buffer.from(data, 'base64'));
      console.log(`${file.localPath} created successfully!`);
    }
  });
}());

// dbClient.files.find({}).toArray().then(console.log);
