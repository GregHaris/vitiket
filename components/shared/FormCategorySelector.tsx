import { useFormContext } from 'react-hook-form';

import { eventFormValues } from '@/lib/validator';
import { FormField, FormItem, FormLabel, FormMessage } from '@ui/form';
import CategoriesDropdown from './CategoriesDropdown';

export default function CategorySelector() {
  const { control } = useFormContext<eventFormValues>();
  return (
    <FormField
      control={control}
      name="categoryId"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-sm font-medium">
            Category <span className="text-red-400">*</span>
          </FormLabel>
          <CategoriesDropdown value={field.value} onChange={field.onChange} />
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
