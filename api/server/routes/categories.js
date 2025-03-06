import { Router } from 'express';
const router = Router();
import _default from '../middleware/index.js';
const { requireJwtAuth } = _default;
import { getCategories } from '../../models/Categories.js';

router.get('/', requireJwtAuth, async (req, res) => {
  try {
    const categories = await getCategories();
    res.status(200).send(categories);
  } catch (error) {
    res.status(500).send({ message: 'Failed to retrieve categories', error: error.message });
  }
});

export default router;
