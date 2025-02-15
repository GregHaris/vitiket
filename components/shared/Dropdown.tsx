import { startTransition, useEffect, useState } from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@ui/alert-dialog';
import {
  createCategory,
  getAllCategories,
} from '@/lib/actions/category.actions';
import { handleError } from '@/lib/utils';
import { Input } from '@ui/input';
import { ICategory } from '@/lib/database/models/category.model';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@ui/select';

type DropdownProps = {
  value?: string;
  onChangeHandler?: () => void;
};

const Dropdown = ({ value, onChangeHandler }: DropdownProps) => {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [newCategory, setNewCategory] = useState<string>('');

  const handleAddCategory = async () => {
    try {
      const category = await createCategory({
        categoryName: newCategory.trim(),
      });
      setCategories((prevState) => [...prevState, category]);
    } catch (error) {
      handleError(error);
    }
  };

  useEffect(() => {
    const getCategories = async () => {
      const categoryList = await getAllCategories();
      if (categoryList) {
        setCategories(categoryList as ICategory[]);
      }
    };
    getCategories();
  }, []);

  return (
    <Select onValueChange={onChangeHandler} defaultValue={value}>
      <SelectTrigger className="select-field cursor-pointer">
        <SelectValue placeholder="Category" />
      </SelectTrigger>
      <SelectContent>
        {categories.length > 0 &&
          categories.map((category) => (
            <SelectItem
              key={category._id}
              value={category._id}
              className="select-item p-regular-14"
            >
              {category.name}
            </SelectItem>
          ))}

        <AlertDialog>
          <AlertDialogTrigger className="p-medium-14 flex w-full rounded-sm py-3 pl-8 text-primary-500 hover:bg-primary-50 focus:text-primary-500 cursor-pointer">
            Add Category
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-white">
            <AlertDialogHeader>
              <AlertDialogTitle>New Category</AlertDialogTitle>
              <AlertDialogDescription>
                <Input
                  type="text"
                  placeholder="Category Name"
                  className="input-field mt-3"
                  onChange={(e) => setNewCategory(e.target.value)}
                />
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="cursor-pointer">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => startTransition(handleAddCategory)}
                className="cursor-pointer"
              >
                Add
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SelectContent>
    </Select>
  );
};

export default Dropdown;
