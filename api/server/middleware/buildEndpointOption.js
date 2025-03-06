import { parseCompactConvo, EModelEndpoint, isAgentsEndpoint } from 'librechat-data-provider';
import modelControllerDefault from '~/server/controllers/ModelController';
const { getModelsConfig } = modelControllerDefault
import { buildOptions } from '~/server/services/Endpoints/azureAssistants';
import { buildOptions as _buildOptions } from '~/server/services/Endpoints/assistants';
import { buildOptions as __buildOptions } from '~/server/services/Endpoints/gptPlugins';
import { processFiles } from '~/server/services/Files/process';
import { buildOptions as ___buildOptions } from '~/server/services/Endpoints/anthropic';
import { buildOptions as ____buildOptions } from '~/server/services/Endpoints/bedrock';
import { buildOptions as _____buildOptions } from '~/server/services/Endpoints/openAI';
import { buildOptions as ______buildOptions } from '~/server/services/Endpoints/agents';
import { buildOptions as _______buildOptions } from '~/server/services/Endpoints/custom';
import { buildOptions as ________buildOptions } from '~/server/services/Endpoints/google';
import _default from '~/models/Conversation';
const { getConvoFiles } = _default;
import { handleError } from '~/server/utils';

const buildFunction = {
  [EModelEndpoint.openAI]: _____buildOptions,
  [EModelEndpoint.google]: ________buildOptions,
  [EModelEndpoint.custom]: _______buildOptions,
  [EModelEndpoint.agents]: ______buildOptions,
  [EModelEndpoint.bedrock]: ____buildOptions,
  [EModelEndpoint.azureOpenAI]: _____buildOptions,
  [EModelEndpoint.anthropic]: ___buildOptions,
  [EModelEndpoint.gptPlugins]: __buildOptions,
  [EModelEndpoint.assistants]: _buildOptions,
  [EModelEndpoint.azureAssistants]: buildOptions,
};

async function buildEndpointOption(req, res, next) {
  const { endpoint, endpointType } = req.body;
  let parsedBody;
  try {
    parsedBody = parseCompactConvo({ endpoint, endpointType, conversation: req.body });
  } catch (error) {
    return handleError(res, { text: 'Error parsing conversation' });
  }

  if (req.app.locals.modelSpecs?.list && req.app.locals.modelSpecs?.enforce) {
    /** @type {{ list: TModelSpec[] }}*/
    const { list } = req.app.locals.modelSpecs;
    const { spec } = parsedBody;

    if (!spec) {
      return handleError(res, { text: 'No model spec selected' });
    }

    const currentModelSpec = list.find((s) => s.name === spec);
    if (!currentModelSpec) {
      return handleError(res, { text: 'Invalid model spec' });
    }

    if (endpoint !== currentModelSpec.preset.endpoint) {
      return handleError(res, { text: 'Model spec mismatch' });
    }

    if (
      currentModelSpec.preset.endpoint !== EModelEndpoint.gptPlugins &&
      currentModelSpec.preset.tools
    ) {
      return handleError(res, {
        text: `Only the "${EModelEndpoint.gptPlugins}" endpoint can have tools defined in the preset`,
      });
    }

    try {
      currentModelSpec.preset.spec = spec;
      if (currentModelSpec.iconURL != null && currentModelSpec.iconURL !== '') {
        currentModelSpec.preset.iconURL = currentModelSpec.iconURL;
      }
      parsedBody = parseCompactConvo({
        endpoint,
        endpointType,
        conversation: currentModelSpec.preset,
      });
    } catch (error) {
      return handleError(res, { text: 'Error parsing model spec' });
    }
  }

  try {
    const isAgents = isAgentsEndpoint(endpoint);
    const endpointFn = buildFunction[endpointType ?? endpoint];
    const builder = isAgents ? (...args) => endpointFn(req, ...args) : endpointFn;

    // TODO: use object params
    req.body.endpointOption = await builder(endpoint, parsedBody, endpointType);

    // TODO: use `getModelsConfig` only when necessary
    const modelsConfig = await getModelsConfig(req);
    const { resendFiles = true } = req.body.endpointOption;
    req.body.endpointOption.modelsConfig = modelsConfig;
    if (isAgents && resendFiles && req.body.conversationId) {
      const fileIds = await getConvoFiles(req.body.conversationId);
      const requestFiles = req.body.files ?? [];
      if (requestFiles.length || fileIds.length) {
        req.body.endpointOption.attachments = processFiles(requestFiles, fileIds);
      }
    } else if (req.body.files) {
      // hold the promise
      req.body.endpointOption.attachments = processFiles(req.body.files);
    }
    next();
  } catch (error) {
    return handleError(res, { text: 'Error building endpoint option' });
  }
}

export default buildEndpointOption;
