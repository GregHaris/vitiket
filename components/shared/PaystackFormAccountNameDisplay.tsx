'use client';

import { useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { paymentDetailsSchema } from '@/lib/validator';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@ui/form';
import { Input } from '@ui/input';
import { PaystackFormAccountNameDisplayProps } from '@/types';


export default function AccountNameDisplay({
  resolvedAccountName,
}: PaystackFormAccountNameDisplayProps) {
  const { control } = useFormContext<z.infer<typeof paymentDetailsSchema>>();

  return (
    <FormField
      control={control}
      name="accountName"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Account Name (Verified)</FormLabel>
          <FormControl>
            <Input
              {...field}
              className="input-field p-regular-14"
              disabled
              placeholder={
                resolvedAccountName
                  ? resolvedAccountName
                  : 'Enter account number and bank to verify'
              }
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
