'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from '../ui/button';
import { IEvent } from '@/lib/database/models/event.model';
import Checkout from './Checkout';

const CheckoutButton = ({ event }: { event: IEvent }) => {
  const { user } = useUser();
  const [quantity, setQuantity] = useState(0);
  const [selectedPriceCategory, setSelectedPriceCategory] = useState<{
    name: string;
    price: string;
  } | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const handleQuantityChange = (amount: number) => {
    setQuantity((prev) => Math.max(0, prev + amount));
  };

  const totalPrice = selectedPriceCategory
    ? Number(selectedPriceCategory.price) * quantity
    : event.priceCategories?.[0]
    ? Number(event.priceCategories[0].price) * quantity
    : 0;

  const handleScrollToPriceSection = () => {
    document
      .getElementById('price-section')
      ?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const handleScroll = () => {
      const priceSection = document.getElementById('price-section');
      if (priceSection) {
        const { top } = priceSection.getBoundingClientRect();
        setIsVisible(top < window.innerHeight);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const userId = user?.publicMetadata.userId as string;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 md:sticky md:top-4 z-50 flex justify-end p-4 bg-white shadow-lg md:bg-transparent md:shadow-none${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      {quantity === 0 ? (
        <Button
          className="button w-full md:w-auto cursor-pointer font-bold"
          size={'lg'}
          onClick={handleScrollToPriceSection}
        >
          Get Tickets
        </Button>
      ) : (
        <Checkout
          event={event}
          userId={userId}
          quantity={quantity}
          totalPrice={totalPrice}
        />
      )}
    </div>
  );
};

export default CheckoutButton;
