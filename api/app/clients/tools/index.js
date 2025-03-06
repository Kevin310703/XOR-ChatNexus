import { forEach } from './manifest.json';

// Structured Tools
import DALLE3 from './structured/DALLE3';
import FluxAPI from './structured/FluxAPI';
import OpenWeather from './structured/OpenWeather';
import StructuredWolfram from './structured/Wolfram';
import createYouTubeTools from './structured/YouTube';
import StructuredACS from './structured/AzureAISearch';
import StructuredSD from './structured/StableDiffusion';
import GoogleSearchAPI from './structured/GoogleSearch';
import TraversaalSearch from './structured/TraversaalSearch';
import TavilySearchResults from './structured/TavilySearchResults';

/** @type {Record<string, TPlugin | undefined>} */
const manifestToolMap = {};

/** @type {Array<TPlugin>} */
const toolkits = [];

forEach((tool) => {
  manifestToolMap[tool.pluginKey] = tool;
  if (tool.toolkit === true) {
    toolkits.push(tool);
  }
});

export default {
  toolkits,
  availableTools,
  manifestToolMap,
  // Structured Tools
  DALLE3,
  FluxAPI,
  OpenWeather,
  StructuredSD,
  StructuredACS,
  GoogleSearchAPI,
  TraversaalSearch,
  StructuredWolfram,
  createYouTubeTools,
  TavilySearchResults,
};
