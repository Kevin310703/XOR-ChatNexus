import { Schema } from 'mongoose';

const keySchema = Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
  },
});

keySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default keySchema;
