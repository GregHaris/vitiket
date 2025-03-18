import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

import { connectToDatabase } from '@/lib/database';
import User from '@/lib/database/models/user.model';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { userId, eventId, businessName } = await req.json();

    await connectToDatabase();
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    let stripeId = user.stripeId;
    if (!stripeId) {
      const account = await stripe.accounts.create({
        type: 'express',
        email: user.email,
        business_type: businessName ? 'company' : 'individual', 
        company: businessName ? { name: businessName } : undefined,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });
      stripeId = account.id;
    }

    // Update user with stripeId and businessName
    await User.findByIdAndUpdate(userId, {
      stripeId,
      ...(businessName && { businessName }),
    });

    const accountLink = await stripe.accountLinks.create({
      account: stripeId,
      refresh_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/organizer/setup?userId=${userId}&refresh=true`,
      return_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/events/${eventId}`,
      type: 'account_onboarding',
    });

    return NextResponse.json({ url: accountLink.url }, { status: 200 });
  } catch (error) {
    console.error('Stripe onboarding error:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
