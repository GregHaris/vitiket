'use client';

import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { CheckoutButtonProps } from '@/types';

export default function CheckoutButton({ event }: CheckoutButtonProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

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
    const queryParams = new URLSearchParams();
    queryParams.set('quantity', totalQuantity.toString());
    queryParams.set('totalPrice', totalPrice.toString());
    Object.entries(selectedTickets).forEach(([name, quantity]) => {
      queryParams.set(name, quantity.toString());
    });

    router.push(`/events/${event._id}/checkout?${queryParams.toString()}`);
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
