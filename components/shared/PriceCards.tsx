'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PriceCard from './PriceCardUI';
import { PriceCardsProps } from '@/types';
import { useCheckout } from '@shared/CheckoutContext';

const PriceCards = ({ event, currencySymbol }: PriceCardsProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { onResetCheckout } = useCheckout();

  const priceCategoriesWithIds = event.priceCategories?.map(
    (category, index) => ({
      ...category,
      id: `category-${index}`,
    })
  );

  const [quantities, setQuantities] = useState<{ [key: string]: number }>(
    () => {
      const initialQuantities: { [key: string]: number } = {};
      if (event.isFree) {
        initialQuantities['free'] = Number(searchParams?.get('free')) || 0;
      } else {
        priceCategoriesWithIds?.forEach((category) => {
          initialQuantities[category.id] =
            Number(searchParams?.get(category.id)) || 0;
        });
      }
      return initialQuantities;
    }
  );

  // Reset quantities when the reset event is triggered
  useEffect(() => {
    const unsubscribe = onResetCheckout(() => {
      setQuantities((prev) => {
        const resetQuantities: { [key: string]: number } = {};
        Object.keys(prev).forEach((key) => {
          resetQuantities[key] = 0;
        });
        return resetQuantities;
      });
    });
    return unsubscribe; 
  }, [onResetCheckout]);

  // Sync URL with quantities
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const newSearchParams = new URLSearchParams(searchParams?.toString());
      Object.entries(quantities).forEach(([categoryId, quantity]) => {
        if (quantity > 0) {
          newSearchParams.set(categoryId, quantity.toString());
        } else {
          newSearchParams.delete(categoryId);
        }
      });
      router.replace(`?${newSearchParams.toString()}`, { scroll: false });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [quantities, searchParams, router]);

  const handleQuantityChange = (categoryId: string, amount: number) => {
    setQuantities((prev) => {
      const newQuantity = Math.max(0, (prev[categoryId] || 0) + amount);
      return { ...prev, [categoryId]: newQuantity };
    });
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {event.isFree ? (
        <PriceCard
          title="Free Ticket"
          price="Free"
          quantity={quantities['free'] || 0}
          onDecrease={() => handleQuantityChange('free', -1)}
          onIncrease={() => handleQuantityChange('free', 1)}
        />
      ) : priceCategoriesWithIds && priceCategoriesWithIds.length === 1 ? (
        <PriceCard
          title={priceCategoriesWithIds[0].name}
          price={priceCategoriesWithIds[0].price}
          quantity={quantities[priceCategoriesWithIds[0].id] || 0}
          onDecrease={() =>
            handleQuantityChange(priceCategoriesWithIds[0].id, -1)
          }
          onIncrease={() =>
            handleQuantityChange(priceCategoriesWithIds[0].id, 1)
          }
          currencySymbol={currencySymbol}
        />
      ) : (
        priceCategoriesWithIds?.map((category, index) => (
          <PriceCard
            key={index}
            title={category.name}
            price={category.price}
            quantity={quantities[category.id] || 0}
            onDecrease={() => handleQuantityChange(category.id, -1)}
            onIncrease={() => handleQuantityChange(category.id, 1)}
            currencySymbol={currencySymbol}
          />
        ))
      )}
    </div>
  );
};

export default PriceCards;
