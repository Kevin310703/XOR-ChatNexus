import Redis from 'ioredis';
import pkg from 'passport';
const { use, session: _session } = pkg;
import session from 'express-session';
const MemoryStore = require('memorystore')(session);
import RedisStore from 'connect-redis';
import * as strategies from '../strategies/index.js';
const { setupOpenId, googleLogin, githubLogin, discordLogin, facebookLogin, appleLogin } = strategies;
import * as handleTextUtils from './utils/handleText.js';
const { isEnabled } = handleTextUtils;
import logger from '../config/meiliLogger.js';

/**
 *
 * @param {Express.Application} app
 */
const configureSocialLogins = (app) => {
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    use(googleLogin());
  }
  if (process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET) {
    use(facebookLogin());
  }
  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    use(githubLogin());
  }
  if (process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET) {
    use(discordLogin());
  }
  if (process.env.APPLE_CLIENT_ID && process.env.APPLE_PRIVATE_KEY_PATH) {
    use(appleLogin());
  }
  if (
    process.env.OPENID_CLIENT_ID &&
    process.env.OPENID_CLIENT_SECRET &&
    process.env.OPENID_ISSUER &&
    process.env.OPENID_SCOPE &&
    process.env.OPENID_SESSION_SECRET
  ) {
    const sessionOptions = {
      secret: process.env.OPENID_SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
    };
    if (isEnabled(process.env.USE_REDIS)) {
      const client = new Redis(process.env.REDIS_URI);
      client
        .on('error', (err) => logger.error('ioredis error:', err))
        .on('ready', () => logger.info('ioredis successfully initialized.'))
        .on('reconnecting', () => logger.info('ioredis reconnecting...'));
      sessionOptions.store = new RedisStore({ client, prefix: 'librechat' });
    } else {
      sessionOptions.store = new MemoryStore({
        checkPeriod: 86400000, // prune expired entries every 24h
      });
    }
    app.use(session(sessionOptions));
    app.use(_session());
    setupOpenId();
  }
};

export default configureSocialLogins;