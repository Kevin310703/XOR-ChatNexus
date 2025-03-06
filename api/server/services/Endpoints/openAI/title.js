import { CacheKeys } from 'librechat-data-provider';
import getLogStores from '~/cache/getLogStores';
import __default from '~/server/utils';
const { isEnabled } = __default;
import _default from '~/models';
const { saveConvo } = _default;

const addTitle = async (req, { text, response, client }) => {
  const { TITLE_CONVO = 'true' } = process.env ?? {};
  if (!isEnabled(TITLE_CONVO)) {
    return;
  }

  if (client.options.titleConvo === false) {
    return;
  }

  // If the request was aborted and is not azure, don't generate the title.
  if (!client.azure && client.abortController.signal.aborted) {
    return;
  }

  const titleCache = getLogStores(CacheKeys.GEN_TITLE);
  const key = `${req.user.id}-${response.conversationId}`;

  const title = await client.titleConvo({
    text,
    responseText: response?.text ?? '',
    conversationId: response.conversationId,
  });
  await titleCache.set(key, title, 120000);
  await saveConvo(
    req,
    {
      conversationId: response.conversationId,
      title,
    },
    { context: 'api/server/services/Endpoints/openAI/addTitle.js' },
  );
};

export default addTitle;
