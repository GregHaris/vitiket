import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useFormContext } from 'react-hook-form';

export default function QuantityInput() {
  const { control } = useFormContext();

  return (
    <div className="mb-4">
      <FormField
        control={control}
        name="quantity"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium">
              Ticket Quantity <span className="text-red-400">*</span>
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                type="number"
                placeholder="Quantity"
                className="input-field w-24 p-regular-14" // Short width
                value={field.value || ''}
                onChange={(e) =>
                  field.onChange(
                    e.target.value === '' ? null : Number(e.target.value)
                  )
                }
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
