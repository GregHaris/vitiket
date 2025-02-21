import { useFormContext } from 'react-hook-form';

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UrlProps } from '@/types';

export default function Url({ name, label, placeholder }: UrlProps) {
  const { control } = useFormContext();
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-sm font-medium">
            {label} <span className="text-red-400">*</span>
          </FormLabel>
          <FormControl>
            <Input
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
