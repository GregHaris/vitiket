'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

import { IOrder } from '@/lib/database/models/order.model';
import TicketCard from '@/components/shared/TicketCard';

export default function CheckoutSuccess() {
  const searchParams = useSearchParams();
  const orderId =
    searchParams.get('orderId') ||
    searchParams.get('reference') ||
    searchParams.get('session_id');
  const [order, setOrder] = useState<IOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;
      try {
        const response = await fetch(`/api/orders/${orderId}`);
        const data = await response.json();
        if (response.ok) setOrder(data);
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <p className="text-white text-lg">Loading your ticket...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <p className="text-white text-lg">Order not found.</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-[450px] w-full shadow-lg">
        <h2 className="text-2xl font-bold text-green-600 mb-4">
          Purchase Successful!
        </h2>
        <p className="text-gray-600 mb-6">
          Your ticket has been sent to your email. Here’s your order summary:
        </p>
        <TicketCard order={order} />
        <div className="mt-6 flex gap-4">
          <button
            onClick={() => (window.location.href = '/')}
            className="flex-1 bg-primary-500 text-white py-2 rounded-lg hover:bg-primary-600 transition"
          >
            Continue Browsing
          </button>
          <Link
            href={`/events/${order.event._id}`}
            className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition text-center"
          >
            Back to Event
          </Link>
        </div>
      </div>
    </div>
  );
}
