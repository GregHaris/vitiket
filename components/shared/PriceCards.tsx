'use client';

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

  const handleQuantityChange = (categoryId: string, amount: number) => {
    const currentQuantity = Number(searchParams.get(categoryId)) || 0;
    const newQuantity = Math.max(0, currentQuantity + amount);

    // Update the URL with the new quantity
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set(categoryId, newQuantity.toString());
    router.replace(`?${newSearchParams.toString()}`, { scroll: false });
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {event.isFree ? (
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm">
          <h3 className="text-xl font-bold mb-4">Free Ticket</h3>
          <div className="flex items-center justify-between">
            <p className="text-lg font-semibold">Free</p>
            <div className="flex items-center gap-2">
              <button
                className="bg-gray-200 px-3 py-1 rounded cursor-pointer"
                onClick={() => handleQuantityChange('free', -1)}
              >
                <Minus className="text-sm text-gray-400 font-bold" />
              </button>
              <span>{Number(searchParams.get('free')) || 0}</span>
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
          <h3 className="text-xl font-bold mb-4">
            {priceCategoriesWithIds[0].name}
          </h3>
          <div className="flex items-center justify-between">
            <p className="text-lg font-semibold">
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
              <span>
                {Number(searchParams.get(priceCategoriesWithIds[0].id)) || 0}
              </span>
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
                  <span>{Number(searchParams.get(category.id)) || 0}</span>
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
