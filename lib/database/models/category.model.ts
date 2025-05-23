import { Document, Schema, models, model } from 'mongoose';

export interface ICategory extends Document {
  _id: string;
  name: string;
  color: string;
}

const CategorySchema = new Schema({
  name: { type: String, required: true, unique: true },
  color: { type: String, required: true, unique: true },
});

const Category =
  models.Category || model<ICategory>('Category', CategorySchema);

export default Category;
