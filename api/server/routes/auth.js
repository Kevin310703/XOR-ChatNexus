import { Router } from 'express';
import authControllerDefault from '~/server/controllers/AuthController';
const {
  refreshController, registrationController, resetPasswordController, resetPasswordRequestController,
} = authControllerDefault;
import _default from '~/server/controllers/auth/LoginController';
const { loginController } = _default;
import __default from '~/server/controllers/auth/LogoutController';
const { logoutController } = __default;
import ___default from '~/server/controllers/auth/TwoFactorAuthController';
const { verify2FA } = ___default;
import ____default from '~/server/controllers/TwoFactorController';
const {
  enable2FAController, verify2FAController, disable2FAController, regenerateBackupCodesController, confirm2FAController,
} = ____default;
import _____default from '~/server/middleware';
const {
  checkBan, loginLimiter, requireJwtAuth, checkInviteUser, registerLimiter, requireLdapAuth, requireLocalAuth, resetPasswordLimiter, validateRegistration, validatePasswordReset,
} = _____default;

const router = Router();

const ldapAuth = !!process.env.LDAP_URL && !!process.env.LDAP_USER_SEARCH_BASE;
//Local
router.post('/logout', requireJwtAuth, logoutController);
router.post(
  '/login',
  loginLimiter,
  checkBan,
  ldapAuth ? requireLdapAuth : requireLocalAuth,
  loginController,
);
router.post('/refresh', refreshController);
router.post(
  '/register',
  registerLimiter,
  checkBan,
  checkInviteUser,
  validateRegistration,
  registrationController,
);
router.post(
  '/requestPasswordReset',
  resetPasswordLimiter,
  checkBan,
  validatePasswordReset,
  resetPasswordRequestController,
);
router.post('/resetPassword', checkBan, validatePasswordReset, resetPasswordController);

router.get('/2fa/enable', requireJwtAuth, enable2FAController);
router.post('/2fa/verify', requireJwtAuth, verify2FAController);
router.post('/2fa/verify-temp', checkBan, verify2FA);
router.post('/2fa/confirm', requireJwtAuth, confirm2FAController);
router.post('/2fa/disable', requireJwtAuth, disable2FAController);
router.post('/2fa/backup/regenerate', requireJwtAuth, regenerateBackupCodesController);

export default router;
