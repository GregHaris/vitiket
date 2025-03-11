'use client';

import { useFormContext } from 'react-hook-form';
import { z } from 'zod';

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@ui/form';
import { Input } from '@ui/input';
import { paymentDetailsSchema } from '@/lib/validator';

export default function BusinessNameInput() {
  const { control } = useFormContext<z.infer<typeof paymentDetailsSchema>>();

  return (
    <FormField
      control={control}
      name="businessName"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Business Name</FormLabel>
          <FormControl>
            <Input
              placeholder="e.g., Oasis Events"
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
