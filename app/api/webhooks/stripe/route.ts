import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

import { connectToDatabase } from '@/lib/database';
import Order from '@/lib/database/models/order.model';

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
    const { id, amount_total, metadata, currency } = session;

    if (!metadata?.eventId || !metadata?.buyerId) {
      console.error('Missing metadata in Stripe webhook:', session);
      return NextResponse.json(
        { message: 'Missing metadata' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Find and update existing order instead of creating a new one
    const existingOrder = await Order.findOneAndUpdate(
      { stripeId: id },
      {
        $set: {
          totalAmount: amount_total ? (amount_total / 100).toString() : '0',
          currency: currency?.toLowerCase() || 'usd',
          paymentStatus: 'completed',
        },
      },
      { new: true }
    );

    if (!existingOrder) {
      console.error('Order not found for Stripe session:', id);
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    console.log('Order updated from Stripe webhook:', existingOrder);
    return NextResponse.json(
      { message: 'Order updated', order: existingOrder },
      { status: 200 }
    );
  }

  return NextResponse.json({ message: 'Event received' }, { status: 200 });
}
