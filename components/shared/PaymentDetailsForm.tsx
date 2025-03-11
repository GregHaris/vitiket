'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, FormProvider } from 'react-hook-form';

import { PaymentDetailsFormProps } from '@/types';
import { paymentDetailsSchema } from '@/lib/validator';
import PaystackForm from './PaystackForm';
import FormActions from './PaymentDetailsFormActionButtons';
import StripeOnboarding from './PaymentDetailsStripeOnboarding';

export default function PaymentDetailsForm({
  banks,
  existingDetails,
  eventId,
  userId,
  isNigerianEvent,
}: PaymentDetailsFormProps) {
  const [message, setMessage] = useState('');
  const router = useRouter();

  const form = useForm<z.infer<typeof paymentDetailsSchema>>({
    resolver: zodResolver(paymentDetailsSchema),
    defaultValues: {
      businessName: existingDetails?.businessName || '',
      bankName: existingDetails?.bankName || '',
      accountNumber: existingDetails?.accountNumber || '',
      accountName: existingDetails?.accountName || '',
    },
  });

  const handleSubmitSuccess = async (accountId: string) => {
    try {
      await import('@/lib/actions/event.actions').then(
        ({ updateEventStatus }) =>
          updateEventStatus({
            userId,
            eventId,
            status: 'published',
            path: `/events/${eventId}`,
          })
      );
      router.push('/dashboard');
    } catch (error) {
      console.error('Error finalizing event:', error);
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">
        {existingDetails ? 'Your Payment Details' : 'Add Payment Details'}
      </h2>
      <FormProvider {...form}>
        {isNigerianEvent ? (
          <PaystackForm
            banks={banks}
            userId={userId}
            setMessage={setMessage}
            onSubmitSuccess={handleSubmitSuccess}
            handleSubmit={form.handleSubmit}
          />
        ) : (
          <StripeOnboarding
            userId={userId}
            existingStripeId={existingDetails?.stripeId}
            setMessage={setMessage}
            onSubmitSuccess={handleSubmitSuccess}
          />
        )}
        <FormActions
          message={message}
          existingDetails={existingDetails}
          isNigerianEvent={isNigerianEvent}
          onReuse={handleSubmitSuccess}
          isSubmitting={form.formState.isSubmitting}
        />
      </FormProvider>
    </div>
  );
}
