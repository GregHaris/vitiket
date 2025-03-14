'use server';

import { ObjectId } from 'mongodb';
import { redirect } from 'next/navigation';
import Stripe from 'stripe';

import {
  CheckoutOrderParams,
  CreateOrderParams,
  GetOrdersByEventParams,
  GetOrdersByUserParams,
} from '@/types';
import { connectToDatabase } from '../database';
import { handleError } from '../utils';
import Event from '../database/models/event.model';
import Order from '../database/models/order.model';
import User from '../database/models/user.model';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// PAYSTACK CHECKOUT
const checkoutPaystack = async (order: CheckoutOrderParams) => {
  try {
    await connectToDatabase();

    const event = await Event.findById(order.eventId);
    if (!event) throw new Error('Event not found');

    const user = await User.findById(order.buyerId);
    if (!user) throw new Error('User not found');

    const organizer = await User.findById(event.organizer);
    if (!organizer || !organizer.subaccountCode)
      throw new Error('Organizer or subaccount not found');

    const subaccountCode = organizer.subaccountCode;
    const totalAmount = order.isFree
      ? 0
      : Math.round(Number(order.price) * 100);

    const payload = {
      email: user.email || order.buyerEmail,
      amount: totalAmount,
      currency: order.currency.toUpperCase(),
      reference: `txn_${Date.now()}_${order.eventId}`,
      callback_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/dashboard`,
      metadata: {
        eventId: order.eventId,
        buyerId: order.buyerId,
        quantity: order.quantity,
      },
      split: {
        type: 'percentage',
        currency: order.currency.toUpperCase(),
        subaccounts: [{ subaccount: subaccountCode, share: 80 }],
        bearer_type: 'subaccount',
        main_account_share: 20,
      },
    };

    const response = await fetch(
      'https://api.paystack.co/transaction/initialize',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();
    if (!response.ok || !data.status)
      throw new Error(
        data.message || 'Failed to initialize Paystack transaction'
      );

    redirect(data.data.authorization_url);
  } catch (error) {
    console.error('Paystack checkout error:', error);
    throw error;
  }
};

// STRIPE CHECKOUT
const checkoutStripe = async (
  order: CheckoutOrderParams & {
    cardDetails?: { number: string; expiry: string; cvv: string };
  }
) => {
  try {
    await connectToDatabase();

    const event = await Event.findById(order.eventId);
    if (!event) throw new Error('Event not found');

    const user = await User.findById(order.buyerId);
    if (!user) throw new Error('User not found');

    const organizer = await User.findById(event.organizer);
    if (!organizer || !organizer.stripeId)
      throw new Error('Organizer or Stripe account not found');

    const totalAmount = order.isFree
      ? 0
      : Math.round(Number(order.price) * 100);
    const platformFee = Math.round(totalAmount * 0.2);

    if (order.paymentMethod === 'card') {
      // Create PaymentIntent without card details
      const paymentIntent = await stripe.paymentIntents.create({
        amount: totalAmount,
        currency: order.currency.toLowerCase(),
        payment_method_types: ['card'],
        metadata: {
          eventId: order.eventId,
          buyerId: order.buyerId || null,
          quantity: order.quantity,
        },
        application_fee_amount: platformFee,
        transfer_data: { destination: organizer.stripeId },
      });

      // Return client_secret for client-side confirmation
      return { clientSecret: paymentIntent.client_secret };
    } else {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: [
          'card',
          'google_pay',
          'apple_pay',
        ] as Stripe.Checkout.SessionCreateParams.PaymentMethodType[],
        line_items: [
          {
            price_data: {
              currency: order.currency.toLowerCase(),
              product_data: { name: `Event Ticket (${event.title})` },
              unit_amount: totalAmount,
            },
            quantity: order.quantity,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/dashboard?success=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/events/${order.eventId}?canceled=true`,
        customer_email: user.email,
        metadata: {
          eventId: order.eventId,
          buyerId: order.buyerId,
          quantity: order.quantity.toString(),
        },
        payment_intent_data: {
          application_fee_amount: platformFee,
          transfer_data: { destination: organizer.stripeId },
        },
      } as Stripe.Checkout.SessionCreateParams);
      redirect(session.url!);
    }
  } catch (error) {
    console.error('Stripe checkout error:', error);
    throw error;
  }
};

