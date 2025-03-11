'use client';

import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { Bank } from '@/types';
import { Button } from '@ui/button';
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandEmpty,
} from '@ui/command';
import { Check, X } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@ui/form';
import { Input } from '@ui/input';
import { paymentDetailsSchema } from '@/lib/validator';
import { Popover, PopoverContent, PopoverTrigger } from '@ui/popover';
import { updateEventStatus } from '@/lib/actions/event.actions';

interface PaymentDetailsFormProps {
  banks: Bank[];
  existingDetails?: {
    businessName: string;
    bankName: string;
    accountNumber: string;
    subaccountCode: string;
    accountName?: string;
  };
  eventId: string;
  userId: string;
}

export default function PaymentDetailsForm({
  banks,
  existingDetails,
  eventId,
  userId,
}: PaymentDetailsFormProps) {
  const [message, setMessage] = useState('');
  const [resolvedAccountName, setResolvedAccountName] = useState<string | null>(
    null
  );
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof paymentDetailsSchema>>({
    resolver: zodResolver(paymentDetailsSchema),
    defaultValues: {
      ...existingDetails,
      accountName: existingDetails?.accountName || '',
      businessName: existingDetails?.businessName || '',
      bankName: existingDetails?.bankName || '',
      accountNumber: existingDetails?.accountNumber || '',
    },
  });

  const accountNumber = form.watch('accountNumber');
  const bankName = form.watch('bankName');

  // Fetch account name from server-side API
  useEffect(() => {
    const resolveAccountName = async () => {
      if (accountNumber?.length === 10 && bankName) {
        try {
          const bank = banks.find((b) => b.name === bankName);
          if (!bank) {
            form.setError('bankName', { message: 'Invalid bank selected' });
            return;
          }

          const res = await fetch(
            `/api/paystack/verify-account?account_number=${accountNumber}&bank_code=${bank.code}`
          );
          const data = await res.json();
          console.log('Server verify response:', data);

          if (res.ok && data.accountName) {
            setResolvedAccountName(data.accountName);
            form.setValue('accountName', data.accountName);
            form.clearErrors('accountNumber');
          } else {
            setResolvedAccountName(null);
            form.setError('accountNumber', {
              message: 'Invalid account details',
            });
          }
        } catch (error) {
          console.error('Error verifying account:', error);
          setResolvedAccountName(null);
          form.setError('accountNumber', {
            message: 'Failed to verify account',
          });
        }
      } else {
        setResolvedAccountName(null);
        form.clearErrors('accountNumber');
      }
    };

    resolveAccountName();
  }, [accountNumber, bankName, banks, form]);

  const onSubmit = async (data: z.infer<typeof paymentDetailsSchema>) => {
    try {
      const res = await fetch('/api/paystack/create-subaccount', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
        body: JSON.stringify({
          businessName: data.businessName,
          bankName: data.bankName,
          accountNumber: data.accountNumber,
        }),
      });

      const result = await res.json();
      setMessage(result.message);

      if (res.ok) {
        await handleSubmitSuccess(result.subaccountCode);
        router.push('/dashboard');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
      console.error(error);
    }
  };

  const handleSubmitSuccess = async (subaccountCode: string) => {
    try {
      await updateEventStatus({
        userId,
        eventId,
        status: 'published',
        path: `/events/${eventId}`,
      });
    } catch (error) {
      console.error('Error finalizing event:', error);
      throw error;
    }
  };

  const handleReuseDetails = async () => {
    if (existingDetails) {
      await handleSubmitSuccess(existingDetails.subaccountCode);
    }
    router.push('/dashboard');
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
          <FormField
            control={form.control}
            name="bankName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bank Name</FormLabel>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="Type to search banks..."
                          {...field}
                          onChange={(e) => {
                            field.onChange(e.target.value);
                          }}
                          className="select-field"
                        />
                        {field.value && (
                          <button
                            type="button"
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                            title="Remove Bank Details"
                            onClick={() => {
                              form.setValue('bankName', '');
                              form.setValue('accountNumber', '');form.setValue('accountName', '');
                              setOpen(true);
                            }}
                          >
                            <X className="h-4 w-4" />{' '}
                          </button>
                        )}
                      </div>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search banks..." />
                      <CommandList>
                        <CommandEmpty>No banks found.</CommandEmpty>
                        {banks
                          .filter((bank) =>
                            bank.name
                              .toLowerCase()
                              .includes((field.value || '').toLowerCase())
                          )
                          .map((bank) => (
                            <CommandItem
                              key={`${bank.name}-${bank.code}`}
                              value={bank.name}
                              onSelect={() => {
                                form.setValue('bankName', bank.name);
                                setOpen(false);
                              }}
                              className="flex justify-between items-center"
                            >
                              {bank.name}
                              {field.value === bank.name && (
                                <Check className="h-4 w-4" />
                              )}
                            </CommandItem>
                          ))}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
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
          <FormField
            control={form.control}
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
          <div className="flex gap-4">
            <Button type="submit" disabled={form.formState.isSubmitting} className='button'>
              {form.formState.isSubmitting
                ? 'Submitting...'
                : existingDetails
                ? 'Update Details'
                : 'Save Details'}
            </Button>
            {existingDetails && (
              <Button variant="outline" className='button' onClick={handleReuseDetails}>
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
