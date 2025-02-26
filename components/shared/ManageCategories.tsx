'use client';

import { Edit, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { SketchPicker } from 'react-color';

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from '@ui/alert-dialog';
import { Button, buttonVariants } from '@ui/button';
import { cn } from '@/lib/utils';
import {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryByName,
  getAllCategories,
} from '@/lib/actions/category.actions';
import { Input } from '@ui/input';

interface Category {
  _id: string;
  name: string;
  color: string;
}

export default function ManageCategories() {
  const [categoryName, setCategoryName] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const [searchResults, setSearchResults] = useState<Category[]>([]);
  const [searchMessage, setSearchMessage] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [color, setColor] = useState('#000000');
  const [showColorPicker, setShowColorPicker] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      const allCategories = await getAllCategories();
      setCategories(allCategories);
    };
    fetchCategories();
  }, []);

  const handleAddCategory = async () => {
    if (categoryName.trim() && color) {
      const existingCategories = await getCategoryByName(categoryName);
      if (existingCategories.length > 0) {
        setErrorMessage(`Category "${categoryName}" already exists.`);
        setTimeout(() => setErrorMessage(''), 5000);
        return;
      }
      const newCategory = await createCategory({ categoryName, color });
      if (newCategory) {
        setSuccessMessage(`Category "${categoryName}" added successfully!`);
        setCategoryName('');
        setColor('#000000');
        setCategories([...categories, newCategory]);
        setTimeout(() => setSuccessMessage(''), 5000);
      }
    }
  };

  const handleUpdateCategory = async () => {
    if (selectedCategoryId && categoryName.trim() && color) {
      const updatedCategory = await updateCategory({
        categoryId: selectedCategoryId,
        categoryName,
        color,
      });
      if (updatedCategory) {
        setSuccessMessage(
          `Category updated to "${categoryName}" successfully!`
        );
        setCategoryName('');
        setColor('#000000');
        setSelectedCategoryId(null);
        setCategories(
          categories.map((cat) =>
            cat._id === updatedCategory._id ? updatedCategory : cat
          )
        );
        setTimeout(() => setSuccessMessage(''), 5000);
      }
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    const deletedCategory = await deleteCategory(categoryId);
    if (deletedCategory) {
      setDeleteMessage(
        `Category "${deletedCategory.name}" deleted successfully!`
      );
      setCategories(categories.filter((cat) => cat._id !== categoryId));
      if (selectedCategoryId === categoryId) {
        setCategoryName('');
        setSelectedCategoryId(null);
      }
      setTimeout(() => setDeleteMessage(''), 5000);
    }
  };

  const handleSearchCategory = async () => {
    if (categoryName.trim()) {
      const categories = await getCategoryByName(categoryName);
      if (categories.length > 0) {
        setSearchResults(categories);
        setSearchMessage('');
      } else {
        setSearchResults([]);
        setSearchMessage(
          `Category "${categoryName}" does not exist. Click the "Add Category" button to add it.`
        );
      }
    }
  };

  const handleSelectCategory = (category: Category) => {
    setSelectedCategoryId(category._id);
    setCategoryName(category.name);
    setColor(category.color);
    setSearchResults([]);
    setSearchMessage('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCategoryName(value);
    if (!value.trim()) {
      setSearchResults([]);
      setSearchMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearchCategory();
    }
  };

  const toggleShowAllCategories = () => {
    setShowAllCategories(!showAllCategories);
  };

  const handleColorChange = (color: any) => {
    setColor(color.hex);
  };

  return (
    <div className="space-y-4  wrapper">
      <h2 className="text-xl font-semibold md:text-left text-center">
        Manage Event Categories
      </h2>
      <div className="flex flex-col md:flex-row gap-2">
        <Input
          type="text"
          placeholder="Enter category name"
          value={categoryName}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          className="input-field"
        />
        <Button
          className="button"
          onClick={() => setShowColorPicker(!showColorPicker)}
          disabled={!categoryName.trim()}
        >
          {showColorPicker ? 'Hide Color Picker' : 'Pick Color'}
        </Button>
        {showColorPicker && (
          <SketchPicker color={color} onChange={handleColorChange} />
        )}
        <Button
          className="button"
          onClick={handleSearchCategory}
          disabled={!categoryName.trim()}
        >
          Search Category
        </Button>
      </div>
      {searchResults.length > 0 && (
        <div className="space-y-2">
          {searchResults.map((result) => (
            <div key={result._id} className="flex gap-2 items-center">
              <span style={{ color: result.color }}>
                {result.name
                  .split(new RegExp(`(${categoryName})`, 'gi'))
                  .map((part, index) =>
                    part.toLowerCase() === categoryName.toLowerCase() ? (
                      <mark key={index}>{part}</mark>
                    ) : (
                      part
                    )
                  )}
              </span>
              <Button
                type="button"
                variant={'ghost'}
                size={'icon'}
                onClick={() => handleSelectCategory(result)}
                className="p-2 cursor-pointer"
                aria-label={'Edit'}
                title={'Edit'}
              >
                <Edit />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    type="button"
                    variant={'ghost'}
                    size={'icon'}
                    className="p-2 text-red-500 hover:text-red-700 cursor-pointer"
                    aria-label={'Delete'}
                    title={'Delete'}
                  >
                    <X />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-white">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete &quot;{result.name}&quot;
                      category? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="cursor-pointer">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      className={cn(
                        buttonVariants({ variant: 'destructive' }),
                        'cursor-pointer'
                      )}
                      onClick={() => handleDeleteCategory(result._id)}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))}
        </div>
      )}
      {searchMessage && <p>{searchMessage}</p>}
      {successMessage && <p className="text-green-500">{successMessage}</p>}
      {errorMessage && <p className="text-red-500">{errorMessage}</p>}
      {deleteMessage && <p className="text-red-500">{deleteMessage}</p>}
      <div className="flex gap-2 flex-col md:flex-row mb-10">
        <Button
          onClick={handleAddCategory}
          className="button"
          disabled={!categoryName.trim()}
        >
          Add Category
        </Button>
        <Button
          onClick={handleUpdateCategory}
          disabled={!selectedCategoryId || !categoryName.trim()}
          className="button"
        >
          Update Category
        </Button>
      </div>
      <Button onClick={toggleShowAllCategories} className="button">
        {showAllCategories ? 'Hide All Categories' : 'Show All Categories'}
      </Button>
      {showAllCategories && (
        <div>
          <h3 className="text-lg font-semibold">All Categories</h3>
          <ul>
            {categories.map((category) => (
              <li
                key={category._id}
                className="flex gap-2 items-center justify-between"
              >
                <span style={{ color: category.color }}>{category.name}</span>
                <div className="flex">
                  <Button
                    type="button"
                    variant={'ghost'}
                    size={'icon'}
                    onClick={() => handleSelectCategory(category)}
                    className="p-2 cursor-pointer"
                    aria-label={'Edit'}
                    title={'Edit'}
                  >
                    <Edit />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        type="button"
                        variant={'ghost'}
                        size={'icon'}
                        className="p-2 text-red-500 hover:text-red-700 cursor-pointer"
                        aria-label={'Delete'}
                        title={'Delete'}
                      >
                        <X />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-white">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete &quot;{category.name}
                          &quot; category? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="cursor-pointer">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteCategory(category._id)}
                          className={cn(
                            buttonVariants({ variant: 'destructive' }),
                            'cursor-pointer'
                          )}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
