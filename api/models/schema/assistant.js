import { Schema } from 'mongoose';

const assistantSchema = Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assistant_id: {
      type: String,
      index: true,
      required: true,
    },
    avatar: {
      type: {
        filepath: String,
        source: String,
      },
      default: undefined,
    },
    conversation_starters: {
      type: [String],
      default: [],
    },
    access_level: {
      type: Number,
    },
    file_ids: { type: [String], default: undefined },
    actions: { type: [String], default: undefined },
    append_current_datetime: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

export default assistantSchema;
