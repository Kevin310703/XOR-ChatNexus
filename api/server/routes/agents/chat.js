import { Router } from 'express';
import { PermissionTypes, Permissions } from 'librechat-data-provider';
import middlewareDefault from '~/server/middleware';
const {
  setHeaders, handleAbort,
  // validateModel,
  generateCheckAccess, validateConvoAccess, buildEndpointOption,
} = middlewareDefault;
import { initializeClient } from '~/server/services/Endpoints/agents';
import AgentController from '~/server/controllers/agents/request';
import addTitle from '~/server/services/Endpoints/agents/title';

const router = Router();

router.post('/abort', handleAbort());

const checkAgentAccess = generateCheckAccess(PermissionTypes.AGENTS, [Permissions.USE]);

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
  checkAgentAccess,
  validateConvoAccess,
  buildEndpointOption,
  setHeaders,
  async (req, res, next) => {
    await AgentController(req, res, next, initializeClient, addTitle);
  },
);

export default router;
