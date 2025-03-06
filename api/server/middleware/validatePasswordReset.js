import { isEnabled } from '~/server/utils';
import _default from '~/config';
const { logger } = _default;

function validatePasswordReset(req, res, next) {
  if (isEnabled(process.env.ALLOW_PASSWORD_RESET)) {
    next();
  } else {
    logger.warn(`Password reset attempt while not allowed. IP: ${req.ip}`);
    res.status(403).send('Password reset is not allowed.');
  }
}

export default validatePasswordReset;
