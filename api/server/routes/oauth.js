// file deepcode ignore NoRateLimitingForLogin: Rate limiting is handled by the `loginLimiter` middleware
import { Router } from 'express';
import { authenticate } from 'passport';
import middlewareDefault from '~/server/middleware';
const { loginLimiter, checkBan, checkDomainAllowed } = middlewareDefault;
import { setAuthTokens } from '~/server/services/AuthService';
import _default from '~/config';
const { logger } = _default;

const router = Router();

const domains = {
  client: process.env.DOMAIN_CLIENT,
  server: process.env.DOMAIN_SERVER,
};

router.use(loginLimiter);

const oauthHandler = async (req, res) => {
  try {
    await checkDomainAllowed(req, res);
    await checkBan(req, res);
    if (req.banned) {
      return;
    }
    await setAuthTokens(req.user._id, res);
    res.redirect(domains.client);
  } catch (err) {
    logger.error('Error in setting authentication tokens:', err);
  }
};

router.get('/error', (req, res) => {
  // A single error message is pushed by passport when authentication fails.
  logger.error('Error in OAuth authentication:', { message: req.session.messages.pop() });
  res.redirect(`${domains.client}/login`);
});

/**
 * Google Routes
 */
router.get(
  '/google',
  authenticate('google', {
    scope: ['openid', 'profile', 'email'],
    session: false,
  }),
);

router.get(
  '/google/callback',
  authenticate('google', {
    failureRedirect: `${domains.client}/oauth/error`,
    failureMessage: true,
    session: false,
    scope: ['openid', 'profile', 'email'],
  }),
  oauthHandler,
);

/**
 * Facebook Routes
 */
router.get(
  '/facebook',
  authenticate('facebook', {
    scope: ['public_profile'],
    profileFields: ['id', 'email', 'name'],
    session: false,
  }),
);

router.get(
  '/facebook/callback',
  authenticate('facebook', {
    failureRedirect: `${domains.client}/oauth/error`,
    failureMessage: true,
    session: false,
    scope: ['public_profile'],
    profileFields: ['id', 'email', 'name'],
  }),
  oauthHandler,
);

/**
 * OpenID Routes
 */
router.get(
  '/openid',
  authenticate('openid', {
    session: false,
  }),
);

router.get(
  '/openid/callback',
  authenticate('openid', {
    failureRedirect: `${domains.client}/oauth/error`,
    failureMessage: true,
    session: false,
  }),
  oauthHandler,
);

/**
 * GitHub Routes
 */
router.get(
  '/github',
  authenticate('github', {
    scope: ['user:email', 'read:user'],
    session: false,
  }),
);

router.get(
  '/github/callback',
  authenticate('github', {
    failureRedirect: `${domains.client}/oauth/error`,
    failureMessage: true,
    session: false,
    scope: ['user:email', 'read:user'],
  }),
  oauthHandler,
);

/**
 * Discord Routes
 */
router.get(
  '/discord',
  authenticate('discord', {
    scope: ['identify', 'email'],
    session: false,
  }),
);

router.get(
  '/discord/callback',
  authenticate('discord', {
    failureRedirect: `${domains.client}/oauth/error`,
    failureMessage: true,
    session: false,
    scope: ['identify', 'email'],
  }),
  oauthHandler,
);

/**
 * Apple Routes
 */
router.get(
  '/apple',
  authenticate('apple', {
    session: false,
  }),
);

router.post(
  '/apple/callback',
  authenticate('apple', {
    failureRedirect: `${domains.client}/oauth/error`,
    failureMessage: true,
    session: false,
  }),
  oauthHandler,
);

export default router;
