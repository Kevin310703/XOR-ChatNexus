import { Schema, model } from 'mongoose';

/**
 * @typedef {Object} ToolCallData
 * @property {string} conversationId - The ID of the conversation
 * @property {string} messageId - The ID of the message
 * @property {string} toolId - The ID of the tool
 * @property {string | ObjectId} user - The user's ObjectId
 * @property {unknown} [result] - Optional result data
 * @property {TAttachment[]} [attachments] - Optional attachments data
 * @property {number} [blockIndex] - Optional code block index
 * @property {number} [partIndex] - Optional part index
 */

/** @type {MongooseSchema<ToolCallData>} */
const toolCallSchema = Schema(
  {
    conversationId: {
      type: String,
      required: true,
    },
    messageId: {
      type: String,
      required: true,
    },
    toolId: {
      type: String,
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    result: {
      type: Schema.Types.Mixed,
    },
    attachments: {
      type: Schema.Types.Mixed,
    },
    blockIndex: {
      type: Number,
    },
    partIndex: {
      type: Number,
    },
  },
  { timestamps: true },
);

toolCallSchema.index({ messageId: 1, user: 1 });
toolCallSchema.index({ conversationId: 1, user: 1 });

export default model('ToolCall', toolCallSchema);
