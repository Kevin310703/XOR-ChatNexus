import { Router } from 'express';

const router = Router();
import _default from '~/server/middleware';
const {
  setHeaders, handleAbort,
  // validateModel,
  // validateEndpoint,
  buildEndpointOption,
} = _default;
import { initializeClient } from '~/server/services/Endpoints/bedrock';
import AgentController from '~/server/controllers/agents/request';
import addTitle from '~/server/services/Endpoints/agents/title';

router.post('/abort', handleAbort());

/**
 * @route POST /
 * @desc Chat with an assistant
 * @access Public
 * @param {express.Request} req - The request object, containing the request data.
 * @param {express.Response} res - The response object, used to send back a response.
 * @returns {void}
 */
router.post(
  '/',
  // validateModel,
  // validateEndpoint,
  buildEndpointOption,
  setHeaders,
  async (req, res, next) => {
    await AgentController(req, res, next, initializeClient, addTitle);
  },
);

export default router;
