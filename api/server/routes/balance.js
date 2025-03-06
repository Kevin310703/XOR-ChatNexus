import { Router } from 'express';
const router = Router();
import controller from '../controllers/Balance';
import _default from '../middleware/';
const { requireJwtAuth } = _default;

router.get('/', requireJwtAuth, controller);

export default router;
