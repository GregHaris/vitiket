'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import PriceCard from './PriceCardUI';
import { PriceCardsProps } from '@/types';

const PriceCards = ({ event, currencySymbol }: PriceCardsProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Generate IDs for price categories
  const priceCategoriesWithIds = event.priceCategories?.map(
    (category, index) => ({
      ...category,
      id: `category-${index}`,
    })
  );

  // Initialize state for quantities
  const [quantities, setQuantities] = useState<{ [key: string]: number }>(
    () => {
      const initialQuantities: { [key: string]: number } = {};
      if (event.isFree) {
        initialQuantities['free'] = Number(searchParams.get('free')) || 0;
      } else {
        priceCategoriesWithIds?.forEach((category) => {
          initialQuantities[category.id] =
            Number(searchParams.get(category.id)) || 0;
        });
      }
      return initialQuantities;
    }
  );

  const handleQuantityChange = (categoryId: string, amount: number) => {
    setQuantities((prev) => {
      const newQuantity = Math.max(0, (prev[categoryId] || 0) + amount);
      return { ...prev, [categoryId]: newQuantity };
    });

    const newSearchParams = new URLSearchParams(searchParams.toString());
    const newQuantity = Math.max(0, (quantities[categoryId] || 0) + amount);
    newSearchParams.set(categoryId, newQuantity.toString());
    router.replace(`?${newSearchParams.toString()}`, { scroll: false });
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
