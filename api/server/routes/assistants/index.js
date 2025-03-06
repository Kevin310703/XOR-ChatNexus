import { Router } from 'express';
const router = Router();
import { uaParser, checkBan, requireJwtAuth } from '../../middleware/index.js';

import { v1 } from './v1.js';
import chatV1 from './chatV1.js';
import v2 from './v2.js';
import chatV2 from './chatV2.js';

router.use(requireJwtAuth);
router.use(checkBan);
router.use(uaParser);
router.use('/v1/', v1);
router.use('/v1/chat', chatV1);
router.use('/v2/', v2);
router.use('/v2/chat', chatV2);

export default router;
