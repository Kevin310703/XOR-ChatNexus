import addCacheControl from './addCacheControl';
import formatMessages from './formatMessages';
import summaryPrompts from './summaryPrompts';
import handleInputs from './handleInputs';
import instructions from './instructions';
import titlePrompts from './titlePrompts';
import truncate from './truncate';
import createVisionPrompt from './createVisionPrompt';
import createContextHandlers from './createContextHandlers';

export default {
  addCacheControl,
  ...formatMessages,
  ...summaryPrompts,
  ...handleInputs,
  ...instructions,
  ...titlePrompts,
  ...truncate,
  createVisionPrompt,
  createContextHandlers,
};
