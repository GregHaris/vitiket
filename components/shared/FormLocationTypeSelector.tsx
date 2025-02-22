import { useFormContext } from 'react-hook-form';

import { eventFormValues } from '@/lib/validator';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export default function LocationTypeSelector() {
  const { control } = useFormContext<eventFormValues>();
  return (
    <FormField
      control={control}
      name="locationType"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-sm font-medium">
            Location Type <span className="text-red-400">*</span>
          </FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              className="flex gap-4 items-center"
            >
              <FormItem>
                <div className="flex items-center space-x-2">
                  <FormControl>
                    <RadioGroupItem value="Virtual" />
                  </FormControl>
                  <FormLabel>Virtual</FormLabel>
                </div>
              </FormItem>
              <FormItem>
                <div className="flex items-center space-x-2">
                  <FormControl>
                    <RadioGroupItem value="Physical" />
                  </FormControl>
                  <FormLabel>Physical</FormLabel>
                </div>
              </FormItem>
              <FormItem>
                <div className="flex items-center space-x-2">
                  <FormControl>
                    <RadioGroupItem value="Hybrid" />
                  </FormControl>
                  <FormLabel>Hybrid</FormLabel>
                </div>
              </FormItem>
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
