'use client';

import { Minus, Plus } from 'lucide-react';
import { PriceCardUIProps } from '@/types';

const PriceCard = ({
  title,
  price,
  quantity,
  onDecrease,
  onIncrease,
  currencySymbol = '',
}: PriceCardUIProps) => {
  
  const formattedPrice =
    typeof price === 'string' && price.toLowerCase() === 'free'
      ? 'Free'
      : Number(price).toLocaleString('en-NG', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        });

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm">
      <h3 className="text-xl font-bold mb-4 text-gray-500">{title}</h3>
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 font-semibold">
          {currencySymbol}
          {formattedPrice}
        </p>
        <div className="flex items-center gap-2">
          <button
            className="bg-gray-200 px-3 py-1 rounded cursor-pointer"
            onClick={onDecrease}
          >
            <Minus className="text-sm text-gray-400 font-bold" />
          </button>
          <span>{quantity}</span>
          <button
            className="bg-primary px-3 py-1 rounded cursor-pointer"
            onClick={onIncrease}
          >
            <Plus className="text-sm text-white font-bold" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PriceCard;
