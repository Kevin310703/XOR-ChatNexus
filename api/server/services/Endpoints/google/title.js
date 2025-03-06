import { EModelEndpoint, CacheKeys, Constants, googleSettings } from 'librechat-data-provider';
import getLogStores from '~/cache/getLogStores';
import initializeClient from './initialize';
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
  const { GOOGLE_TITLE_MODEL } = process.env ?? {};
  const providerConfig = req.app.locals[EModelEndpoint.google];
  let model =
    providerConfig?.titleModel ??
    GOOGLE_TITLE_MODEL ??
    client.options?.modelOptions.model ??
    googleSettings.model.default;

  if (GOOGLE_TITLE_MODEL === Constants.CURRENT_MODEL) {
    model = client.options?.modelOptions.model;
  }

  const titleEndpointOptions = {
    ...client.options,
    modelOptions: { ...client.options?.modelOptions, model: model },
    attachments: undefined, // After a response, this is set to an empty array which results in an error during setOptions
  };

  const { client: titleClient } = await initializeClient({
    req,
    res: response,
    endpointOption: titleEndpointOptions,
  });

  const titleCache = getLogStores(CacheKeys.GEN_TITLE);
  const key = `${req.user.id}-${response.conversationId}`;

  const title = await titleClient.titleConvo({
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
    { context: 'api/server/services/Endpoints/google/addTitle.js' },
  );
};

export default addTitle;
