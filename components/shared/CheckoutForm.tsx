'use client';

import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import Link from 'next/link';

import { Button } from '@ui/button';
import { checkoutOrder } from '@/lib/actions/order.actions';
import { createOrder } from '@/lib/actions/order.actions';
import { checkoutFormValues } from '@/lib/validator';
import { CheckoutDetailsProps } from '@/types';
import { Form } from '@ui/form';

import PaymentMethodSelector from './FormPaymentMethods';
import UserInfoInput from './FormUserInfoInput';
import { useForm } from 'react-hook-form';
import { useState } from 'react';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

const CheckoutFormContent = ({
  event,
  quantity,
  totalPrice,
  userId,
  isNigerianEvent,
  onCloseDialog,
  form,
  onSignOut,
}: {
  event: CheckoutDetailsProps['event'];
  quantity: number;
  totalPrice: number;
  userId: string | null;
  isNigerianEvent: boolean;
  onCloseDialog: () => void;
  form: ReturnType<typeof useForm<checkoutFormValues>>;
  onSignOut: () => Promise<void>;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: checkoutFormValues) => {
    console.log('Form submitted:', data); // Debug log
    if (!stripe || !elements) {
      console.log('Stripe or Elements not ready');
      setError('Payment system not initialized. Please try again.');
      return;
    }

    try {
      const order = {
        eventTitle: event.title,
        buyerId: userId || 'guest',
        eventId: event._id,
        price: totalPrice.toString(),
        isFree: event.isFree || false,
        currency: event.currency,
        quantity: quantity,
        buyerEmail: data.email,
        paymentMethod: data.paymentMethod,
      };
      console.log('Calling checkoutOrder with:', order); // Debug log

      const result = await checkoutOrder(order);
      console.log('checkoutOrder result:', result); // Debug log

      if (data.paymentMethod === 'card' && !isNigerianEvent) {
        if (!result || !result.clientSecret) {
          throw new Error('Failed to get payment intent from server');
        }

        const cardElement = elements.getElement(CardElement);
        if (!cardElement) throw new Error('Card element not found');

        const { error: paymentError, paymentIntent } =
          await stripe.confirmCardPayment(result.clientSecret, {
            payment_method: {
              card: cardElement,
              billing_details: {
                name: `${data.firstName} ${data.lastName}`,
                email: data.email,
              },
            },
          });

        if (paymentError) {
          setError(paymentError.message || 'Payment failed');
          console.log('Payment error:', paymentError); // Debug log
        } else if (paymentIntent?.status === 'succeeded') {
          console.log('Payment succeeded:', paymentIntent); // Debug log
          await createOrder({
            stripeId: paymentIntent.id,
            eventId: order.eventId,
            buyerId: order.buyerId === 'guest' ? undefined : order.buyerId,
            totalAmount: totalPrice.toString(),
            currency: order.currency,
            quantity: order.quantity,
            buyerEmail: data.email,
            paymentMethod: 'card',
            createdAt: new Date(),
          });
          onCloseDialog();
        }
      }
      // Note: Paystack, Google Pay, Apple Pay redirect via checkoutOrder, so no further action needed here
    } catch (error) {
      console.error('Checkout failed:', error);
      setError('Checkout failed. Please try again.');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      {userId ? (
        <div className="mb-6 text-sm text-gray-600 space-y-6">
          <p>
            Logged in as <strong>{form.getValues('email')}</strong>.{' '}
            <button
              onClick={onSignOut}
              className="cursor-pointer text-blue-600 hover:underline"
            >
              Not you?
            </button>
          </p>
          <p>Please confirm details.</p>
        </div>
      ) : (
        <div className="mb-6 text-sm text-gray-600">
          <p>
            <Link
              href={`/sign-in?redirect_url=${encodeURIComponent(
                window.location.href + '&checkout=true'
              )}`}
              className="cursor-pointer text-blue-600 hover:underline"
            >
              Sign in
            </Link>{' '}
            for faster checkout.
          </p>
        </div>
      )}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <UserInfoInput
            name="firstName"
            label="First name"
            placeholder="Enter your first name"
            required
          />
          <UserInfoInput
            name="lastName"
            label="Last name"
            placeholder="Enter your last name"
            required
          />
          <UserInfoInput
            name="email"
            label="Email"
            placeholder="Enter your email"
            required
          />
          {!userId && (
            <UserInfoInput
              name="confirmEmail"
              label="Confirm email"
              placeholder="Confirm your email"
              required
            />
          )}
          <PaymentMethodSelector
            isNigerianEvent={isNigerianEvent}
            orderData={{
              eventTitle: event.title,
              buyerId: userId || '',
              eventId: event._id,
              price: totalPrice.toString(),
              isFree: event.isFree || false,
              currency: event.currency,
              quantity: quantity,
              buyerEmail: form.getValues('email'),
            }}
          />
          {!isNigerianEvent && form.watch('paymentMethod') === 'card' && (
            <div className="space-y-4">
              <label className="text-sm font-medium">Card Information</label>
              <div className="border border-gray-300 rounded-md">
                <CardElement
                  options={{
                    style: {
                      base: {
                        fontSize: '14px',
                        fontWeight: '400',
                        '::placeholder': {
                          color: '#aab7c4',
                        },
                      },
                      invalid: {
                        color: '#9e2146',
                      },
                    },
                    classes: {
                      base: 'nested-input-field p-regular-14',
                      focus: 'border-none',
                    },
                  }}
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Button
                type="submit"
                className="w-full button"
                disabled={!stripe || form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? 'Processing...' : 'Checkout'}
              </Button>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
};

export default function CheckoutForm({
  event,
  quantity,
  totalPrice,
  userId,
  isNigerianEvent,
  onCloseDialog,
  form,
  onSignOut,
}: {
  event: CheckoutDetailsProps['event'];
  quantity: number;
  totalPrice: number;
  userId: string | null;
  isNigerianEvent: boolean;
  onCloseDialog: () => void;
  form: ReturnType<typeof useForm<checkoutFormValues>>;
  onSignOut: () => Promise<void>;
}) {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutFormContent
        event={event}
        quantity={quantity}
        totalPrice={totalPrice}
        userId={userId}
        isNigerianEvent={isNigerianEvent}
        onCloseDialog={onCloseDialog}
        form={form}
        onSignOut={onSignOut}
      />
    </Elements>
  );
}
