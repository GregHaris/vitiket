import { redirect } from 'next/navigation';
import Link from 'next/link';

import { CheckoutSuccessPageProps } from '@/types';
import { connectToDatabase } from '@/lib/database';
import { IOrder } from '@/lib/database/models/order.model';
import Event from '@/lib/database/models/event.model';
import Order from '@/lib/database/models/order.model';
import TicketCard from '@/components/shared/TicketCard';
import User from '@/lib/database/models/user.model';


async function getOrderById(orderId: string): Promise<IOrder | null> {
  try {
    await connectToDatabase();

    if (!orderId.match(/^[0-9a-fA-F]{24}$/)) {
      return null; 
    }

    const order = await Order.findById(orderId)
      .populate({
        path: 'event',
        model: Event,
        select: '_id title subtitle imageUrl currency startDate location',
      })
      .populate({
        path: 'buyer',
        model: User,
        select: '_id firstName lastName email',
        options: { strictPopulate: false },
      });

    return order ? JSON.parse(JSON.stringify(order)) : null;
  } catch (error) {
    console.error('Error fetching order:', error);
    return null;
  }
}

export default async function CheckoutSuccessPage({
  params,
}: CheckoutSuccessPageProps) {
  const resolvedParams = await params;
  const orderId = resolvedParams.id;

  if (!orderId) {
    redirect('/');
  }

  const order = await getOrderById(orderId);

  if (!order) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <p className="text-white text-lg">Order not found.</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-200 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-[450px] w-full shadow-lg">
        <h2 className="text-2xl font-bold text-green-600 mb-4">
          Purchase Successful!
        </h2>
        <p className="text-gray-600 mb-6">
          Your ticket has been sent to your email. Here’s your order summary:
        </p>
        <TicketCard order={order} />
        <div className="mt-6 flex gap-4">
          <Link
            href="/"
            className="flex-1 bg-primary-500 text-white py-2 rounded-lg hover:bg-primary-600 transition text-center"
          >
            Continue Browsing
          </Link>
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
