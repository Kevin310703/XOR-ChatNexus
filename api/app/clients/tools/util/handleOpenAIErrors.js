import { APIError, OpenAIError } from 'openai';
import { logger } from '~/config';

/**
 * Handles errors that may occur when making requests to OpenAI's API.
 * It checks the instance of the error and prints a specific warning message
 * to the console depending on the type of error encountered.
 * It then calls an optional error callback function with the error object.
 *
 * @param {Error} err - The error object thrown by OpenAI API.
 * @param {Function} errorCallback - A callback function that is called with the error object.
 * @param {string} [context='stream'] - A string providing context where the error occurred, defaults to 'stream'.
 */
async function handleOpenAIErrors(err, errorCallback, context = 'stream') {
  if (err instanceof APIError && err?.message?.includes('abort')) {
    logger.warn(`[OpenAIClient.chatCompletion][${context}] Aborted Message`);
  }
  if (err instanceof OpenAIError && err?.message?.includes('missing finish_reason')) {
    logger.warn(`[OpenAIClient.chatCompletion][${context}] Missing finish_reason`);
  } else if (err instanceof APIError) {
    logger.warn(`[OpenAIClient.chatCompletion][${context}] API error`);
  } else {
    logger.warn(`[OpenAIClient.chatCompletion][${context}] Unhandled error type`);
  }

  logger.error(err);

  if (errorCallback) {
    errorCallback(err);
  }
}

export default handleOpenAIErrors;
