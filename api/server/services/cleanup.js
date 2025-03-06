import config from '~/config';
const { logger } = config;
import _default from '~/models/Conversation';
const { deleteNullOrEmptyConversations } = _default;
const cleanup = async () => {
  try {
    await deleteNullOrEmptyConversations();
  } catch (error) {
    logger.error('[cleanup] Error during app cleanup', error);
  } finally {
    logger.debug('Startup cleanup complete');
  }
};

export default { cleanup };
