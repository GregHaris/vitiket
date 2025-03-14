import { useFormContext } from 'react-hook-form';

import { eventFormValues } from '@/lib/validator';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@ui/form';
import { Input } from '@ui/input';

export default function QuantityInput() {
  const { control } = useFormContext<eventFormValues>();

  return (
    <div className="mb-4">
      <FormField
        control={control}
        name="quantity"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium">
              Ticket Quantity
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                type="number"
                inputMode="numeric"
                placeholder="Quantity"
                className="input-field hide-number-spinners p-regular-14"
                value={field.value || ''}
                onChange={(e) =>
                  field.onChange(
                    e.target.value === '' ? null : Number(e.target.value)
                  )
                }
                onKeyDown={(e) => {
                  if (
                    [
                      'Backspace',
                      'Delete',
                      'Shift',
                      'Tab',
                      'Escape',
                      'Enter',
                    ].includes(e.key) ||
                    (e.ctrlKey && ['a', 'c', 'v', 'x'].includes(e.key)) ||
                    ['Home', 'End', 'ArrowLeft', 'ArrowRight'].includes(e.key)
                  ) {
                    return;
                  }
                  if (isNaN(Number(e.key))) {
                    e.preventDefault();
                  }
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
