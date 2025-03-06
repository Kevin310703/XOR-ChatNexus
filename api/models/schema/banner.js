import { Schema, model } from 'mongoose';

const bannerSchema = Schema(
  {
    bannerId: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    displayFrom: {
      type: Date,
      required: true,
      default: Date.now,
    },
    displayTo: {
      type: Date,
    },
    type: {
      type: String,
      enum: ['banner', 'popup'],
      default: 'banner',
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
  },

  { timestamps: true },
);

const Banner = model('Banner', bannerSchema);
export default Banner;
