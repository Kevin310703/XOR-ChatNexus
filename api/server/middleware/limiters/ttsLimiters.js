import rateLimit from 'express-rate-limit';
import { ViolationTypes } from 'librechat-data-provider';
import logViolation from '~/cache/logViolation';

const getEnvironmentVariables = () => {
  const TTS_IP_MAX = parseInt(process.env.TTS_IP_MAX) || 100;
  const TTS_IP_WINDOW = parseInt(process.env.TTS_IP_WINDOW) || 1;
  const TTS_USER_MAX = parseInt(process.env.TTS_USER_MAX) || 50;
  const TTS_USER_WINDOW = parseInt(process.env.TTS_USER_WINDOW) || 1;

  const ttsIpWindowMs = TTS_IP_WINDOW * 60 * 1000;
  const ttsIpMax = TTS_IP_MAX;
  const ttsIpWindowInMinutes = ttsIpWindowMs / 60000;

  const ttsUserWindowMs = TTS_USER_WINDOW * 60 * 1000;
  const ttsUserMax = TTS_USER_MAX;
  const ttsUserWindowInMinutes = ttsUserWindowMs / 60000;

  return {
    ttsIpWindowMs,
    ttsIpMax,
    ttsIpWindowInMinutes,
    ttsUserWindowMs,
    ttsUserMax,
    ttsUserWindowInMinutes,
  };
};

const createTTSHandler = (ip = true) => {
  const { ttsIpMax, ttsIpWindowInMinutes, ttsUserMax, ttsUserWindowInMinutes } =
    getEnvironmentVariables();

  return async (req, res) => {
    const type = ViolationTypes.TTS_LIMIT;
    const errorMessage = {
      type,
      max: ip ? ttsIpMax : ttsUserMax,
      limiter: ip ? 'ip' : 'user',
      windowInMinutes: ip ? ttsIpWindowInMinutes : ttsUserWindowInMinutes,
    };

    await logViolation(req, res, type, errorMessage);
    res.status(429).json({ message: 'Too many TTS requests. Try again later' });
  };
};

const createTTSLimiters = () => {
  const { ttsIpWindowMs, ttsIpMax, ttsUserWindowMs, ttsUserMax } = getEnvironmentVariables();

  const ttsIpLimiter = rateLimit({
    windowMs: ttsIpWindowMs,
    max: ttsIpMax,
    handler: createTTSHandler(),
  });

  const ttsUserLimiter = rateLimit({
    windowMs: ttsUserWindowMs,
    max: ttsUserMax,
    handler: createTTSHandler(false),
    keyGenerator: function (req) {
      return req.user?.id; // Use the user ID or NULL if not available
    },
  });

  return { ttsIpLimiter, ttsUserLimiter };
};

export default createTTSLimiters;
