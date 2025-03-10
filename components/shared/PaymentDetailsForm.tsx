'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Bank } from '@/types';
import { PaymentDetailsValues, paymentDetailsSchema } from '@/lib/validator';
import { Button } from '@ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@ui/form';
import { Input } from '@ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@ui/select';

interface PaymentDetailsFormProps {
  banks: Bank[];
  existingDetails?: PaymentDetailsValues & { subaccountCode: string }; 
  onSubmitSuccess?: (subaccountCode: string) => void; 
}

export default function PaymentDetailsForm({
  banks,
  existingDetails,
  onSubmitSuccess,
}: PaymentDetailsFormProps) {
  const [message, setMessage] = useState('');
  const router = useRouter();

  const form = useForm<PaymentDetailsValues>({
    resolver: zodResolver(paymentDetailsSchema),
    defaultValues: existingDetails || {
      businessName: '',
      bankName: '',
      accountNumber: '',
    },
  });

  const onSubmit = async (data: PaymentDetailsValues) => {
    try {
      const res = await fetch('/api/create-subaccount', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      setMessage(result.message);

      if (res.ok) {
        onSubmitSuccess?.(result.subaccountCode);
        router.push('/dashboard');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">
        {existingDetails ? 'Your Payment Details' : 'Add Payment Details'}
      </h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="businessName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Oasis Events" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="bankName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bank Name</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your bank" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {banks.map((bank) => (
                      <SelectItem key={bank.code} value={bank.name}>
                        {bank.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="accountNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account Number</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., 0123456789" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex gap-4">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting
                ? 'Submitting...'
                : existingDetails
                ? 'Update Details'
                : 'Save Details'}
            </Button>
            {existingDetails && (
              <Button
                variant="outline"
                onClick={() => router.push('/organizer/dashboard')}
              >
                Reuse Existing Details
              </Button>
            )}
          </div>
          {message && (
            <p className="text-sm text-muted-foreground">{message}</p>
          )}
        </form>
      </Form>
    </div>
  );
}
