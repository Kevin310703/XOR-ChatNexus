import { config } from './EndpointService';
import getCustomConfig from './getCustomConfig';
import loadCustomConfig from './loadCustomConfig';
import loadConfigModels from './loadConfigModels';
import loadDefaultModels from './loadDefaultModels';
import getEndpointsConfig from './getEndpointsConfig';
import loadOverrideConfig from './loadOverrideConfig';
import loadAsyncEndpoints from './loadAsyncEndpoints';

export default {
  config,
  loadCustomConfig,
  loadConfigModels,
  loadDefaultModels,
  loadOverrideConfig,
  loadAsyncEndpoints,
  ...getCustomConfig,
  ...getEndpointsConfig,
};
