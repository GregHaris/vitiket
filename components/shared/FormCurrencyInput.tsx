import { useFormContext } from 'react-hook-form';

import { eventFormValues } from '@/lib/validator';
import { FormField, FormItem, FormLabel } from '@ui/form';
import { Input } from '@ui/input';

export default function Currency() {
  const { control } = useFormContext<eventFormValues>();
  return (
    <FormField
      control={control}
      name="currency"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-sm font-medium">
            Currency <span className="text-red-400">*</span>
          </FormLabel>
          <Input
            value={(field.value = 'NGN')}
            disabled
            className="input-field p-regular-14"
          />
        </FormItem>
      )}
    />
  );
}
