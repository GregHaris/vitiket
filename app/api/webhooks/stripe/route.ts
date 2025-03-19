import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

import { connectToDatabase } from '@/lib/database';
import { sendTicketEmail } from '@/utils/email';
import Order from '@/lib/database/models/order.model';
import Event from '@/lib/database/models/event.model';

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

    const eventData = await Event.findById(metadata.eventId);
    if (!eventData) {
      console.error('Event not found for session:', id);
      return NextResponse.json({ message: 'Event not found' }, { status: 404 });
    }

    let existingOrder = await Order.findOne({ stripeId: id });
    if (!existingOrder) {
      existingOrder = await Order.create({
        event: metadata.eventId,
        buyer: metadata.buyerId === 'guest' ? null : metadata.buyerId,
        buyerEmail: session.customer_email,
        totalAmount: amount_total ? (amount_total / 100).toString() : '0',
        currency: currency?.toLowerCase() || 'usd',
        paymentMethod: 'stripe', 
        quantity: Number(metadata.quantity),
        priceCategories: metadata.priceCategories
          ? JSON.parse(metadata.priceCategories)
          : undefined,
        stripeId: id,
        paymentStatus: 'completed',
      });

      await sendTicketEmail({
        email: session.customer_email!,
        eventTitle: eventData.title,
        eventSubtitle: eventData.subtitle || '',
        eventImage: eventData.imageUrl || '',
        orderId: existingOrder._id.toString(),
        totalAmount: existingOrder.totalAmount,
        currency: currency?.toLowerCase() || 'usd',
        quantity: Number(metadata.quantity),
      });
    } else {
      existingOrder = await Order.findOneAndUpdate(
        { stripeId: id },
        { paymentStatus: 'completed' },
        { new: true }
      );
    }

    console.log('Order processed from Stripe webhook:', existingOrder);
    return NextResponse.json(
      { message: 'Order processed', order: existingOrder },
      { status: 200 }
    );
  }

  return NextResponse.json({ message: 'Event received' }, { status: 200 });
}
