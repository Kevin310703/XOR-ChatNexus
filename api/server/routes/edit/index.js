import { Router } from 'express';
import openAI from './openAI';
import custom from './custom';
import google from './google';
import anthropic from './anthropic';
import gptPlugins from './gptPlugins';
import { isEnabled } from '~/server/utils';
import { EModelEndpoint } from 'librechat-data-provider';
import _default from '~/server/middleware';
const {
  checkBan, uaParser, requireJwtAuth, messageIpLimiter, concurrentLimiter, messageUserLimiter, validateConvoAccess,
} = _default;

const { LIMIT_CONCURRENT_MESSAGES, LIMIT_MESSAGE_IP, LIMIT_MESSAGE_USER } = process.env ?? {};

const router = Router();

router.use(requireJwtAuth);
router.use(checkBan);
router.use(uaParser);

if (isEnabled(LIMIT_CONCURRENT_MESSAGES)) {
  router.use(concurrentLimiter);
}

if (isEnabled(LIMIT_MESSAGE_IP)) {
  router.use(messageIpLimiter);
}

if (isEnabled(LIMIT_MESSAGE_USER)) {
  router.use(messageUserLimiter);
}

router.use(validateConvoAccess);

router.use([`/${EModelEndpoint.azureOpenAI}`, `/${EModelEndpoint.openAI}`], openAI);
router.use(`/${EModelEndpoint.gptPlugins}`, gptPlugins);
router.use(`/${EModelEndpoint.anthropic}`, anthropic);
router.use(`/${EModelEndpoint.google}`, google);
router.use(`/${EModelEndpoint.custom}`, custom);

export default router;
