'use client';

import Image from 'next/image';

import { CheckoutDetailsProps } from '@/types';
import { Separator } from '@ui/separator';

export default function OrderSummary({
  event,
  currencySymbol,
  totalPrice,
  selectedTickets,
}: {
  event: CheckoutDetailsProps['event'];
  currencySymbol: string;
  totalPrice: number;
  selectedTickets?: { name: string; price: string; quantity: number }[];
}) {
  const ticketPrice = totalPrice / 1.05;
  const platformFee = totalPrice - ticketPrice;

  return (
    <div className="w-full md:w-1/2 bg-gray-200">
      <Image
        src={event.imageUrl}
        alt={event.title}
        width={500}
        height={500}
        className="w-full h-48 object-cover"
      />
      <div className="space-y-6 p-5">
        <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
        <h3 className="text-lg font-bold">{event.title}</h3>
        <p className="text-sm text-gray-600">{event.subtitle}</p>
        <Separator className="bg-gray-300" />
        <div>
          <h4 className="font-bold">Tickets</h4>
          {selectedTickets && selectedTickets.length > 0 ? (
            selectedTickets.map((cat, index) => (
              <p key={index} className="text-sm text-gray-600">
                {cat.quantity} x {cat.name} - {currencySymbol}
                {(Number(cat.price) * cat.quantity).toLocaleString()}
              </p>
            ))
          ) : (
            <p className="text-sm text-gray-600">{event.quantity} x Ticket</p>
          )}
        </div>
        <Separator className="bg-gray-300" />
        <div>
          <h4 className="font-bold">Subtotal</h4>
          <p className="text-sm text-gray-600">
            {currencySymbol}
            {parseFloat(ticketPrice.toString()).toLocaleString()}
          </p>
          <h4 className="font-bold mt-2">Platform Fee (5%)</h4>
          <p className="text-sm text-gray-600">
            {currencySymbol}
            {parseFloat(platformFee.toString()).toLocaleString()}
          </p>
        </div>
        <Separator className="bg-gray-300" />
        <div>
          <h4 className="font-bold">Total</h4>
          <p className="text-lg font-bold">
            {currencySymbol}
            {parseFloat(totalPrice.toString()).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
