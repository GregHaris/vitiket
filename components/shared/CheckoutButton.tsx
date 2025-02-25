'use client';

import { useSearchParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Button } from '../ui/button';
import { IEvent } from '@/lib/database/models/event.model';
import Checkout from './Checkout';

interface CheckoutButtonProps {
  event: IEvent;
}

const CheckoutButton = ({ event }: CheckoutButtonProps) => {
  const { user } = useUser();
  const searchParams = useSearchParams();

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

  return (
    <div className="fixed bottom-0 left-0 right-0 md:sticky md:top-4 z-50 flex justify-end p-4 bg-white shadow-lg md:bg-transparent md:shadow-none">
      {totalQuantity === 0 ? (
        <Button
          className="button w-full md:w-auto cursor-pointer font-bold px-25"
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
        <Checkout
          event={event}
          userId={user?.publicMetadata.userId as string}
          quantity={totalQuantity}
          totalPrice={totalPrice}
        />
      )}
    </div>
  );
};

export default CheckoutButton;
