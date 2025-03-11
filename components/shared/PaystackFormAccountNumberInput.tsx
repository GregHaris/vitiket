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

export default function AccountNumberInput() {
  const { control } = useFormContext<z.infer<typeof paymentDetailsSchema>>();

  return (
    <FormField
      control={control}
      name="accountNumber"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Account Number</FormLabel>
          <FormControl>
            <Input
              placeholder="e.g., 0123456789"
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
