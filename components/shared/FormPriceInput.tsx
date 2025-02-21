import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { PriceInputProps } from '@/types';

export default function PriceInput({ control, name, label }: PriceInputProps) {
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
            <div className="flex-center h-[40px] w-full overflow-hidden rounded-md border-gray-300 border bg-grey-50 px-4 py-2">
              <Input
                placeholder="0.00"
                {...field}
                className="nested-input-field p-regular-14"
                onChange={(e) => {
                  field.onChange(e);
                  if (e.target.value) {
                    control.setValue('isFree', false);
                  }
                }}
              />
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
