'use client';

import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';

import { IEvent } from '@/lib/database/models/event.model';
import { Button } from '@/components/ui/button';

interface CheckoutButtonProps {
  event: IEvent;
}

export default function CheckoutButton({ event }: CheckoutButtonProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Calculate total quantity and total price
  let totalQuantity = 0;
  let totalPrice = 0;

  if (event.isFree) {
    totalQuantity = Number(searchParams.get('free')) || 0;
  } else {
    event.priceCategories?.forEach((category, index) => {
      const categoryId = `category-${index}`;
      const quantity = Number(searchParams.get(categoryId)) || 0;
      totalQuantity += quantity;
      totalPrice += quantity * Number(category.price);
    });
  }

  const handleCheckout = () => {
    router.push(
      `/events/${event._id}/checkout?quantity=${totalQuantity}&totalPrice=${totalPrice}`
    );
  };

  return (
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
  );
}
