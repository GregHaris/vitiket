import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
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
              <FormField
                control={control}
                name="isFree"
                render={({ field: isFreeField }) => (
                  <FormItem>
                    <FormControl>
                      <div className="flex items-center">
                        <label
                          htmlFor="isFree"
                          className="whitespace-nowrap pr-3 leading-none text-sm peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Free Ticket
                        </label>
                        <Checkbox
                          id="isFree"
                          checked={isFreeField.value}
                          onCheckedChange={(checked) => {
                            isFreeField.onChange(checked);
                            if (checked) {
                              control.setValue(name, '');
                            }
                          }}
                          className="mr-2 h-5 w-5 border-2 border-primary-500 cursor-pointer"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
