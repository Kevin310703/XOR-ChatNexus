import rateLimit from 'express-rate-limit';
import { ViolationTypes } from 'librechat-data-provider';
import { removePorts } from '~/server/utils';
import _default from '~/cache';
const { logViolation } = _default;

const {
  VERIFY_EMAIL_WINDOW = 2,
  VERIFY_EMAIL_MAX = 2,
  VERIFY_EMAIL_VIOLATION_SCORE: score,
} = process.env;
const windowMs = VERIFY_EMAIL_WINDOW * 60 * 1000;
const max = VERIFY_EMAIL_MAX;
const windowInMinutes = windowMs / 60000;
const message = `Too many attempts, please try again after ${windowInMinutes} minute(s)`;

const handler = async (req, res) => {
  const type = ViolationTypes.VERIFY_EMAIL_LIMIT;
  const errorMessage = {
    type,
    max,
    windowInMinutes,
  };

  await logViolation(req, res, type, errorMessage, score);
  return res.status(429).json({ message });
};

const verifyEmailLimiter = rateLimit({
  windowMs,
  max,
  handler,
  keyGenerator: removePorts,
});

export default verifyEmailLimiter;
