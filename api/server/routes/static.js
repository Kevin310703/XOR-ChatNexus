import { Router } from 'express';
import staticCache from '../utils/staticCache.js';
import { imageOutput } from '../../config/paths.js';

const router = Router();
router.use(staticCache(imageOutput));

export default router;
