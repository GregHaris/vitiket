import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import CategoriesDropdown from './CategoriesDropdown';
import { CategorySelectorProps } from '@/types';

export default function CategorySelector({ control }: CategorySelectorProps) {
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
