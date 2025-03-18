'use server';

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

import { connectToDatabase } from '@/lib/database';
import { createOrder } from '@/lib/actions/order.actions';

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
  console.log('Webhook event received:', event);

  if (event === 'charge.success') {
    const data = eventData.data;
    const metadata = data.metadata;

    if (!metadata?.eventId || !metadata?.buyerId) {
      console.error('Missing metadata in Paystack webhook:', data);
      return NextResponse.json(
        { message: 'Missing metadata' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const order = {
      eventId: String(metadata.eventId),
      buyerId: String(metadata.buyerId),
      totalAmount: (data.amount / 100).toString(),
      currency: data.currency?.toUpperCase() || 'NGN',
      buyerEmail: data.customer?.email || '',
      quantity: parseInt(metadata.quantity || '1', 10),
      priceCategory: metadata.priceCategories
        ? {
            name: String(metadata.priceCategories.name),
            price: String(metadata.priceCategories.price),
          }
        : undefined,
      paymentMethod: 'paystack' as const,
      createdAt: new Date(),
    };

    try {
      console.log('Creating order:', order);
      const newOrder = await createOrder(order);
      console.log('Order created from Paystack webhook:', newOrder);
      return NextResponse.json(
        { message: 'Order created', order: newOrder },
        { status: 200 }
      );
    } catch (error) {
      console.error('Failed to create order:', error);
      return NextResponse.json(
        { message: 'Order creation failed', error: (error as Error).message },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ message: 'Event received' }, { status: 200 });
}
