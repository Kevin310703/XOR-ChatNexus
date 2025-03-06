import createTTSLimiters from './ttsLimiters';
import createSTTLimiters from './sttLimiters';

import loginLimiter from './loginLimiter';
import importLimiters from './importLimiters';
import uploadLimiters from './uploadLimiters';
import registerLimiter from './registerLimiter';
import toolCallLimiter from './toolCallLimiter';
import messageLimiters from './messageLimiters';
import verifyEmailLimiter from './verifyEmailLimiter';
import resetPasswordLimiter from './resetPasswordLimiter';

export default {
  ...uploadLimiters,
  ...importLimiters,
  ...messageLimiters,
  loginLimiter,
  registerLimiter,
  toolCallLimiter,
  createTTSLimiters,
  createSTTLimiters,
  verifyEmailLimiter,
  resetPasswordLimiter,
};
