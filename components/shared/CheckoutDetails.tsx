'use client';

import { ArrowLeft, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@ui/button';
import { CheckoutDetailsProps, CurrencyKey } from '@/types';
import { checkoutFormSchema, checkoutFormValues } from '@/lib/validator';
import { checkoutOrder } from '@/lib/actions/order.actions';
import { currencySymbols } from '@/constants';
import { DialogHeader, DialogTitle } from '@ui/dialog';
import { Form } from '@ui/form';
import { Separator } from '@ui/separator';

import CancelCheckoutDialog from './CancelCheckoutDialog';
import PaymentMethodSelector from './FormPaymentMethodSelector';
import UserInfoInput from './FormUserInfoInput';

export default function CheckoutDetails({
  event,
  quantity,
  totalPrice,
  selectedTickets,
  onCloseDialog,
}: CheckoutDetailsProps & {
  selectedTickets: { [key: string]: number };
}) {
  const { user } = useUser();
  const clerk = useClerk();
  const searchParams = useSearchParams();
  const router = useRouter();

  const currencySymbol = currencySymbols[event.currency as CurrencyKey] || '';
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

  const form = useForm<checkoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.emailAddresses[0]?.emailAddress || '',
      confirmEmail: user?.emailAddresses[0]?.emailAddress || '',
      paymentMethod: 'card',
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.emailAddresses[0]?.emailAddress || '',
        confirmEmail: user.emailAddresses[0]?.emailAddress || '',
        paymentMethod: 'card',
      });
    }
  }, [user, form]);

  const onSubmit = async (data: checkoutFormValues) => {
    try {
      const order = {
        eventTitle: event.title,
        buyerId: user?.id || '',
        eventId: event._id,
        price: totalPrice.toString(),
        isFree: event.isFree || false,
        currency: event.currency,
        quantity: quantity,
        buyerEmail: data.email, 
      };

      // Redirect to Paystack checkout
      await checkoutOrder(order);
      onCloseDialog();
    } catch (error) {
      console.error('Checkout failed:', error);
    }
  };

  const resetSearchParams = () => {
    const params = new URLSearchParams(searchParams?.toString());
    params.delete('checkout');
    event.priceCategories?.forEach((_, index) => {
      params.delete(`category-${index}`);
    });
    params.delete('free');
    router.replace(`?${params.toString()}`);
  };

  const handleConfirmCancel = () => {
    resetSearchParams();
    setIsCancelDialogOpen(false);
    onCloseDialog();
  };

  const handleSignOut = async () => {
    await clerk.signOut({ redirectUrl: window.location.href });
    form.reset(
      {
        firstName: '',
        lastName: '',
        email: '',
        confirmEmail: '',
        paymentMethod: 'card',
      },
      { keepValues: false }
    );
    form.trigger();
  };

  return (
    <div className="flex flex-col md:flex-row">
      <div className="w-full md:w-1/2">
        <DialogHeader className="p-6 border-b flex flex-row items-center justify-between">
          <button
            className="cursor-pointer flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
            onClick={() => onCloseDialog()}
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Event
          </button>
          <button
            className="cursor-pointer text-gray-600 hover:bg-gray-100 p-2 rounded-full"
            title="Cancel checkout"
            onClick={() => setIsCancelDialogOpen(true)}
          >
            <X className="w-5 h-5" />
          </button>
        </DialogHeader>
        <DialogTitle className="sr-only">Checkout Details</DialogTitle>

        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">Checkout</h1>

          {user ? (
            <div className="mb-6 text-sm text-gray-600 space-y-6">
              <p>
                Logged in as{' '}
                <strong>{user.emailAddresses[0]?.emailAddress}</strong>.{' '}
                <button
                  onClick={handleSignOut}
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
              {!user && (
                <UserInfoInput
                  name="confirmEmail"
                  label="Confirm email"
                  placeholder="Confirm your email"
                  required
                />
              )}
              <PaymentMethodSelector />
              <Button type="submit" className="w-full button">
                {form.formState.isSubmitting ? 'Processing...' : 'Checkout'}
              </Button>
            </form>
          </Form>
        </div>
      </div>

      <div className="w-full md:w-1/2 bg-gray-200">
        <Image
          src={event.imageUrl}
          alt={event.title}
          width={500}
          height={500}
          className="w-full h-48 object-cover"
        />
        <div className="space-y-6 p-5">
          <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
          <h3 className="text-lg font-bold">{event.title}</h3>
          <p className="text-sm text-gray-600">{event.subtitle}</p>
          <Separator className="bg-gray-300" />
          <div>
            <h4 className="font-bold">Tickets</h4>
            {Object.entries(selectedTickets).map(([name, qty]) => (
              <p key={name} className="text-sm text-gray-500">
                {qty} x {name}
              </p>
            ))}
          </div>
          <Separator className="bg-gray-300" />
          <div>
            <h4 className="font-bold">Total</h4>
            <p className="text-lg font-bold">
              {currencySymbol}
              {parseFloat(totalPrice.toString()).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <CancelCheckoutDialog
        isOpen={isCancelDialogOpen}
        onOpenChange={setIsCancelDialogOpen}
        onConfirm={handleConfirmCancel}
      />
    </div>
  );
}
