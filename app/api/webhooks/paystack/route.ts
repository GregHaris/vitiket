'use server';

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

import { connectToDatabase } from '@/lib/database';
import Order from '@/lib/database/models/order.model';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('x-paystack-signature') as string;
  const secret = process.env.PAYSTACK_SECRET_KEY!;

  let eventData;
  try {
    const hash = crypto.createHmac('sha512', secret).update(body).digest('hex');
    if (hash !== signature) {
      console.error('Paystack webhook signature verification failed:', {
        signature,
        hash,
      });
      return NextResponse.json(
        { message: 'Invalid signature' },
        { status: 401 }
      );
    }

    eventData = JSON.parse(body);
  } catch (err) {
    console.error('Webhook signature verification or parsing failed:', err);
    return NextResponse.json(
      { message: 'Webhook error', error: (err as Error).message },
      { status: 400 }
    );
  }

  const event = eventData.event;

  if (event === 'charge.success') {
    const data = eventData.data;
    const { reference, amount, currency } = data;

    await connectToDatabase();

    const existingOrder = await Order.findOneAndUpdate(
      { reference },
      {
        $set: {
          totalAmount: (amount / 100).toString(),
          currency: currency?.toUpperCase() || 'NGN',
          paymentStatus: 'completed',
        },
      },
      { new: true }
    );

    if (!existingOrder) {
      console.error('Order not found for Paystack reference:', reference);
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    console.log('Order updated from Paystack webhook:', existingOrder);
    return NextResponse.json(
      { message: 'Order updated', order: existingOrder },
      { status: 200 }
    );
  }

  return NextResponse.json({ message: 'Event received' }, { status: 200 });
}
