'use client';

import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import Link from 'next/link';

import { Button } from '@ui/button';
import {
  CheckoutDetailsProps,
  CheckoutOrderParams,
  CheckoutOrderResponse,
} from '@/types';
import { checkoutFormValues } from '@/lib/validator';
import { checkoutOrder, createOrder } from '@/lib/actions/order.actions';
import { Form } from '@ui/form';
import UserInfoInput from './FormUserInfoInput';
import PaymentMethodSelector from './FormPaymentMethods';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

const CheckoutFormContent = ({
  event,
  quantity,
  totalPrice,
  userId,
  isNigerianEvent,
  form,
  onSignOut,
  priceCategories,
}: {
  event: CheckoutDetailsProps['event'];
  quantity: number;
  totalPrice: number;
  userId: string | null;
  isNigerianEvent: boolean;
  onCloseDialog: (reset?: boolean) => void;
  form: ReturnType<typeof useForm<checkoutFormValues>>;
  onSignOut: () => Promise<void>;
  priceCategories?: { name: string; price: string; quantity: number }[];
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);

  const handleSignOut = async () => {
    await onSignOut();
  };

  const onSubmit = async (data: checkoutFormValues) => {
    try {
      const orderParams: CheckoutOrderParams = {
        eventTitle: event.title,
        buyerId: userId || 'guest',
        eventId: event._id,
        price: totalPrice.toString(),
        isFree: event.isFree || false,
        currency: event.currency,
        quantity: quantity,
        ...(event.isFree ? {} : { priceCategories }),
        buyerEmail: data.email,
        paymentMethod: event.isFree ? 'none' : data.paymentMethod,
        firstName: data.firstName,
        lastName: data.lastName,
      };

      if (event.isFree) {
        await checkoutOrder(orderParams);
        const newOrder = await createOrder({
          eventId: event._id,
          buyerId: userId || 'guest',
          totalAmount: '0',
          currency: event.currency,
          quantity: quantity,
          buyerEmail: data.email,
          paymentMethod: 'none',
          firstName: data.firstName,
          lastName: data.lastName,
        });

        if (!userId) {
          localStorage.setItem('guestCheckoutEmail', data.email);
        }
        window.location.href = `/events/${event._id}?success=${newOrder._id}`;
      } else if (!isNigerianEvent) {
        if (!stripe || !elements) {
          setError('Payment system not initialized. Please try again.');
          return;
        }

        const result = (await checkoutOrder(
          orderParams
        )) as CheckoutOrderResponse;

        if (data.paymentMethod === 'card') {
          if ('clientSecret' in result && result.clientSecret) {
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
              return;
            }

            if (paymentIntent?.status === 'succeeded') {
              const newOrder = await createOrder({
                eventId: event._id,
                buyerId: userId || 'guest',
                stripeId: paymentIntent.id,
                totalAmount: totalPrice.toString(),
                currency: event.currency,
                priceCategories,
                quantity: quantity,
                buyerEmail: data.email,
                paymentMethod: data.paymentMethod,
                firstName: data.firstName,
                lastName: data.lastName,
              });

              if (!userId) {
                localStorage.setItem('guestCheckoutEmail', data.email);
              }
              window.location.href = `/events/${event._id}?success=${newOrder._id}`;
            }
          } else {
            throw new Error('Failed to get payment intent from server');
          }
        } else {
          if ('url' in result && result.url) {
            window.location.href = result.url;
          } else {
            throw new Error('Unexpected response from payment provider');
          }
        }
      }
    } catch (error: any) {
      console.error('Checkout failed:', error);
      if (
        error.message === 'You have already purchased a ticket for this event.'
      ) {
        setError(error.message);
      } else {
        setError('Checkout failed. Please try again.');
      }
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
              onClick={handleSignOut}
              className="cursor-pointer text-blue-600 hover:underline"
            >
              Not you?
            </button>
          </p>
          <p>If you, please confirm details.</p>
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
            for a faster checkout experience.
          </p>
        </div>
      )}

      <Form {...form}>
        <form
          onSubmit={(e) => {
            form.handleSubmit(onSubmit)(e);
          }}
          className="space-y-6"
        >
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
          {!event.isFree && (
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
                ...(event.isFree ? {} : { priceCategories }),
                buyerEmail: form.getValues('email'),
              }}
            />
          )}
          {!event.isFree &&
            !isNigerianEvent &&
            form.watch('paymentMethod') === 'card' && (
              <div className="space-y-4">
                <label className="text-sm font-medium">Card Information</label>
                <div className="border border-gray-300 rounded-md p-2">
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
              </div>
            )}
          <Button
            type="submit"
            className="w-full button"
            disabled={(!stripe && !event.isFree) || form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? 'Processing...' : 'Checkout'}
          </Button>
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
  priceCategories,
}: {
  event: CheckoutDetailsProps['event'];
  quantity: number;
  totalPrice: number;
  userId: string | null;
  isNigerianEvent: boolean;
  onCloseDialog: (reset?: boolean) => void;
  form: ReturnType<typeof useForm<checkoutFormValues>>;
  onSignOut: () => Promise<void>;
  priceCategories?: { name: string; price: string; quantity: number }[];
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
        priceCategories={priceCategories}
      />
    </Elements>
  );
}
