import { useFormContext } from 'react-hook-form';

import { eventFormValues } from '@/lib/validator';
import { FormField, FormItem, FormLabel, FormMessage } from '@ui/form';
import TypesDropdown from './TypesDropdown';

export default function EventTypeSelector() {
  const { control } = useFormContext<eventFormValues>();
  return (
    <FormField
      control={control}
      name="typeId"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-sm font-medium">
            Type <span className="text-red-400">*</span>
          </FormLabel>
          <TypesDropdown value={field.value} onChange={field.onChange} />
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
