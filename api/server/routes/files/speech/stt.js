import { Router } from 'express';
import { speechToText } from '~/server/services/Files/Audio';

const router = Router();

router.post('/', speechToText);

export default router;
