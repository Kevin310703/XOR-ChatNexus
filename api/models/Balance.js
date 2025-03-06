import { model as _model } from 'mongoose';
import balanceSchema from './schema/balance';
import { getMultiplier } from './tx';
import config from '~/config';
const { logger } = config;

balanceSchema.statics.check = async function ({
  user,
  model,
  endpoint,
  valueKey,
  tokenType,
  amount,
  endpointTokenConfig,
}) {
  const multiplier = getMultiplier({ valueKey, tokenType, model, endpoint, endpointTokenConfig });
  const tokenCost = amount * multiplier;
  const { tokenCredits: balance } = (await this.findOne({ user }, 'tokenCredits').lean()) ?? {};

  logger.debug('[Balance.check]', {
    user,
    model,
    endpoint,
    valueKey,
    tokenType,
    amount,
    balance,
    multiplier,
    endpointTokenConfig: !!endpointTokenConfig,
  });

  if (!balance) {
    return {
      canSpend: false,
      balance: 0,
      tokenCost,
    };
  }

  logger.debug('[Balance.check]', { tokenCost });

  return { canSpend: balance >= tokenCost, balance, tokenCost };
};

export default _model('Balance', balanceSchema);
