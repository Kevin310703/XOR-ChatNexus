import { Router } from 'express';
const router = Router();
import middlewareDefault from '~/server/middleware';
const {
  uaParser, checkBan, requireJwtAuth,
  // concurrentLimiter,
  // messageIpLimiter,
  // messageUserLimiter,
} = middlewareDefault;

import { v1 } from './v1';
import chat from './chat';

router.use(requireJwtAuth);
router.use(checkBan);
router.use(uaParser);
router.use('/', v1);
router.use('/chat', chat);

export default router;
