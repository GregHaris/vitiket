import { useFormContext } from 'react-hook-form';

import { checkoutFormValues } from '@/lib/validator';
import { FormEmailInputProps } from '@/types';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@ui/form';
import { Input } from '@ui/input';

export default function FormEmailInput({
  name,
  placeholder,
  label,
}: FormEmailInputProps) {
  const { control } = useFormContext<checkoutFormValues>();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-sm font-medium">
            {label}
            <span className="text-red-400">*</span>
          </FormLabel>
          <FormControl>
            <Input
              type="email"
              placeholder={placeholder}
              {...field}
              className="input-field p-regular-14"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
