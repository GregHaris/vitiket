'use client';

import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { paymentDetailsSchema } from '@/lib/validator';
import { PaystackFormProps } from '@/types';
import AccountNumberInput from './PaystackFormAccountNumberInput';
import AccountNameDisplay from './PaystackFormAccountNameDisplay';
import BankSelector from './PaystackFormBankSelector';
import BusinessNameInput from './PaystackFormBusinessNameInput';

export default function PaystackForm({
  banks,
  userId,
  setMessage,
  onSubmitSuccess,
  handleSubmit,
}: PaystackFormProps) {
  const { watch, setValue, setError, clearErrors, formState } =
    useFormContext<z.infer<typeof paymentDetailsSchema>>();
  const [resolvedAccountName, setResolvedAccountName] = useState<string | null>(
    null
  );

  const accountNumber = watch('accountNumber');
  const bankName = watch('bankName');

  useEffect(() => {
    const resolveAccountName = async () => {
      if (accountNumber?.length === 10 && bankName) {
        try {
          const bank = banks.find((b) => b.name === bankName);
          if (!bank) {
            setError('bankName', { message: 'Invalid bank selected' });
            return;
          }

          const res = await fetch(
            `/api/paystack/verify-account?account_number=${accountNumber}&bank_code=${bank.code}`
          );
          const data = await res.json();
          console.log('Server verify response:', data);

          if (res.ok && data.accountName) {
            setResolvedAccountName(data.accountName);
            setValue('accountName', data.accountName);
            clearErrors('accountNumber');
          } else {
            setResolvedAccountName(null);
            setError('accountNumber', { message: 'Invalid account details' });
          }
        } catch (error) {
          console.error('Error verifying account:', error);
          setResolvedAccountName(null);
          setError('accountNumber', { message: 'Failed to verify account' });
        }
      } else {
        setResolvedAccountName(null);
        clearErrors('accountNumber');
      }
    };

    resolveAccountName();
  }, [accountNumber, bankName, banks, setValue, setError, clearErrors]);

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
        await onSubmitSuccess(result.subaccountCode);
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <BusinessNameInput />
      <BankSelector banks={banks} />
      <AccountNumberInput />
      <AccountNameDisplay resolvedAccountName={resolvedAccountName} />
    </form>
  );
}
