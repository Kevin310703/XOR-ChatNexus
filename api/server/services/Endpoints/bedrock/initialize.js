import { createContentAggregator } from '@librechat/agents';
import { EModelEndpoint, providerEndpointMap, getResponseSender } from 'librechat-data-provider';
import callbacks from '~/server/controllers/agents/callbacks';
const { getDefaultHandlers } = callbacks;
import getOptions from '~/server/services/Endpoints/bedrock/options';
import AgentClient from '~/server/controllers/agents/client';
import _default from '~/utils';
const { getModelMaxTokens } = _default;

const initializeClient = async ({ req, res, endpointOption }) => {
  if (!endpointOption) {
    throw new Error('Endpoint option not provided');
  }

  /** @type {Array<UsageMetadata>} */
  const collectedUsage = [];
  const { contentParts, aggregateContent } = createContentAggregator();
  const eventHandlers = getDefaultHandlers({ res, aggregateContent, collectedUsage });

  /** @type {Agent} */
  const agent = {
    id: EModelEndpoint.bedrock,
    name: endpointOption.name,
    instructions: endpointOption.promptPrefix,
    provider: EModelEndpoint.bedrock,
    model: endpointOption.model_parameters.model,
    model_parameters: endpointOption.model_parameters,
  };

  if (typeof endpointOption.artifactsPrompt === 'string' && endpointOption.artifactsPrompt) {
    agent.instructions = `${agent.instructions ?? ''}\n${endpointOption.artifactsPrompt}`.trim();
  }

  // TODO: pass-in override settings that are specific to current run
  const options = await getOptions({
    req,
    res,
    endpointOption,
  });

  agent.model_parameters = Object.assign(agent.model_parameters, options.llmConfig);
  if (options.configOptions) {
    agent.model_parameters.configuration = options.configOptions;
  }

  const sender =
    agent.name ??
    getResponseSender({
      ...endpointOption,
      model: endpointOption.model_parameters.model,
    });

  const client = new AgentClient({
    req,
    agent,
    sender,
    // tools,
    contentParts,
    eventHandlers,
    collectedUsage,
    spec: endpointOption.spec,
    iconURL: endpointOption.iconURL,
    endpoint: EModelEndpoint.bedrock,
    resendFiles: endpointOption.resendFiles,
    maxContextTokens:
      endpointOption.maxContextTokens ??
      agent.max_context_tokens ??
      getModelMaxTokens(agent.model_parameters.model, providerEndpointMap[agent.provider]) ??
      4000,
    attachments: endpointOption.attachments,
  });
  return { client };
};

export default { initializeClient };
