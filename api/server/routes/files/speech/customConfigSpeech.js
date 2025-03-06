import { Router } from 'express';
const router = Router();

import { getCustomConfigSpeech } from '~/server/services/Files/Audio';

router.get('/get', async (req, res) => {
  await getCustomConfigSpeech(req, res);
});

export default router;
