import { Router } from 'express';
const router = Router();
import endpointController from '../controllers/EndpointController.js';
import overrideController from '..//controllers/OverrideController.js';

router.get('/', endpointController);
router.get('/config/override', overrideController);

export default router;
