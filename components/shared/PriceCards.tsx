'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Minus, Plus } from 'lucide-react';
import { PriceCardsProps, PriceCategory } from '@/types';

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
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm">
          <h3 className="text-xl font-bold mb-4 text-gray-500">Free Ticket</h3>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 font-semibold">Free</p>
            <div className="flex items-center gap-2">
              <button
                className="bg-gray-200 px-3 py-1 rounded cursor-pointer"
                onClick={() => handleQuantityChange('free', -1)}
              >
                <Minus className="text-sm text-gray-400 font-bold" />
              </button>
              <span>{quantities['free'] || 0}</span>
              <button
                className="bg-primary px-3 py-1 rounded cursor-pointer"
                onClick={() => handleQuantityChange('free', 1)}
              >
                <Plus className="text-sm text-white font-bold" />
              </button>
            </div>
          </div>
        </div>
      ) : priceCategoriesWithIds && priceCategoriesWithIds.length === 1 ? (
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm">
          <h3 className="text-xl font-bold mb-4 text-gray-500">
            {priceCategoriesWithIds[0].name}
          </h3>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 font-semibold">
              {currencySymbol}
              {priceCategoriesWithIds[0].price}
            </p>
            <div className="flex items-center gap-2">
              <button
                className="bg-gray-200 px-3 py-1 rounded cursor-pointer"
                onClick={() =>
                  handleQuantityChange(priceCategoriesWithIds[0].id, -1)
                }
              >
                <Minus className="text-sm text-gray-400 font-bold" />
              </button>
              <span>{quantities[priceCategoriesWithIds[0].id] || 0}</span>
              <button
                className="bg-primary px-3 py-1 rounded cursor-pointer"
                onClick={() =>
                  handleQuantityChange(priceCategoriesWithIds[0].id, 1)
                }
              >
                <Plus className="text-sm text-white font-bold" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        priceCategoriesWithIds?.map(
          (category: PriceCategory & { id: string }, index: number) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm"
            >
              <h3 className="text-xl font-bold mb-4 text-gray-500">
                {category.name}
              </h3>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500 font-semibold">
                  {currencySymbol}
                  {category.price}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    className="bg-gray-200 px-3 py-1 rounded cursor-pointer"
                    onClick={() => handleQuantityChange(category.id, -1)}
                  >
                    <Minus className="text-sm text-gray-400 font-bold" />
                  </button>
                  <span>{quantities[category.id] || 0}</span>
                  <button
                    className="bg-primary px-3 py-1 rounded cursor-pointer"
                    onClick={() => handleQuantityChange(category.id, 1)}
                  >
                    <Plus className="text-sm text-white font-bold" />
                  </button>
                </div>
              </div>
            </div>
          )
        )
      )}
    </div>
  );
};

export default PriceCards;
