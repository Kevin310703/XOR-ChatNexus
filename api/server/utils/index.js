import streamResponse from './streamResponse.js';
import removePorts from './removePorts.js';
import countTokens from './countTokens.js';
import handleText from './handleText.js';
import sendEmail from './sendEmail.js';
import cryptoUtils from './crypto.js';
import queue from './queue.js';
import files from './files.js';
import math from './math.js';

/**
 * Check if email configuration is set
 * @returns {Boolean}
 */
function checkEmailConfig() {
  return (
    (!!process.env.EMAIL_SERVICE || !!process.env.EMAIL_HOST) &&
    !!process.env.EMAIL_USERNAME &&
    !!process.env.EMAIL_PASSWORD &&
    !!process.env.EMAIL_FROM
  );
}

export default {
  ...streamResponse,
  checkEmailConfig,
  ...cryptoUtils,
  ...handleText,
  countTokens,
  removePorts,
  sendEmail,
  ...files,
  ...queue,
  math,
};
