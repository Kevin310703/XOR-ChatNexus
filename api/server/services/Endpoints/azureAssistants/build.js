import { removeNullishValues } from 'librechat-data-provider';
import generateArtifactsPrompt from '~/app/clients/prompts/artifacts';
import assistantDefault from '~/models/Assistant';
const { getAssistant } = assistantDefault;

const buildOptions = async (endpoint, parsedBody) => {

  const { promptPrefix, assistant_id, iconURL, greeting, spec, artifacts, ...modelOptions } =
    parsedBody;
  const endpointOption = removeNullishValues({
    endpoint,
    promptPrefix,
    assistant_id,
    iconURL,
    greeting,
    spec,
    modelOptions,
  });

  if (assistant_id) {
    const assistantDoc = await getAssistant({ assistant_id });
    if (assistantDoc) {
      endpointOption.assistant = {
        append_current_datetime: assistantDoc.append_current_datetime,
        assistant_id: assistantDoc.assistant_id,
        conversation_starters: assistantDoc.conversation_starters,
        createdAt: assistantDoc.createdAt,
        updatedAt: assistantDoc.updatedAt,
      };
    }
  }

  if (typeof artifacts === 'string') {
    endpointOption.artifactsPrompt = generateArtifactsPrompt({ endpoint, artifacts });
  }

  return endpointOption;
};

export default buildOptions;
