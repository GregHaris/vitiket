'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

import { Button } from '@ui/button';
import { CheckoutButtonProps, CurrencyKey } from '@/types';
import { currencySymbols } from '@/constants';
import { Dialog, DialogContent } from '@ui/dialog';
import CheckoutDetails from '@shared/CheckoutDetails';

export default function CheckoutButton({ event }: CheckoutButtonProps) {
  const searchParams = useSearchParams();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Calculate total quantity and total price
  let totalQuantity = 0;
  let totalPrice = 0;
  const selectedTickets: { [key: string]: number } = {};

  if (event.isFree) {
    totalQuantity = Number(searchParams?.get('free')) || 0;
    selectedTickets['free'] = totalQuantity;
  } else {
    event.priceCategories?.forEach((category, index) => {
      const categoryId = `category-${index}`;
      const quantity = Number(searchParams?.get(categoryId)) || 0;
      if (quantity > 0) {
        selectedTickets[category.name] = quantity;
        totalQuantity += quantity;
        totalPrice += quantity * Number(category.price);
      }
    });
  }

  const currencySymbol = currencySymbols[event.currency as CurrencyKey] || '';

  const handleCheckout = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 w-full md:sticky md:top-4 z-50 p-3 bg-white rounded-md shadow-gray-300 shadow-lg transition-all duration-300">
        {totalQuantity === 0 ? (
          <Button
            className="button w-full md:w-[300px] cursor-pointer font-bold transition-all duration-100"
            size={'lg'}
            onClick={() => {
              document
                .getElementById('price-section')
                ?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Get Tickets
          </Button>
        ) : (
          <Button
            className="button w-full md:w-[300px] cursor-pointer font-bold transition-all duration-300"
            size={'lg'}
            onClick={handleCheckout}
          >
            Checkout - {currencySymbol}
            {totalPrice}
          </Button>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent
          className="sm:max-w-[90%] md:max-w-[800px] lg:max-w-[1000px] w-full max-h-[90vh] overflow-y-auto border-none bg-white rounded-lg shadow-lg p-0"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <CheckoutDetails
            event={event}
            quantity={totalQuantity}
            totalPrice={totalPrice}
            selectedTickets={selectedTickets}
            onCloseDialog={handleCloseDialog}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
