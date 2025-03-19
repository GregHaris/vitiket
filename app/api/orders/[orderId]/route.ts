import { NextResponse } from 'next/server';

import { connectToDatabase } from '@/lib/database';
import Event from '@/lib/database/models/event.model';
import Order from '@/lib/database/models/order.model';
import User from '@/lib/database/models/user.model';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const orderId = url.pathname.split('/').pop();

    if (!orderId || !orderId.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
    }

    await connectToDatabase();
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

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

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
