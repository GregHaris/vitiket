'use client';

import { useClerk, useUser } from '@clerk/nextjs';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { CheckoutDetailsProps, CurrencyKey } from '@/types';
import { checkoutFormSchema, checkoutFormValues } from '@/lib/validator';
import { currencySymbols } from '@/constants';
import { getUserIdByClerkId } from '@/lib/actions/user.actions';

import CancelCheckoutDialog from './CancelCheckoutDialog';
import CheckoutHeader from './CheckoutHeader';
import CheckoutForm from './CheckoutForm';
import OrderSummary from './OrderSummary';

export default function CheckoutDetails({
  event,
  quantity,
  totalPrice,
  selectedTickets,
  onCloseDialog,
}: CheckoutDetailsProps) {
  const { user } = useUser();
  const clerk = useClerk();
  const searchParams = useSearchParams();
  const router = useRouter();

  const currencySymbol = currencySymbols[event.currency as CurrencyKey] || '₦';
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const form = useForm<checkoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.emailAddresses[0]?.emailAddress || '',
      confirmEmail: user?.emailAddresses[0]?.emailAddress || '',
      paymentMethod: 'paystack',
    },
  });

  useEffect(() => {
    const fetchMongoUserId = async () => {
      if (user) {
        try {
          const userData = await getUserIdByClerkId(user.id);
          setUserId(userData._id);
          form.reset({
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.emailAddresses[0]?.emailAddress || '',
            confirmEmail: user.emailAddresses[0]?.emailAddress || '',
            paymentMethod: 'paystack',
          });
        } catch (error) {
          console.error('Failed to fetch MongoDB user ID:', error);
        }
      }
    };
    fetchMongoUserId();
  }, [user, form]);

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
    onCloseDialog(true);
  };

  const handleBack = () => {
    onCloseDialog(false);
  };

  const handleSignOut = async () => {
    await clerk.signOut({ redirectUrl: window.location.href });
    form.reset(
      {
        firstName: '',
        lastName: '',
        email: '',
        confirmEmail: '',
      },
      { keepValues: false }
    );
    form.trigger();
  };

  return (
    <div className="flex flex-col md:flex-row">
      <div className="w-full md:w-1/2">
        <CheckoutHeader
          onBack={handleBack}
          onCancel={() => setIsCancelDialogOpen(true)}
        />
        <CheckoutForm
          event={event}
          quantity={quantity}
          totalPrice={totalPrice}
          userId={userId}
          onCloseDialog={onCloseDialog}
          form={form}
          onSignOut={handleSignOut}
          priceCategories={selectedTickets}
        />
      </div>
      <OrderSummary
        event={event}
        currencySymbol={currencySymbol}
        totalPrice={totalPrice}
        selectedTickets={selectedTickets}
      />
      <CancelCheckoutDialog
        isOpen={isCancelDialogOpen}
        onOpenChange={setIsCancelDialogOpen}
        onConfirm={handleConfirmCancel}
      />
    </div>
  );
}
