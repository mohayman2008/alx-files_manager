import express from 'express';

import { getStatus, getStats } from '../controllers/AppController';
import AuthController from '../controllers/AuthController';
import UsersController from '../controllers/UsersController';
import FilesController from '../controllers/FilesController';
import { getUserFromXToken, getUserFromAuthorization } from '../utils/auth';

export const basicAuthenticate = async (req, res, next) => {
  const user = await getUserFromAuthorization(req);

  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  req.user = user;
  next();
};

export const xTokenAuthenticate = async (req, res, next) => {
  const user = await getUserFromXToken(req);

  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  req.user = user;
  next();
};

const router = express.Router();

router.get('/status', getStatus);
router.get('/stats', getStats);
router.get('/connect', AuthController.getConnect);
router.get('/disconnect', AuthController.getDisconnect);
router.get('/users/me', UsersController.getMe);

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.post('/users', UsersController.postNew);

router.post('/files', xTokenAuthenticate, FilesController.postUpload);
router.get('/files/:id', xTokenAuthenticate, FilesController.getShow);
router.get('/files', xTokenAuthenticate, FilesController.getIndex);
router.put('/files/:id/publish', xTokenAuthenticate, FilesController.putPublish);
router.put('/files/:id/unpublish', xTokenAuthenticate, FilesController.putUnpublish);
router.get('/files/:id/data', FilesController.getFile);

export default router;
