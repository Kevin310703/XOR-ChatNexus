import { EModelEndpoint } from 'librechat-data-provider';
import { config } from '~/server/services/Config/EndpointService';
const { useAzurePlugins } = config;
import { getOpenAIModels, getGoogleModels, getBedrockModels, getAnthropicModels, getChatGPTBrowserModels } from '~/server/services/ModelService';

/**
 * Loads the default models for the application.
 * @async
 * @function
 * @param {Express.Request} req - The Express request object.
 */
async function loadDefaultModels(req) {
  const google = getGoogleModels();
  const openAI = await getOpenAIModels({ user: req.user.id });
  const anthropic = getAnthropicModels();
  const chatGPTBrowser = getChatGPTBrowserModels();
  const azureOpenAI = await getOpenAIModels({ user: req.user.id, azure: true });
  const gptPlugins = await getOpenAIModels({
    user: req.user.id,
    azure: useAzurePlugins,
    plugins: true,
  });
  const assistants = await getOpenAIModels({ assistants: true });
  const azureAssistants = await getOpenAIModels({ azureAssistants: true });

  return {
    [EModelEndpoint.openAI]: openAI,
    [EModelEndpoint.agents]: openAI,
    [EModelEndpoint.google]: google,
    [EModelEndpoint.anthropic]: anthropic,
    [EModelEndpoint.gptPlugins]: gptPlugins,
    [EModelEndpoint.azureOpenAI]: azureOpenAI,
    [EModelEndpoint.chatGPTBrowser]: chatGPTBrowser,
    [EModelEndpoint.assistants]: assistants,
    [EModelEndpoint.azureAssistants]: azureAssistants,
    [EModelEndpoint.bedrock]: getBedrockModels(),
  };
}

export default loadDefaultModels;
