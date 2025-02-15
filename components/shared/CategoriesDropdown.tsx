'use client';

import { getAllCategories } from '@/lib/actions/category.actions';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useEffect, useState } from 'react';

type CategoriesDropdownProps = {
  value: string;
  onChange: (value: string) => void;
};

const CategoriesDropdown = ({ value, onChange }: CategoriesDropdownProps) => {
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>(
    []
  );

  useEffect(() => {
    const fetchCategories = async () => {
      const categories = await getAllCategories();
      setCategories(categories);
    };

    fetchCategories();
  }, []);

  return (
    <Select onValueChange={onChange} defaultValue={value}>
      <SelectTrigger className="select-field p-regular-14">
        <SelectValue placeholder="Select a category" />
      </SelectTrigger>
      <SelectContent>
        {categories.map((category) => (
          <SelectItem key={category._id} value={category._id}>
            {category.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default CategoriesDropdown;
