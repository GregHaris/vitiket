import { NextRequest, NextResponse } from 'next/server';

import { connectToDatabase } from '@/lib/database';
import Order from '@/lib/database/models/order.model';
import Event from '@/lib/database/models/event.model';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const order = await Order.findById(orderId).populate({
      path: 'event',
      model: Event,
      select: 'title subtitle startDate location organizer',
      populate: {
        path: 'organizer',
        model: 'User',
        select: 'firstName lastName',
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Invalid or expired ticket' },
        { status: 404 }
      );
    }

    // Construct response data
    const response = {
      valid: true,
      orderId: order._id.toString(),
      event: {
        title: order.event.title,
        subtitle: order.event.subtitle,
        startDate: order.event.startDate,
        location: order.event.location,
        organizer: `${order.event.organizer.firstName} ${order.event.organizer.lastName}`,
      },
      buyerId: order.buyer.toString(),
      quantity: order.quantity,
      totalAmount: order.totalAmount,
      paymentMethod: order.paymentMethod,
      createdAt: order.createdAt,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Ticket verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
