import { NextResponse } from 'next/server';

import { connectToDatabase } from '@/lib/database';
import Order from '@/lib/database/models/order.model';

export async function GET({ params }: { params: { orderId: string } }) {
  try {
    await connectToDatabase();
    const order = await Order.findById(params.orderId)
      .populate({
        path: 'event',
        select: '_id title subtitle imageUrl currency startDate location',
      })
      .populate({
        path: 'buyer',
        select: '_id firstName lastName email',
      });

    if (!order)
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    return NextResponse.json(JSON.parse(JSON.stringify(order)), {
      status: 200,
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
