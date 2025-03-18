'use client';

import {
  CardElement,
  Elements,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useForm } from 'react-hook-form';
import { useState } from 'react';

import { Button } from '@ui/button';
import { checkoutOrder } from '@/lib/actions/order.actions';
import { createOrder } from '@/lib/actions/order.actions';
import { CheckoutDetailsProps, CheckoutOrderResponse } from '@/types';
import { checkoutFormValues } from '@/lib/validator';
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
  onCloseDialog: () => void;
  form: ReturnType<typeof useForm<checkoutFormValues>>;
  onSignOut: () => Promise<void>;
  priceCategories?: { name: string; price: string; quantity: number }[];
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: checkoutFormValues) => {
    if (!stripe || !elements) {
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
        ...(event.isFree ? {} : { priceCategories }),
        buyerEmail: data.email,
        paymentMethod: data.paymentMethod,
      };

      const result: CheckoutOrderResponse = await checkoutOrder(order);

      if (data.paymentMethod === 'card' && !isNigerianEvent) {
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
          } else if (paymentIntent?.status === 'succeeded') {
            await createOrder({
              stripeId: paymentIntent.id,
              eventId: order.eventId,
              buyerId: order.buyerId === 'guest' ? undefined : order.buyerId,
              totalAmount: totalPrice.toString(),
              currency: order.currency,
              quantity: order.quantity,
              ...(event.isFree ? {} : { priceCategories }),
              buyerEmail: data.email,
              paymentMethod: 'card',
              createdAt: new Date(),
            });
            onCloseDialog();
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
    } catch (error) {
      console.error('Checkout failed:', error);
      setError('Checkout failed. Please try again.');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
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
          {!isNigerianEvent && form.watch('paymentMethod') === 'card' && (
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
              <Button
                type="submit"
                className="w-full button"
                disabled={!stripe || form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? 'Processing...' : 'Checkout'}
              </Button>
            </div>
          )}
          {(isNigerianEvent || form.watch('paymentMethod') !== 'card') && (
            <Button
              type="submit"
              className="w-full button"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? 'Processing...' : 'Checkout'}
            </Button>
          )}
          {userId && (
            <Button
              type="button"
              onClick={onSignOut}
              className="w-full button bg-gray-200 text-black hover:bg-gray-300"
            >
              Sign Out
            </Button>
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
  priceCategories,
}: {
  event: CheckoutDetailsProps['event'];
  quantity: number;
  totalPrice: number;
  userId: string | null;
  isNigerianEvent: boolean;
  onCloseDialog: () => void;
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
