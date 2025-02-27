import { useFormContext } from 'react-hook-form';
import { checkoutFormValues } from '@/lib/validator';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@ui/form';
import { Input } from '@ui/input';

export default function FormEmailInput() {
  const { control } = useFormContext<checkoutFormValues>();

  return (
    <FormField
      control={control}
      name="email"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-sm font-medium">
            Email<span className="text-red-400">*</span>
          </FormLabel>
          <FormControl>
            <Input
              type="email"
              placeholder="Enter your email"
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
