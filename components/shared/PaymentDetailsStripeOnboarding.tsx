'use client';

import { PaymentDetailsStripeOnboardingProps } from '@/types';

export default function StripeOnboarding({
  userId,
  existingStripeId,
  setMessage,
  eventId,
}: PaymentDetailsStripeOnboardingProps & {
  existingStripeId?: string;
  onSubmitSuccess: () => void;
  eventId: string;
}) {
  const handleStripeOnboarding = async () => {
    try {
      const res = await fetch('/api/stripe/start-onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, eventId }),
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
      {existingStripeId ? (
        <>
          <p>Update your Stripe account.</p>
          <p>
            {' '}
            <strong>Stripe Account Id: </strong> {existingStripeId}
          </p>
        </>
      ) : (
        <p>
          {' '}
          'Connect your Stripe account to receive payments for this event.'
        </p>
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
