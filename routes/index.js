import express from 'express';

import { getStatus, getStats } from '../controllers/AppController';
import { getConnect, getDisconnect } from '../controllers/AuthController';
import {
  getFile, getShow, getIndex, postUpload, putPublish, putUnpublish,
} from '../controllers/FilesController';
import { postNew, getMe } from '../controllers/UsersController';

const router = express.Router();

router.get('/status', getStatus);
router.get('/stats', getStats);
router.get('/connect', getConnect);
router.get('/disconnect', getDisconnect);
router.get('/users/me', getMe);
router.get('/files/:id/data', getFile);
router.get('/files/:id', getShow);
router.get('/files', getIndex);

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.post('/users', postNew);
router.post('/files', postUpload);

router.put('/files/:id/publish', putPublish);
router.put('/files/:id/unpublish', putUnpublish);

export default router;
