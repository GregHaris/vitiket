import { useFormContext } from 'react-hook-form';

import { eventFormValues } from '@/lib/validator';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@ui/form';
import { Input } from '@ui/input';

export default function TitleInput() {
  const { control } = useFormContext<eventFormValues>();
  return (
    <FormField
      control={control}
      name="title"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-sm font-medium">
            Title <span className="text-red-400">*</span>
          </FormLabel>
          <FormControl>
            <Input
              placeholder="Event title"
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
