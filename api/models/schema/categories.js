import { Schema as _Schema, model } from 'mongoose';
const Schema = _Schema;

const categoriesSchema = new Schema({
  label: {
    type: String,
    required: true,
    unique: true,
  },
  value: {
    type: String,
    required: true,
    unique: true,
  },
});

const categories = model('categories', categoriesSchema);

export const Categories = categories;
