import { useFieldArray, useFormContext } from 'react-hook-form';
import { X } from 'lucide-react';

import { Button } from '@ui/button';
import { Input } from '@ui/input';
import { predefinedCategories } from '@/constants';
import { PriceCategoriesInputProps, PriceCategory } from '@/types';

export default function PriceCategoriesInput({
  control,
}: PriceCategoriesInputProps) {
  const { register, watch } = useFormContext();
  const { fields, append, remove } = useFieldArray<{
    priceCategories: PriceCategory[];
  }>({
    control,
    name: 'priceCategories',
  });

  const locationType = watch('locationType') as
    | 'Online'
    | 'In-Person'
    | 'Hybrid';
  const isFree = watch('isFree');

  if (isFree) return null;

  // Filter available categories
  const selectedCategories = fields.map((field) => field.name);
  const availableCategories = predefinedCategories[locationType].filter(
    (category) => !selectedCategories.includes(category) || category === 'Other'
  );

  const addCategory = (category: string) => {
    append({ name: category, price: category === 'Other' ? '' : '0.00' });
  };

  return (
    <div className="space-y-6 py-5 wrapper">
      <h3 className="text-lg font-semibold">Price Categories</h3>
      <p className="text-sm text-gray-500">Please add price categories:</p>
      <div className="flex gap-4 mb-4 flex-wrap">
        {availableCategories.map((category) => (
          <Button
            key={category}
            type="button"
            onClick={() => addCategory(category)}
            className="button"
          >
            {category}
          </Button>
        ))}
      </div>
      {fields.map((field, index) => (
        <div key={field.id} className="flex gap-4 items-center">
          <div className="flex flex-col">
            <label className="text-sm font-medium">
              Name <span className="text-red-400">*</span>
            </label>
            <Input
              {...register(`priceCategories.${index}.name`)}
              placeholder="Category Name"
              className="input-field p-regular-14"
              disabled={field.name !== 'Other'}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium">
              Price <span className="text-red-400">*</span>
            </label>
            <Input
              {...register(`priceCategories.${index}.price`)}
              placeholder="Enter price"
              className="input-field p-regular-14"
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => remove(index)}
            className="text-red-500 hover:text-red-700 cursor-pointer"
            aria-label="Remove category"
            title="Remove category"
          >
            <X />
          </Button>
        </div>
      ))}
    </div>
  );
}
