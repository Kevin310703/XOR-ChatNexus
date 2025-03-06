import { Router } from 'express';
const router = Router();
import requireJwtAuth from '../middleware/requireJwtAuth.js';
import { countTokens } from '../utils/index.js';
import _default from '../../config/index.js';
const { logger } = _default;

router.post('/', requireJwtAuth, async (req, res) => {
  try {
    const { arg } = req.body;
    const count = await countTokens(arg?.text ?? arg);
    res.send({ count });
  } catch (e) {
    logger.error('[/tokenizer] Error counting tokens', e);
    res.status(500).json('Error counting tokens');
  }
});

export default router;
