import { Router } from 'express';

const router = Router();
import { setHeaders, handleAbort, validateModel, buildEndpointOption } from '~/server/middleware';
import validateConvoAccess from '~/server/middleware/validate/convoAccess';
import validateAssistant from '~/server/middleware/assistants/validate';
import chatController from '~/server/controllers/assistants/chatV1';

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
  validateModel,
  buildEndpointOption,
  validateAssistant,
  validateConvoAccess,
  setHeaders,
  chatController,
);

export default router;
