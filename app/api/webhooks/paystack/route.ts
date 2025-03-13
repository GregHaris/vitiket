'use server';

import { NextRequest, NextResponse } from 'next/server';

import { createOrder } from '@/lib/actions/order.actions';
import { connectToDatabase } from '@/lib/database';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const signature = req.headers.get('x-paystack-signature');

    // Verify webhook signature
    const secret = process.env.PAYSTACK_SECRET_KEY!;
    const hash = crypto
      .createHmac('sha512', secret)
      .update(JSON.stringify(body))
      .digest('hex');
    if (hash !== signature) {
      return NextResponse.json(
        { message: 'Invalid signature' },
        { status: 401 }
      );
    }

    const event = body.event;
    if (event === 'charge.success') {
      const data = body.data;
      const metadata = data.metadata;

      const order = {
        eventId: String(metadata.eventId),
        buyerId: String(metadata.buyerId),
        totalAmount: (data.amount / 100).toString(),
        currency: String(data.currency),
        buyerEmail: String(data.customer.email),
        quantity: Number(metadata.quantity),
        priceCategory: metadata.priceCategories
          ? {
              name: String(metadata.priceCategories.name),
              price: String(metadata.priceCategories.price),
            }
          : undefined,
        paymentMethod: 'paystack' as const,
        createdAt: new Date(),
      };

      await connectToDatabase();
      await createOrder(order);
    }

    return NextResponse.json({ message: 'Webhook received' }, { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ message: 'Webhook failed' }, { status: 500 });
  }
}
