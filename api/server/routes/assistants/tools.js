import { Router } from 'express';
import { getAvailableTools } from '~/server/controllers/PluginController';

const router = Router();

router.get('/', getAvailableTools);

export default router;
