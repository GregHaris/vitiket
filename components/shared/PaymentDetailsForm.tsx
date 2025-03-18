'use client';

import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { getUserById } from '@/lib/actions/user.actions';
import { IUser } from '@/lib/database/models/user.model';
import { PaymentDetailsFormProps } from '@/types';
import { paymentDetailsSchema } from '@/lib/validator';
import { updateEventStatus } from '@/lib/actions/event.actions';
import PaystackForm from './PaystackForm';
import StripeOnboarding from './PaymentDetailsStripeOnboarding';

const onSubmitSuccess = async (
  userId: string,
  eventId: string,
  router: ReturnType<typeof useRouter>,
  setMessage: Dispatch<SetStateAction<string>>
) => {
  try {
    await updateEventStatus({
      userId,
      eventId,
      status: 'published',
      path: `/events/${eventId}`,
    });
    router.push(`/events/${eventId}`);
  } catch (error) {
    console.error('Error finalizing event:', error);
    setMessage('Error publishing event.');
  }
};

export default function PaymentDetailsForm({
  banks,
  existingDetails: initialExistingDetails,
  eventId,
  userId,
  isNigerianEvent,
}: PaymentDetailsFormProps) {
  const [message, setMessage] = useState<string>('');
  const router = useRouter();

  const [fetchedDetails, setFetchedDetails] = useState<{
    businessName?: string;
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
    subaccountCode?: string;
    stripeId?: string;
  } | null>(null);

  const form = useForm<z.infer<typeof paymentDetailsSchema>>({
    resolver: zodResolver(paymentDetailsSchema),
    defaultValues: {
      businessName: initialExistingDetails?.businessName || '',
      bankName: initialExistingDetails?.bankName || '',
      accountNumber: initialExistingDetails?.accountNumber || '',
      accountName: initialExistingDetails?.accountName || '',
    },
  });

  useEffect(() => {
    async function fetchDetails() {
      if (userId) {
        try {
          const user: IUser = await getUserById(userId);
          const mappedDetails = {
            businessName: user.businessName || '',
            bankName: user.bankName || '',
            accountNumber: user.bankDetails?.accountNumber || '',
            accountName: user.bankDetails?.accountName || '',
            subaccountCode: user.subaccountCode,
            stripeId: user.stripeId,
          };
          setFetchedDetails(mappedDetails);

          form.reset({
            businessName: mappedDetails.businessName,
            bankName: mappedDetails.bankName,
            accountNumber: mappedDetails.accountNumber,
            accountName: mappedDetails.accountName,
          });
        } catch (error) {
          console.error('Error fetching user details:', error);
          setMessage('Failed to load user details.');
        }
      }
    }
    fetchDetails();
  }, [userId, form]);

  const effectiveDetails = fetchedDetails || initialExistingDetails;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">
        {effectiveDetails ? 'Your Payment Details' : 'Add Payment Details'}
      </h2>
      <FormProvider {...form}>
        {isNigerianEvent ? (
          <PaystackForm
            banks={banks}
            userId={userId}
            handleSubmit={form.handleSubmit}
            existingDetails={effectiveDetails}
            onSubmitSuccess={() =>
              onSubmitSuccess(userId, eventId, router, setMessage)
            }
          />
        ) : (
          <StripeOnboarding
            userId={userId}
            existingStripeId={effectiveDetails?.stripeId}
            setMessage={setMessage}
            onSubmitSuccess={() =>
              onSubmitSuccess(userId, eventId, router, setMessage)
            }
            eventId={eventId}
            existingBusinessName={effectiveDetails?.businessName} 
          />
        )}
        {message && <p className="text-sm text-muted-foreground">{message}</p>}
      </FormProvider>
    </div>
  );
}
