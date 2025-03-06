import { Router } from 'express';
const router = Router();
import _default from '~/server/middleware';
const {
  uaParser, checkBan, requireJwtAuth,
  // concurrentLimiter,
  // messageIpLimiter,
  // messageUserLimiter,
} = _default;

import chat from './chat';

router.use(requireJwtAuth);
router.use(checkBan);
router.use(uaParser);
router.use('/chat', chat);

export default router;
