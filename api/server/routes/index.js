import assistants from './assistants/index.js';
import categories from './categories.js';
import tokenizer from './tokenizer.js';
import endpoints from './endpoints.js';
import staticRoute from './static.js';
import messages from './messages.js';
import presets from './presets.js';
import prompts from './prompts.js';
import balance from './balance.js';
import plugins from './plugins.js';
import bedrock from './bedrock/index.js';
import actions from './actions.js';
import search from './search.js';
import models from './models.js';
import convos from './convos.js';
import config from './config.js';
import agents from './agents/index.js';
import roles from './roles.js';
import oauth from './oauth.js';
import files from './files/index.js';
import share from './share.js';
import tags from './tags.js';
import auth from './auth.js';
import edit from './edit/index.js';
import keys from './keys.js';
import user from './user.js';
import ask from './ask/index.js';
import banner from './banner.js';

export default {
  ask,
  edit,
  auth,
  keys,
  user,
  tags,
  roles,
  oauth,
  files,
  share,
  agents,
  bedrock,
  convos,
  search,
  prompts,
  config,
  models,
  plugins,
  actions,
  presets,
  balance,
  messages,
  endpoints,
  tokenizer,
  assistants,
  categories,
  staticRoute,
  banner,
};
