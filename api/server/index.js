require('dotenv').config();
import { resolve, join } from 'path';
require('module-alias')({ base: resolve(__dirname, '..') });
import cors from 'cors';
import { defaults } from 'axios';
import express, { json, urlencoded } from 'express';
import compression from 'compression';
import { initialize, use } from 'passport';
import mongoSanitize from 'express-mongo-sanitize';
import { readFileSync } from 'fs';
import cookieParser from 'cookie-parser';
import { jwtLogin, passportLogin } from '../strategies/index.js';
import { connectDb, indexSync } from '../lib/db/index.js';
import { isEnabled } from './utils/index.js';
import { ldapLogin } from '../strategies/index.js';
import { logger } from '../config/index.js';
import validateImageRequest from './middleware/validateImageRequest.js';
import errorController from './controllers/ErrorController.js';
import configureSocialLogins from './socialLogins.js';
import AppService from './services/AppService.js';
import { staticCache } from './utils/staticCache.js';
import noIndex from './middleware/noIndex.js';
import { oauth, auth, actions, keys, user, search, ask, edit, messages, convos,
   presets, prompts, categories, tokenizer, endpoints, balance, models, plugins, 
   config, assistants, files, staticRoute, share, roles, agents, banner, bedrock, tags }
   from './routes/index.js';

const { PORT, HOST, ALLOW_SOCIAL_LOGIN, DISABLE_COMPRESSION, TRUST_PROXY } = process.env ?? {};

const port = Number(PORT) || 3080;
const host = HOST || 'localhost';
const trusted_proxy = Number(TRUST_PROXY) || 1; /* trust first proxy by default */

const startServer = async () => {
  if (typeof Bun !== 'undefined') {
    defaults.headers.common['Accept-Encoding'] = 'gzip';
  }
  await connectDb();
  logger.info('Connected to MongoDB');
  await indexSync();

  const app = express();
  app.disable('x-powered-by');
  await AppService(app);

  const indexPath = join(app.locals.paths.dist, 'index.html');
  const indexHTML = readFileSync(indexPath, 'utf8');

  app.get('/health', (_req, res) => res.status(200).send('OK'));

  /* Middleware */
  app.use(noIndex);
  app.use(errorController);
  app.use(json({ limit: '3mb' }));
  app.use(mongoSanitize());
  app.use(urlencoded({ extended: true, limit: '3mb' }));
  app.use(staticCache(app.locals.paths.dist));
  app.use(staticCache(app.locals.paths.fonts));
  app.use(staticCache(app.locals.paths.assets));
  app.set('trust proxy', trusted_proxy);
  app.use(cors());
  app.use(cookieParser());

  if (!isEnabled(DISABLE_COMPRESSION)) {
    app.use(compression());
  }

  if (!ALLOW_SOCIAL_LOGIN) {
    console.warn(
      'Social logins are disabled. Set Environment Variable "ALLOW_SOCIAL_LOGIN" to true to enable them.',
    );
  }

  /* OAUTH */
  app.use(initialize());
  use(await jwtLogin());
  use(passportLogin());

  /* LDAP Auth */
  if (process.env.LDAP_URL && process.env.LDAP_USER_SEARCH_BASE) {
    use(ldapLogin);
  }

  if (isEnabled(ALLOW_SOCIAL_LOGIN)) {
    configureSocialLogins(app);
  }

  app.use('/oauth', oauth);
  /* API Endpoints */
  app.use('/api/auth', auth);
  app.use('/api/actions', actions);
  app.use('/api/keys', keys);
  app.use('/api/user', user);
  app.use('/api/search', search);
  app.use('/api/ask', ask);
  app.use('/api/edit', edit);
  app.use('/api/messages', messages);
  app.use('/api/convos', convos);
  app.use('/api/presets', presets);
  app.use('/api/prompts', prompts);
  app.use('/api/categories', categories);
  app.use('/api/tokenizer', tokenizer);
  app.use('/api/endpoints', endpoints);
  app.use('/api/balance', balance);
  app.use('/api/models', models);
  app.use('/api/plugins', plugins);
  app.use('/api/config', config);
  app.use('/api/assistants', assistants);
  app.use('/api/files', await files.initialize());
  app.use('/images/', validateImageRequest, staticRoute);
  app.use('/api/share', share);
  app.use('/api/roles', roles);
  app.use('/api/agents', agents);
  app.use('/api/banner', banner);
  app.use('/api/bedrock', bedrock);

  app.use('/api/tags', tags);

  app.use((req, res) => {
    res.set({
      'Cache-Control': process.env.INDEX_CACHE_CONTROL || 'no-cache, no-store, must-revalidate',
      Pragma: process.env.INDEX_PRAGMA || 'no-cache',
      Expires: process.env.INDEX_EXPIRES || '0',
    });

    const lang = req.cookies.lang || req.headers['accept-language']?.split(',')[0] || 'en-US';
    const saneLang = lang.replace(/"/g, '&quot;');
    const updatedIndexHtml = indexHTML.replace(/lang="en-US"/g, `lang="${saneLang}"`);
    res.type('html');
    res.send(updatedIndexHtml);
  });

  app.listen(port, host, () => {
    if (host == '0.0.0.0') {
      logger.info(
        `Server listening on all interfaces at port ${port}. Use http://localhost:${port} to access it`,
      );
    } else {
      logger.info(`Server listening at http://${host == '0.0.0.0' ? 'localhost' : host}:${port}`);
    }
  });
};

startServer();

let messageCount = 0;
process.on('uncaughtException', (err) => {
  if (!err.message.includes('fetch failed')) {
    logger.error('There was an uncaught error:', err);
  }

  if (err.message.includes('abort')) {
    logger.warn('There was an uncatchable AbortController error.');
    return;
  }

  if (err.message.includes('GoogleGenerativeAI')) {
    logger.warn(
      '\n\n`GoogleGenerativeAI` errors cannot be caught due to an upstream issue, see: https://github.com/google-gemini/generative-ai-js/issues/303',
    );
    return;
  }

  if (err.message.includes('fetch failed')) {
    if (messageCount === 0) {
      logger.warn('Meilisearch error, search will be disabled');
      messageCount++;
    }

    return;
  }

  if (err.message.includes('OpenAIError') || err.message.includes('ChatCompletionMessage')) {
    logger.error(
      '\n\nAn Uncaught `OpenAIError` error may be due to your reverse-proxy setup or stream configuration, or a bug in the `openai` node package.',
    );
    return;
  }

  process.exit(1);
});
