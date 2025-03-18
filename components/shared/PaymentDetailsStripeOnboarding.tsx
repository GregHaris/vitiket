'use client';

import { useFormContext } from 'react-hook-form';
import { PaymentDetailsStripeOnboardingProps } from '@/types';
import { Input } from '@ui/input';

export default function StripeOnboarding({
  userId,
  existingStripeId,
  setMessage,
  eventId,
  onSubmitSuccess,
  existingBusinessName,
}: PaymentDetailsStripeOnboardingProps & {
  existingStripeId?: string;
  onSubmitSuccess: () => void;
  eventId: string;
  existingBusinessName?: string; // Prepopulated businessName
}) {
  const { register, watch } = useFormContext();
  const businessName = watch('businessName');

  const handleStripeOnboarding = async () => {
    try {
      const res = await fetch('/api/stripe/start-onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, eventId, businessName }),
      });
      const { url } = await res.json();
      if (res.ok) {
        window.location.href = url;
      } else {
        setMessage('Failed to start Stripe onboarding');
      }
    } catch (error) {
      setMessage('An error occurred with Stripe onboarding. Please try again.');
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="businessName" className="block text-sm font-medium">
          Business Name
        </label>
        <Input
          id="businessName"
          {...register('businessName')}
          defaultValue={existingBusinessName}
          placeholder="Enter your business name"
          className="mt-1 input-field p-regular-14"
        />
      </div>
      {existingStripeId ? (
        <>
          <p>Update your Stripe account.</p>
          <p>
            <strong>Stripe Account ID: </strong> {existingStripeId}
          </p>
        </>
      ) : (
        <p>Connect your Stripe account to receive payments for this event.</p>
      )}
      <button
        type="button"
        onClick={handleStripeOnboarding}
        className="button bg-primary text-white px-3 py-2 rounded-md"
      >
        {existingStripeId ? 'Update Stripe Account' : 'Connect with Stripe'}
      </button>
    </div>
  );
}
