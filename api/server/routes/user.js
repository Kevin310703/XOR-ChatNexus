import { Router } from 'express';
import middlewareDefault from '~/server/middleware';
const { requireJwtAuth, canDeleteAccount, verifyEmailLimiter } = middlewareDefault;
import _default from '~/server/controllers/UserController';
const {
  getUserController, deleteUserController, verifyEmailController, updateUserPluginsController, resendVerificationController, getTermsStatusController, acceptTermsController,
} = _default;

const router = Router();

router.get('/', requireJwtAuth, getUserController);
router.get('/terms', requireJwtAuth, getTermsStatusController);
router.post('/terms/accept', requireJwtAuth, acceptTermsController);
router.post('/plugins', requireJwtAuth, updateUserPluginsController);
router.delete('/delete', requireJwtAuth, canDeleteAccount, deleteUserController);
router.post('/verify', verifyEmailController);
router.post('/verify/resend', verifyEmailLimiter, resendVerificationController);

export default router;
