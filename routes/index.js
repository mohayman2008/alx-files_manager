import express from 'express';

import { getStatus, getStats } from '../controllers/AppController';
import { getConnect, getDisconnect } from '../controllers/AuthController';
import { postUpload } from '../controllers/FilesController';
import { postNew, getMe } from '../controllers/UsersController';

const router = express.Router();

router.get('/status', getStatus);
router.get('/stats', getStats);
router.get('/connect', getConnect);
router.get('/disconnect', getDisconnect);
router.get('/users/me', getMe);

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.post('/users', postNew);
router.post('/files', postUpload);

export default router;
