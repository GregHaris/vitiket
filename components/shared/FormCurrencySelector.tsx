import { useFormContext } from 'react-hook-form';

import { currencies } from '@/constants';
import { eventFormValues } from '@/lib/validator';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@ui/select';

export default function Currency() {
  const { control } = useFormContext<eventFormValues>();
  return (
    <FormField
      control={control}
      name="currency"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-sm font-medium">
            Currency <span className="text-red-400">*</span>
          </FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger className="select-field p-regular-14">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {currencies.map((currency) => (
                <SelectItem key={currency} value={currency}>
                  {currency}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
