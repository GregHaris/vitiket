import { useFieldArray, useFormContext } from 'react-hook-form';
import { X } from 'lucide-react';

import { Button } from '@ui/button';
import { Input } from '@ui/input';
import { PriceCategoriesInputProps } from '@/types';

export default function PriceCategoriesInput({
  control,
}: PriceCategoriesInputProps) {
  const { register } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'priceCategories',
  });

  const addCategory = () => {
    append({ name: '', price: '' });
  };

  return (
    <div className="space-y-6 py-10">
      <h3 className="text-lg font-semibold">Price Categories</h3>
      {fields.map((field, index) => (
        <div key={field.id} className="flex gap-4 items-center mb-2">
          <Input
            {...register(`priceCategories.${index}.name`)}
            placeholder="Category Name"
            className="input-field p-regular-14"
          />
          <Input
            {...register(`priceCategories.${index}.price`)}
            placeholder="Price"
            className="input-field p-regular-14"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => remove(index)}
            className="text-red-500 hover:text-red-700 cursor-pointer mr-4"
            aria-label="Remove category"
            title="Remove category"
          >
            <X />
          </Button>
        </div>
      ))}
      <Button type="button" onClick={addCategory} className="button">
        Add Category
      </Button>
    </div>
  );
}
