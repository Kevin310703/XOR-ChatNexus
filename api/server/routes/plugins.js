import { Router } from 'express';
import _default from '../controllers/PluginController';
const { getAvailablePluginsController } = _default;
import requireJwtAuth from '../middleware/requireJwtAuth';

const router = Router();

router.get('/', requireJwtAuth, getAvailablePluginsController);

export default router;
