import { useFormContext } from 'react-hook-form';
import { checkoutFormValues } from '@/lib/validator';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@ui/form';
import { UserInfoInputProps } from '@/types';
import { Input } from '@ui/input';


export default function UserInfoInput({
  name,
  placeholder,
  label,
  required = false,
}: UserInfoInputProps) {
  const { control } = useFormContext<checkoutFormValues>();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-sm font-medium">
            {label} {required && <span className="text-red-400">*</span>}
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
