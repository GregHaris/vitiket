import { useFormContext } from 'react-hook-form';

import { eventFormValues } from '@/lib/validator';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@ui/form';
import { Textarea } from '@ui/textarea'; 

export default function SubtitleInput() {
  const { control } = useFormContext<eventFormValues>();
  return (
    <FormField
      control={control}
      name="subtitle"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-sm font-medium">
            Subtitle{' '}
            <span className="italic text-gray-500 text-sm">(optional)</span>
          </FormLabel>
          <FormControl>
            <Textarea
              placeholder="Event subtitle"
              {...field}
              className="textarea-input p-regular-14"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
