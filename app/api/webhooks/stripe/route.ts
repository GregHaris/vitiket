import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

import { connectToDatabase } from '@/lib/database';
import { createOrder } from '@/lib/actions/order.actions';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature') as string;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { message: 'Webhook error', error: (err as Error).message },
      { status: 400 }
    );
  }

  const eventType = event.type;

  if (eventType === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const { id, amount_total, metadata, currency, customer_email } = session;

    if (!metadata?.eventId || !metadata?.buyerId) {
      console.error('Missing metadata in Stripe webhook:', session);
      return NextResponse.json(
        { message: 'Missing metadata' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const order = {
      stripeId: id,
      eventId: metadata.eventId,
      buyerId: metadata.buyerId,
      totalAmount: amount_total ? (amount_total / 100).toString() : '0',
      currency: currency?.toLowerCase() || 'usd',
      quantity: parseInt(metadata.quantity || '1', 10),
      buyerEmail: metadata?.email || customer_email || '',
      createdAt: new Date(),
      paymentMethod: 'card' as const, 
    };

    try {
      const newOrder = await createOrder(order);
      console.log('Order created from Stripe webhook:', newOrder);
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
