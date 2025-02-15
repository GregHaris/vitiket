'use server';

import { connectToDatabase } from '../database';
import { handleError } from '../utils';
import Category from '../database/models/category.model';

export const createCategory = async ({
  categoryName,
}: {
  categoryName: string;
}) => {
  try {
    await connectToDatabase();
    const newCategory = await Category.create({ name: categoryName });
    return JSON.parse(JSON.stringify(newCategory));
  } catch (error) {
    handleError(error);
  }
};

export const updateCategory = async ({
  categoryId,
  categoryName,
}: {
  categoryId: string;
  categoryName: string;
}) => {
  try {
    await connectToDatabase();
    const updatedCategory = await Category.findByIdAndUpdate(
      categoryId,
      { name: categoryName },
      { new: true }
    );
    return JSON.parse(JSON.stringify(updatedCategory));
  } catch (error) {
    handleError(error);
  }
};

export const deleteCategory = async (categoryId: string) => {
  try {
    await connectToDatabase();
    const deletedCategory = await Category.findByIdAndDelete(categoryId);
    return JSON.parse(JSON.stringify(deletedCategory));
  } catch (error) {
    handleError(error);
  }
};

export const getAllCategories = async () => {
  try {
    await connectToDatabase();
    const categories = await Category.find().sort({ name: 1 });
    return JSON.parse(JSON.stringify(categories));
  } catch (error) {
    handleError(error);
  }
};

export const getCategoryByName = async (categoryName: string) => {
  try {
    await connectToDatabase();
    const categories = await Category.find({
      name: { $regex: new RegExp(categoryName, 'i') },
    });
    return JSON.parse(JSON.stringify(categories));
  } catch (error) {
    handleError(error);
  }
};
