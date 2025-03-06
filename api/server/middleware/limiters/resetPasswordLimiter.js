import rateLimit from 'express-rate-limit';
import { ViolationTypes } from 'librechat-data-provider';
import { removePorts } from '~/server/utils';
import _default from '~/cache';
const { logViolation } = _default;

const {
  RESET_PASSWORD_WINDOW = 2,
  RESET_PASSWORD_MAX = 2,
  RESET_PASSWORD_VIOLATION_SCORE: score,
} = process.env;
const windowMs = RESET_PASSWORD_WINDOW * 60 * 1000;
const max = RESET_PASSWORD_MAX;
const windowInMinutes = windowMs / 60000;
const message = `Too many attempts, please try again after ${windowInMinutes} minute(s)`;

const handler = async (req, res) => {
  const type = ViolationTypes.RESET_PASSWORD_LIMIT;
  const errorMessage = {
    type,
    max,
    windowInMinutes,
  };

  await logViolation(req, res, type, errorMessage, score);
  return res.status(429).json({ message });
};

const resetPasswordLimiter = rateLimit({
  windowMs,
  max,
  handler,
  keyGenerator: removePorts,
});

export default resetPasswordLimiter;
