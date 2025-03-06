import { Router } from 'express';
import middlewareDefault from '~/server/middleware';
const { uaParser, checkBan, requireJwtAuth, createFileLimiters } = middlewareDefault;
import _default from '~/server/routes/assistants/v1';
const { avatar: asstAvatarRouter } = _default;
import __default from '~/server/routes/agents/v1';
const { avatar: agentAvatarRouter } = __default;
import { createMulterInstance } from './multer';

import files from './files';
import images from './images';
import avatar from './avatar';
import speech from './speech';

const initialize = async () => {
  const router = Router();
  router.use(requireJwtAuth);
  router.use(checkBan);
  router.use(uaParser);

  const upload = await createMulterInstance();
  router.post('/speech/stt', upload.single('audio'));

  /* Important: speech route must be added before the upload limiters */
  router.use('/speech', speech);

  const { fileUploadIpLimiter, fileUploadUserLimiter } = createFileLimiters();
  router.post('*', fileUploadIpLimiter, fileUploadUserLimiter);
  router.post('/', upload.single('file'));
  router.post('/images', upload.single('file'));
  router.post('/images/avatar', upload.single('file'));
  router.post('/images/agents/:agent_id/avatar', upload.single('file'));
  router.post('/images/assistants/:assistant_id/avatar', upload.single('file'));

  router.use('/', files);
  router.use('/images', images);
  router.use('/images/avatar', avatar);
  router.use('/images/agents', agentAvatarRouter);
  router.use('/images/assistants', asstAvatarRouter);
  return router;
};

export default { initialize };
