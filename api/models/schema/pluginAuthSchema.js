import { Schema, models, model } from 'mongoose';

const pluginAuthSchema = Schema(
  {
    authField: {
      type: String,
      required: true,
    },
    value: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    pluginKey: {
      type: String,
    },
  },
  { timestamps: true },
);

const PluginAuth = models.Plugin || model('PluginAuth', pluginAuthSchema);

export default PluginAuth;
