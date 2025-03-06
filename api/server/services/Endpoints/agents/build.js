import agent from '~/models/Agent';
const { loadAgent } = agent;
import _default from '~/config';
const { logger } = _default;

const buildOptions = (req, endpoint, parsedBody) => {
  const {
    spec,
    iconURL,
    agent_id,
    instructions,
    maxContextTokens,
    resendFiles = true,
    ...model_parameters
  } = parsedBody;
  const agentPromise = loadAgent({
    req,
    agent_id,
  }).catch((error) => {
    logger.error(`[/agents/:${agent_id}] Error retrieving agent during build options step`, error);
    return undefined;
  });

  const endpointOption = {
    spec,
    iconURL,
    endpoint,
    agent_id,
    resendFiles,
    instructions,
    maxContextTokens,
    model_parameters,
    agent: agentPromise,
  };

  return endpointOption;
};

export default { buildOptions };
