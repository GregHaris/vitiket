'use client';

import { PaymentDetailsStripeOnboardingProps } from '@/types';

export default function StripeOnboarding({
  userId,
  setMessage,
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
      <p>Connect your Stripe account to receive payments for this event.</p>
      <button
        type="button"
        onClick={handleStripeOnboarding}
        className="button bg-primary text-white px-3 py-2 rounded-md"
      >
        Connect with Stripe
      </button>
    </div>
  );
}
