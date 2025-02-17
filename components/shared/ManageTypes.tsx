'use client';

import { Edit, X } from 'lucide-react';
import { useState, useEffect } from 'react';

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
  createType,
  updateType,
  deleteType,
  getTypeByName,
  getAllTypes,
} from '@/lib/actions/type.actions';
import { Input } from '@ui/input';

interface Type {
  _id: string;
  name: string;
}

export default function ManageTypes() {
  const [typeName, setTypeName] = useState('');
  const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<Type[]>([]);
  const [searchMessage, setSearchMessage] = useState('');
  const [types, setTypes] = useState<Type[]>([]);
  const [showAllTypes, setShowAllTypes] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchTypes = async () => {
      const allTypes = await getAllTypes();
      setTypes(allTypes);
    };
    fetchTypes();
  }, []);

  const handleAddType = async () => {
    if (typeName.trim()) {
      const existingTypes = await getTypeByName(typeName);
      if (existingTypes.length > 0) {
        setErrorMessage(`Type "${typeName}" already exists.`);
        setTimeout(() => setErrorMessage(''), 5000);
        return;
      }
      const newType = await createType({ typeName });
      if (newType) {
        setSuccessMessage(`Type "${typeName}" added successfully!`);
        setTypeName('');
        setTypes([...types, newType]);
        setTimeout(() => setSuccessMessage(''), 5000);
      }
    }
  };

  const handleUpdateType = async () => {
    if (selectedTypeId && typeName.trim()) {
      const updatedType = await updateType({
        typeId: selectedTypeId,
        typeName,
      });
      if (updatedType) {
        setSuccessMessage(`Type updated to "${typeName}" successfully!`);
        setTypeName('');
        setSelectedTypeId(null);
        setTypes(
          types.map((cat) => (cat._id === updatedType._id ? updatedType : cat))
        );
        setTimeout(() => setSuccessMessage(''), 5000);
      }
    }
  };

  const handleDeleteType = async (typeId: string) => {
    const deletedType = await deleteType(typeId);
    if (deletedType) {
      setDeleteMessage(`Type "${deletedType.name}" deleted successfully!`);
      setTypes(types.filter((cat) => cat._id !== typeId));
      if (selectedTypeId === typeId) {
        setTypeName('');
        setSelectedTypeId(null);
      }
      setTimeout(() => setDeleteMessage(''), 5000);
    }
  };

  const handleSearchType = async () => {
    if (typeName.trim()) {
      const types = await getTypeByName(typeName);
      if (types.length > 0) {
        setSearchResults(types);
        setSearchMessage('');
      } else {
        setSearchResults([]);
        setSearchMessage(
          `Type "${typeName}" does not exist. Click the "Add Type" button to add it.`
        );
      }
    }
  };

  const handleSelectType = (type: Type) => {
    setSelectedTypeId(type._id);
    setTypeName(type.name);
    setSearchResults([]);
    setSearchMessage('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTypeName(value);
    if (!value.trim()) {
      setSearchResults([]);
      setSearchMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearchType();
    }
  };

  const toggleShowAllTypes = () => {
    setShowAllTypes(!showAllTypes);
  };

  return (
    <div className="space-y-4  wrapper">
      <h2 className="text-xl font-semibold md:text-left text-center">
        Manage Event Types
      </h2>
      <div className="flex flex-col md:flex-row gap-2">
        <Input
          type="text"
          placeholder="Enter type name"
          value={typeName}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          className="input-field"
        />
        <Button className="button" onClick={handleSearchType}>
          Search Type
        </Button>
      </div>
      {searchResults.length > 0 && (
        <div className="space-y-2">
          {searchResults.map((result) => (
            <div key={result._id} className="flex gap-2 items-center">
              <span>
                {result.name
                  .split(new RegExp(`(${typeName})`, 'gi'))
                  .map((part, index) =>
                    part.toLowerCase() === typeName.toLowerCase() ? (
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
                onClick={() => handleSelectType(result)}
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
                      type? This action cannot be undone.
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
                      onClick={() => handleDeleteType(result._id)}
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
        <Button onClick={handleAddType} className="button">
          Add Type
        </Button>
        <Button
          onClick={handleUpdateType}
          disabled={!selectedTypeId || !typeName.trim()}
          className="button"
        >
          Update Type
        </Button>
      </div>
      <Button onClick={toggleShowAllTypes} className="button">
        {showAllTypes ? 'Hide All Types' : 'Show All Types'}
      </Button>
      {showAllTypes && (
        <div>
          <h3 className="text-lg font-semibold">All Types</h3>
          <ul>
            {types.map((type) => (
              <li
                key={type._id}
                className="flex gap-2 items-center justify-between"
              >
                <span>{type.name}</span>
                <div className="flex">
                  <Button
                    type="button"
                    variant={'ghost'}
                    size={'icon'}
                    onClick={() => handleSelectType(type)}
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
                          Are you sure you want to delete &quot;{type.name}
                          &quot; type? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="cursor-pointer">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteType(type._id)}
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
