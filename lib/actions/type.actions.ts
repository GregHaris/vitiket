'use server';

import { connectToDatabase } from '../database';
import { handleError } from '../utils';
import Type from '../database/models/type.model';

export const createType = async ({
  typeName,
}: {
  typeName: string;
}) => {
  try {
    await connectToDatabase();
    const newType = await Type.create({ name: typeName });
    return JSON.parse(JSON.stringify(newType));
  } catch (error) {
    handleError(error);
  }
};

export const updateType = async ({
  typeId,
  typeName,
}: {
  typeId: string;
  typeName: string;
}) => {
  try {
    await connectToDatabase();
    const updatedType = await Type.findByIdAndUpdate(
      typeId,
      { name: typeName },
      { new: true }
    );
    return JSON.parse(JSON.stringify(updatedType));
  } catch (error) {
    handleError(error);
  }
};

export const deleteType = async (typeId: string) => {
  try {
    await connectToDatabase();
    const deletedType = await Type.findByIdAndDelete(typeId);
    return JSON.parse(JSON.stringify(deletedType));
  } catch (error) {
    handleError(error);
  }
};

export const getAllCategories = async () => {
  try {
    await connectToDatabase();
    const categories = await Type.find().sort({ name: 1 });
    return JSON.parse(JSON.stringify(categories));
  } catch (error) {
    handleError(error);
  }
};

export const getTypeByName = async (typeName: string) => {
  try {
    await connectToDatabase();
    const categories = await Type.find({
      name: { $regex: new RegExp(typeName, 'i') },
    });
    return JSON.parse(JSON.stringify(categories));
  } catch (error) {
    handleError(error);
  }
};
