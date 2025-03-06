import { Router } from 'express';
import modelControllerDefault from '~/server/controllers/ModelController';
const { modelController } = modelControllerDefault;
import _default from '~/server/middleware/';
const { requireJwtAuth } = _default;

const router = Router();
router.get('/', requireJwtAuth, modelController);

export default router;
