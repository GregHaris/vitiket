import { useFormContext } from 'react-hook-form';

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import TiptapEditor from './TiptapEditor';

export default function DescriptionEditor() {
  const { control } = useFormContext();
  return (
    <FormField
      control={control}
      name="description"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-sm font-medium">
            Description <span className="text-red-400">*</span>
          </FormLabel>
          <FormControl>
            <TiptapEditor
              initialContent={field.value}
              onChange={field.onChange}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
