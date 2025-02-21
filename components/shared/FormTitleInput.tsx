import { useFormContext } from 'react-hook-form';

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

export default function TitleInput() {
  const { control } = useFormContext();
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
