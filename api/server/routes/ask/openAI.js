import { Router } from 'express';
import AskController from '~/server/controllers/AskController';
import { addTitle, initializeClient } from '~/server/services/Endpoints/openAI';
import _default from '~/server/middleware';
const {
  handleAbort, setHeaders, validateModel, validateEndpoint, buildEndpointOption, moderateText,
} = _default;

const router = Router();
router.use(moderateText);
router.post('/abort', handleAbort());

router.post(
  '/',
  validateEndpoint,
  validateModel,
  buildEndpointOption,
  setHeaders,
  async (req, res, next) => {
    await AskController(req, res, next, initializeClient, addTitle);
  },
);

export default router;