// CHECKOUT
export const checkoutOrder = async (
  order: CheckoutOrderParams & {
    cardDetails?: { number: string; expiry: string; cvv: string };
  }
) => {
  await connectToDatabase();
  const event = await Event.findById(order.eventId).populate('organizer');
  if (!event) throw new Error('Event not found');

  const isNigerianEvent =
    order.currency.toUpperCase() === 'NGN' &&
    event.location.toLowerCase().includes('nigeria');

  if (isNigerianEvent) {
    await checkoutPaystack(order);
  } else {
    const result = await checkoutStripe(order);
    return result; 
  }
};

// CREATE ORDER
export const createOrder = async (order: CreateOrderParams) => {
  try {
    await connectToDatabase();

    const user = await User.findById(order.buyerId);
    if (!user) throw new Error('User not found');

    const newOrder = await Order.create({
      ...order,
      event: order.eventId,
      buyer: order.buyerId,
      buyerEmail: order.buyerEmail,
      paymentMethod: order.paymentMethod,
      quantity: order.quantity,
      stripeId: order.stripeId || undefined,
    });

    return JSON.parse(JSON.stringify(newOrder));
  } catch (error) {
    handleError(error);
    throw error;
  }
};

export const hasUserPurchasedEvent = async (
  userId: string,
  eventId: string
) => {
  try {
    await connectToDatabase();

    const order = await Order.findOne({ buyer: userId, event: eventId });

    return !!order;
  } catch (error) {
    handleError(error);
  }
};

// GET ORDERS BY EVENT
export async function getOrdersByEvent({
  searchString,
  eventId,
}: GetOrdersByEventParams) {
  try {
    await connectToDatabase();

    if (!eventId) throw new Error('Event ID is required');
    const eventObjectId = new ObjectId(eventId);

    const orders = await Order.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'buyer',
          foreignField: '_id',
          as: 'buyer',
        },
      },
      {
        $unwind: '$buyer',
      },
      {
        $lookup: {
          from: 'events',
          localField: 'event',
          foreignField: '_id',
          as: 'event',
        },
      },
      {
        $unwind: '$event',
      },
      {
        $project: {
          _id: 1,
          totalAmount: 1,
          createdAt: 1,
          eventTitle: '$event.title',
          eventId: '$event._id',
          buyer: {
            $concat: ['$buyer.firstName', ' ', '$buyer.lastName'],
          },
          buyerEmail: '$buyer.email',
        },
      },
      {
        $match: {
          $and: [
            { eventId: eventObjectId },
            { buyer: { $regex: RegExp(searchString, 'i') } },
          ],
        },
      },
    ]);

    return JSON.parse(JSON.stringify(orders));
  } catch (error) {
    handleError(error);
  }
}

// GET ORDERS BY USER
export async function getOrdersByUser({
  userId,
  limit = 3,
  page,
}: GetOrdersByUserParams) {
  try {
    await connectToDatabase();

    const skipAmount = (Number(page) - 1) * limit;
    const conditions = { buyer: userId };

    const orders = await Order.distinct('event._id')
      .find(conditions)
      .sort({ createdAt: 'desc' })
      .skip(skipAmount)
      .limit(limit)
      .populate({
        path: 'event',
        model: Event,
        populate: {
          path: 'organizer',
          model: User,
          select: '_id firstName lastName',
        },
      });

    const ordersCount = await Order.distinct('event._id').countDocuments(
      conditions
    );

    return {
      data: JSON.parse(JSON.stringify(orders)),
      totalPages: Math.ceil(ordersCount / limit),
    };
  } catch (error) {
    handleError(error);
  }
}
