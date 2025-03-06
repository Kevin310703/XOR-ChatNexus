import { Router } from 'express';
import _default from '~/server/middleware';
const { createTTSLimiters, createSTTLimiters } = _default;

import stt from './stt';
import tts from './tts';
import customConfigSpeech from './customConfigSpeech';

const router = Router();

const { sttIpLimiter, sttUserLimiter } = createSTTLimiters();
const { ttsIpLimiter, ttsUserLimiter } = createTTSLimiters();
router.use('/stt', sttIpLimiter, sttUserLimiter, stt);
router.use('/tts', ttsIpLimiter, ttsUserLimiter, tts);

router.use('/config', customConfigSpeech);

export default router;
