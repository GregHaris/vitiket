'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

import { ArrowLeft, X } from 'lucide-react';
import { Button } from '@ui/button';
import { CheckoutButtonProps } from '@/types';
import { Dialog, DialogContent, DialogHeader } from '@ui/dialog';
import CheckoutDetails from '@shared/CheckoutDetails';
import CancelCheckoutDialog from '@shared/CancelCheckoutDialog';

export default function CheckoutButton({ event }: CheckoutButtonProps) {
  const searchParams = useSearchParams();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

  // Calculate total quantity and total price
  let totalQuantity = 0;
  let totalPrice = 0;
  const selectedTickets: { [key: string]: number } = {};

  if (event.isFree) {
    totalQuantity = Number(searchParams.get('free')) || 0;
    selectedTickets['free'] = totalQuantity;
  } else {
    event.priceCategories?.forEach((category, index) => {
      const categoryId = `category-${index}`;
      const quantity = Number(searchParams.get(categoryId)) || 0;
      if (quantity > 0) {
        selectedTickets[category.name] = quantity;
        totalQuantity += quantity;
        totalPrice += quantity * Number(category.price);
      }
    });
  }

  const handleCheckout = () => {
    setIsDialogOpen(true);
  };

  const handleCloseCheckout = () => {
    setIsCancelDialogOpen(true);
  };

  const handleConfirmCancel = () => {
    setIsDialogOpen(false);
    setIsCancelDialogOpen(false);
  };

  const handleBackToEvent = () => {
    setIsDialogOpen(false);
  };

  return (
    <>
      {/* Checkout Button */}
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
            Checkout - ${totalPrice}
          </Button>
        )}
      </div>

      {/* Checkout Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent
          className="sm:max-w-[90%] md:max-w-[800px] lg:max-w-[1000px] w-full max-h-[90vh] overflow-y-auto border-none bg-white rounded-lg shadow-lg p-0"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader className="p-6 border-b flex flex-row items-center justify-between">
            <button
              onClick={handleBackToEvent}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Event
            </button>

            <button
              onClick={handleCloseCheckout}
              className="text-gray-600 hover:text-gray-900"
            >
              <X className="w-5 h-5" />
            </button>
          </DialogHeader>

          {/* Checkout Details */}
          <CheckoutDetails
            event={event}
            quantity={totalQuantity}
            totalPrice={totalPrice}
          />
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <CancelCheckoutDialog
        isOpen={isCancelDialogOpen}
        onOpenChange={setIsCancelDialogOpen}
        onConfirm={handleConfirmCancel}
      />
    </>
  );
}
