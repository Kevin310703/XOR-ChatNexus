import { Router } from 'express';
import EditController from '~/server/controllers/EditController';
import { initializeClient } from '~/server/services/Endpoints/openAI';
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
    await EditController(req, res, next, initializeClient);
  },
);

export default router;
