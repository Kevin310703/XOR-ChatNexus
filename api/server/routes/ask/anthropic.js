import { Router } from 'express';
import AskController from '~/server/controllers/AskController';
import { addTitle, initializeClient } from '~/server/services/Endpoints/anthropic';
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
    await AskController(req, res, next, initializeClient, addTitle);
  },
);

export default router;
