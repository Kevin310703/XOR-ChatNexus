import { Schema, models, model } from 'mongoose';
import _default from './defaults';
const { conversationPreset } = _default;
const presetSchema = Schema(
  {
    presetId: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: 'New Chat',
      meiliIndex: true,
    },
    user: {
      type: String,
      default: null,
    },
    defaultPreset: {
      type: Boolean,
    },
    order: {
      type: Number,
    },
    ...conversationPreset,
    agentOptions: {
      type: Schema.Types.Mixed,
      default: null,
    },
  },
  { timestamps: true },
);

const Preset = models.Preset || model('Preset', presetSchema);

export default Preset;
