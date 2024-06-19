import express from 'express';

import { getStatus, getStats } from '../controllers/AppController';
import { postNew } from '../controllers/UsersController';

const router = express.Router();

router.get('/status', getStatus);
router.get('/stats', getStats);

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.post('/users', postNew);

export default router;
