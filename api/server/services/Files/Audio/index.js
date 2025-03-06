import getCustomConfigSpeech from './getCustomConfigSpeech';
import TTSService from './TTSService';
import STTService from './STTService';
import getVoices from './getVoices';

export default {
  getVoices,
  getCustomConfigSpeech,
  ...STTService,
  ...TTSService,
};
