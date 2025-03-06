import { Tiktoken } from 'tiktoken/lite';
import p50k_base from 'tiktoken/encoders/p50k_base.json';
import cl100k_base from 'tiktoken/encoders/cl100k_base.json';
import logger from '../../config/winston.js';

/**
 * Counts the number of tokens in a given text using a specified encoding model.
 *
 * This function utilizes the 'Tiktoken' library to encode text based on the selected model.
 * It supports two models, 'text-davinci-003' and 'gpt-3.5-turbo', each with its own encoding strategy.
 * For 'text-davinci-003', the 'p50k_base' encoder is used, whereas for other models, the 'cl100k_base' encoder is applied.
 * In case of an error during encoding, the error is logged, and the function returns 0.
 *
 * @async
 * @param {string} text - The text to be tokenized. Defaults to an empty string if not provided.
 * @param {string} modelName - The name of the model used for tokenizing. Defaults to 'gpt-3.5-turbo'.
 * @returns {Promise<number>} The number of tokens in the provided text. Returns 0 if an error occurs.
 * @throws Logs the error to a logger and rethrows if any error occurs during tokenization.
 */
const countTokens = async (text = '', modelName = 'gpt-3.5-turbo') => {
  let encoder = null;
  try {
    const model = modelName.includes('text-davinci-003') ? p50k_base : cl100k_base;
    encoder = new Tiktoken(model.bpe_ranks, model.special_tokens, model.pat_str);
    const tokens = encoder.encode(text);
    encoder.free();
    return tokens.length;
  } catch (e) {
    logger.error('[countTokens]', e);
    if (encoder) {
      encoder.free();
    }
    return 0;
  }
};

export default countTokens;
