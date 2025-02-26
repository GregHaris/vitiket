'use server';

import { connectToDatabase } from '../database';
import { handleError } from '../utils';
import Type from '../database/models/type.model';

export const createType = async ({
  typeName,
  color,
}: {
  typeName: string;
  color: string;
}) => {
  try {
    await connectToDatabase();
    const newType = await Type.create({ name: typeName, color });
    return JSON.parse(JSON.stringify(newType));
  } catch (error) {
    handleError(error);
  }
};

export const updateType = async ({
  typeId,
  typeName,
  color,
}: {
  typeId: string;
  typeName: string;
  color: string;
}) => {
  try {
    await connectToDatabase();
    const updatedType = await Type.findByIdAndUpdate(
      typeId,
      { name: typeName, color },
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

export const getAllTypes = async () => {
  try {
    await connectToDatabase();
    const types = await Type.find().sort({ name: 1 });
    return JSON.parse(JSON.stringify(types));
  } catch (error) {
    handleError(error);
  }
};

export const getTypeByName = async (typeName: string) => {
  try {
    await connectToDatabase();
    const types = await Type.find({
      name: { $regex: new RegExp(typeName, 'i') },
    });
    return JSON.parse(JSON.stringify(types));
  } catch (error) {
    handleError(error);
  }
};
