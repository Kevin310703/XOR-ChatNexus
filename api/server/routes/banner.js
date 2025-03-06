import { Router } from 'express';

import _default from '~/models/Banner';
const { getBanner } = _default;
import optionalJwtAuth from '~/server/middleware/optionalJwtAuth';
const router = Router();

router.get('/', optionalJwtAuth, async (req, res) => {
  try {
    res.status(200).send(await getBanner(req.user));
  } catch (error) {
    res.status(500).json({ message: 'Error getting banner' });
  }
});

export default router;
