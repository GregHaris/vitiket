'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useUser } from '@clerk/nextjs';
import { useSearchParams } from 'next/navigation';

import { CheckoutDetailsProps } from '@/types';
import { checkoutOrder } from '@/lib/actions/order.actions';
import { checkoutFormSchema, checkoutFormValues } from '@/lib/validator';
import { Button } from '@ui/button';
import { Form } from '@ui/form';
import Image from 'next/image';

import FormFirstNameInput from './FormFirstNameInput';
import FormLastNameInput from './FormLastNameInput';
import FormEmailInput from './FormEmailInput';
import FormPaymentMethodSelector from './FormPaymentMethodSelector';

export default function CheckoutDetails({
  event,
  quantity,
  totalPrice,
}: CheckoutDetailsProps) {
  const { user } = useUser();
  const searchParams = useSearchParams();

  // Get selected ticket categories and quantities from URL query parameters
  const selectedTickets: { [key: string]: number } = {};
  event.priceCategories?.forEach((category) => {
    const quantity = Number(searchParams.get(category.name)) || 0;
    if (quantity > 0) {
      selectedTickets[category.name] = quantity;
    }
  });

  const form = useForm<checkoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.emailAddresses[0]?.emailAddress || '',
      paymentMethod: 'card',
    },
  });

  const onSubmit = async () => {
    try {
      // Prepare the order data
      const order = {
        eventTitle: event.title,
        buyerId: user?.id || '',
        eventId: event._id,
        price: totalPrice.toString(),
        isFree: event.isFree || false,
        currency: event.currency,
        quantity: quantity,
      };

      // Redirect to Stripe checkout
      await checkoutOrder(order);
    } catch (error) {
      console.error('Checkout failed:', error);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 p-6">
      {/* Checkout Form */}
      <div className="w-full md:w-1/2">
        <h1 className="text-2xl font-bold mb-6">Checkout</h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormFirstNameInput />
            <FormLastNameInput />
            <FormEmailInput />
            <FormPaymentMethodSelector />

            {/* Submit Button */}
            <Button type="submit" className="w-full button">
              {form.formState.isSubmitting ? 'Processing...' : 'Checkout'}
            </Button>
          </form>
        </Form>
      </div>

      {/* Order Summary */}
      <div className="w-full md:w-1/2 bg-gray-50 rounded-lg">
        <Image
          src={event.imageUrl}
          alt={event.title}
          width={500}
          height={500}
          className="w-full h-48 object-cover rounded-lg"
        />
        <div className="space-y-6 p-5">
          <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
          <h3 className="text-lg font-bold">{event.title}</h3>
          <p className="text-sm text-gray-600">{event.subtitle}</p>
          <div>
            <h4 className="font-bold">Tickets</h4>
            {Object.entries(selectedTickets).map(([name, quantity]) => (
              <p key={name}>
                {quantity} x {name}
              </p>
            ))}
          </div>
          <div>
            <h4 className="font-bold">Total</h4>
            <p className="text-lg font-bold">${totalPrice}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
