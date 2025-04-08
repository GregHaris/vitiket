"use client";

import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";

import { currencySymbols } from "@/constants";
import { Separator } from "@ui/separator";
import { TicketCardProps } from "@/types";

export default function TicketCard({ order }: TicketCardProps) {
  const event = order.event;
  const currencySymbol =
    currencySymbols[event.currency as keyof typeof currencySymbols] || "₦";

  const verificationUrl = `${process.env.NEXT_PUBLIC_SERVER_URL}/verify-ticket?orderId=${order._id}`;

  return (
    <div className="w-full max-w-[400px] min-w-[300px] bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      <div className="flex-1 flex flex-col space-y-4 p-5">
        <Image
          src={event.imageUrl}
          alt={event.title}
          width={400}
          height={96}
          className="w-full object-cover rounded-t-lg md:rounded-t-none"
        />
        <h3 className="text-lg font-bold text-gray-900">{event.title}</h3>
        <Separator className="bg-gray-300" />
        <div>
          <h4 className="font-bold text-gray-700">Tickets</h4>
          {order.priceCategories && order.priceCategories.length > 0 ? (
            order.priceCategories.map((cat, index) => (
              <p key={index} className="text-sm text-gray-500">
                {cat.quantity} x {cat.name}
                {cat.price !== "0" && (
                  <>
                    {" - "}
                    {currencySymbol}
                    {(Number(cat.price) * cat.quantity).toLocaleString()}
                  </>
                )}
              </p>
            ))
          ) : (
            <p className="text-sm text-gray-600">{order.quantity} x Ticket</p>
          )}
        </div>
        <Separator className="bg-gray-300" />
        <div>
          <h4 className="font-bold text-gray-700">Total</h4>
          <p className="text-lg font-bold text-gray-700">
            {currencySymbol}
            {parseFloat(order.totalAmount.toString()).toLocaleString()}
          </p>
        </div>
      </div>
      <div className="w-full bg-gray-100 flex flex-col items-center justify-center p-4 border-t border-dashed border-gray-300">
        <QRCodeSVG
          value={verificationUrl}
          size={100}
          level="H"
          title={`Ticket for ${event.title}`}
          className="mb-2"
        />
        <p className="text-xs text-gray-500 text-center">Scan to Verify</p>
      </div>
    </div>
  );
}
