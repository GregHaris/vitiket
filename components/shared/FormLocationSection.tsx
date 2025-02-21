import { useFormContext } from 'react-hook-form';

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { LocationProps } from '@/types';
import MapInput from './MapInput';

export default function LocationSection({ locationType, form }: LocationProps) {
  const { control } = useFormContext();
  return (
    <>
      {(locationType === 'Physical' || locationType === 'Hybrid') && (
        <>
          <FormField
            control={control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  Event Location <span className="text-red-400">*</span>
                </FormLabel>
                <FormControl>
                  <MapInput
                    value={{
                      location: field.value,
                      coordinates: form.getValues('coordinates'),
                    }}
                    onChange={(value) => {
                      field.onChange(value.location);
                      form.setValue('coordinates', value.coordinates);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}
    </>
  );
}
