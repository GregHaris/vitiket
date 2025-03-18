'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@ui/button';
import { CheckoutButtonProps, CurrencyKey } from '@/types';
import { currencySymbols } from '@/constants';
import { Dialog, DialogContent, DialogDescription } from '@ui/dialog';
import CheckoutDetails from '@shared/CheckoutDetails';
import { useCheckout } from '@shared/CheckoutContext';

export default function CheckoutButton({ event }: CheckoutButtonProps) {
  const searchParams = useSearchParams();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { resetCheckout } = useCheckout();

  useEffect(() => {
    if (searchParams?.get('checkout') === 'true') setIsDialogOpen(true);
  }, [searchParams]);

  let totalQuantity = 0;
  let ticketPrice = 0;
  let priceCategories:
    | { name: string; price: string; quantity: number }[]
    | undefined;

  if (event.isFree) {
    totalQuantity = Number(searchParams?.get('free')) || 0;
  } else {
    priceCategories = [];
    event.priceCategories?.forEach((category, index) => {
      const categoryId = `category-${index}`;
      const quantity = Number(searchParams?.get(categoryId)) || 0;
      if (quantity > 0) {
        priceCategories?.push({
          name: category.name,
          price: category.price,
          quantity,
        });
        totalQuantity += quantity;
        ticketPrice += quantity * Number(category.price);
      }
    });
  }

  const platformFee = ticketPrice * 0.05;
  const totalPrice = ticketPrice + platformFee;

  useEffect(() => {
    if (searchParams?.get('checkout') === 'true' && totalQuantity === 0) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('checkout');
      window.history.replaceState(
        {},
        '',
        `${window.location.pathname}?${params.toString()}`
      );
    }
  }, [searchParams, totalQuantity]);

  const currencySymbol = currencySymbols[event.currency as CurrencyKey] || '';

  const handleCheckout = () => setIsDialogOpen(true);
  const handleCloseDialog = (reset: boolean = false) => {
    if (reset) {
      resetCheckout(); // Trigger the reset event
      const params = new URLSearchParams(searchParams?.toString());
      params.delete('checkout');
      if (event.isFree) {
        params.delete('free');
      } else {
        event.priceCategories?.forEach((_, index) => {
          params.delete(`category-${index}`);
        });
      }
      window.history.replaceState(
        {},
        '',
        `${window.location.pathname}?${params.toString()}`
      );
    }
    setIsDialogOpen(false);
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 w-full md:sticky md:top-4 z-50 p-3 bg-white rounded-md shadow-gray-300 shadow-lg transition-all duration-300">
        {totalQuantity === 0 ? (
          <Button
            className="button w-full md:w-[300px] cursor-pointer font-bold transition-all duration-100"
            size={'lg'}
            onClick={() =>
              document
                .getElementById('price-section')
                ?.scrollIntoView({ behavior: 'smooth' })
            }
          >
            Get Tickets
          </Button>
        ) : (
          <Button
            className="rounded-md min-h-[56px] cursor-pointer text-primary-50 w-full md:w-[300px] font-bold transition-all duration-300 flex flex-col items-center justify-center gap-1 py-2"
            size={'lg'}
            onClick={handleCheckout}
          >
            <span>Checkout</span>
            <span>
              {currencySymbol}
              {ticketPrice.toLocaleString()} + {currencySymbol}
              {platformFee.toLocaleString()}{' '}
              <span className="text-sm">(5% fee)</span>
            </span>
          </Button>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent
          className="sm:max-w-[90%] md:max-w-[800px] lg:max-w-[1000px] w-full max-h-[90vh] overflow-y-auto border-none bg-white rounded-lg shadow-lg p-0"
          onInteractOutside={(e) => e.preventDefault()}
          aria-describedby="checkout-dialog-description"
        >
          <DialogDescription
            id="checkout-dialog-description"
            className="sr-only"
          >
            Checkout details and order summary
          </DialogDescription>
          <CheckoutDetails
            event={event}
            quantity={totalQuantity}
            totalPrice={totalPrice}
            selectedTickets={priceCategories}
            onCloseDialog={handleCloseDialog}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
