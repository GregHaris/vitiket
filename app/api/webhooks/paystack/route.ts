'use server';

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

import { sendTicketEmail } from '@/utils/email';
import { connectToDatabase } from '@/lib/database';
import Order from '@/lib/database/models/order.model';
import Event from '@/lib/database/models/event.model';

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
    const { reference, amount, metadata } = data;

    if (!metadata?.eventId || !metadata?.buyerId) {
      console.error('Missing metadata in Paystack webhook:', data);
      return NextResponse.json(
        { message: 'Missing metadata' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const eventDataDb = await Event.findById(metadata.eventId);
    if (!eventDataDb) {
      console.error('Event not found for reference:', reference);
      return NextResponse.json({ message: 'Event not found' }, { status: 404 });
    }

    let existingOrder = await Order.findOne({ reference });
    if (!existingOrder) {
      existingOrder = await Order.create({
        event: metadata.eventId,
        buyer: metadata.buyerId === 'guest' ? null : metadata.buyerId,
        buyerEmail: data.customer.email,
        totalAmount: (amount / 100).toString(),
        currency: 'NGN',
        paymentMethod: 'paystack',
        quantity: Number(metadata.quantity),
        priceCategories: metadata.priceCategories
          ? JSON.parse(metadata.priceCategories)
          : undefined,
        reference,
        paymentStatus: 'completed',
        firstName: metadata.firstName,
        lastName: metadata.lastName,
      });

      await sendTicketEmail({
        email: data.customer.email,
        eventTitle: eventDataDb.title,
        eventSubtitle: eventDataDb.subtitle || '',
        eventImage: eventDataDb.imageUrl || '',
        orderId: existingOrder._id.toString(),
        totalAmount: existingOrder.totalAmount,
        currency: 'NGN',
        quantity: Number(metadata.quantity),
        firstName: existingOrder.firstName,
        priceCategories: existingOrder.priceCategories,
      });
    } else {
      existingOrder = await Order.findOneAndUpdate(
        { reference },
        { paymentStatus: 'completed' },
        { new: true }
      );
    }

    console.log('Order processed from Paystack webhook:', existingOrder);
    return NextResponse.json(
      { message: 'Order processed', order: existingOrder },
      { status: 200 }
    );
  }

  return NextResponse.json({ message: 'Event received' }, { status: 200 });
}
