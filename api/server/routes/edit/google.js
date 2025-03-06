import { Router } from 'express';
import EditController from '~/server/controllers/EditController';
import { initializeClient } from '~/server/services/Endpoints/google';
import _default from '~/server/middleware';
const {
  setHeaders, handleAbort, validateModel, validateEndpoint, buildEndpointOption,
} = _default;

const router = Router();

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
