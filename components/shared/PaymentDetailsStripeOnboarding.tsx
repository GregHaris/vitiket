'use client';

import { PaymentDetailsStripeOnboardingProps } from '@/types';

export default function StripeOnboarding({
  userId,
  existingStripeId,
  setMessage,
  onSubmitSuccess,
}: PaymentDetailsStripeOnboardingProps) {
  const handleStripeOnboarding = async () => {
    try {
      const res = await fetch('/api/stripe/start-onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
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
    <div className="space-y-4">
      {existingStripeId ? (
        <>
          <p className="text-sm text-gray-600">
            Your Stripe account is connected (ID: {existingStripeId}). You can
            reuse these details or update them.
          </p>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => onSubmitSuccess(existingStripeId)}
              className="button inline-flex items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:w-auto"
            >
              Reuse Stripe Details
            </button>
            <button
              type="button"
              onClick={handleStripeOnboarding}
              className="button inline-flex items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:w-auto"
            >
              Update Stripe Details
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="text-sm text-gray-600">
            Connect your Stripe account to receive payments for this event.
          </p>
          <button
            type="button"
            onClick={handleStripeOnboarding}
            className="button inline-flex items-center justify-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 sm:w-auto"
          >
            Connect with Stripe
          </button>
        </>
      )}
    </div>
  );
}
