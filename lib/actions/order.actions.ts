'use server';

import { ObjectId } from 'mongodb';
import Stripe from 'stripe';

import {
  CheckoutOrderParams,
  CheckoutOrderResponse,
  CreateOrderParams,
  GetOrdersByEventParams,
  GetOrdersByUserParams,
} from '@/types';
import { connectToDatabase } from '../database';
import { handleError } from '../utils';
import { IOrder } from '@/lib/database/models/order.model';
import { sendTicketEmail } from '@/utils/email';
import Event from '../database/models/event.model';
import Order from '../database/models/order.model';
import User from '../database/models/user.model';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// PAYSTACK CHECKOUT
const checkoutPaystack = async (
  order: CheckoutOrderParams
): Promise<CheckoutOrderResponse> => {
  try {
    await connectToDatabase();

    const event = await Event.findById(order.eventId);
    if (!event) throw new Error('Event not found');

    const user = await User.findById(order.buyerId);

    const organizer = await User.findById(event.organizer);
    if (!organizer || !organizer.subaccountCode)
      throw new Error('Organizer or subaccount not found');

    const subaccountCode = organizer.subaccountCode;

    const ticketAmount = order.isFree
      ? 0
      : order.priceCategories!.reduce(
          (sum, cat) =>
            sum + Math.round(Number(cat.price) * 100) * cat.quantity,
          0
        );
    const platformFee = Math.round(ticketAmount * 0.05);
    const totalAmount = ticketAmount + platformFee;

    const newOrder: IOrder = await Order.create({
      event: order.eventId,
      buyer: order.buyerId,
      buyerEmail: order.buyerEmail,
      totalAmount: (totalAmount / 100).toString(),
      currency: order.currency,
      paymentMethod: 'paystack',
      quantity: order.quantity,
      ...(order.isFree ? {} : { priceCategories: order.priceCategories }), // Optional for free events
    });

    const reference = `txn_${Date.now()}_${order.eventId}`;
    const payload = {
      email: user?.email || order.buyerEmail,
      amount: totalAmount,
      currency: order.currency.toUpperCase(),
      reference,
      callback_url: `${
        process.env.NEXT_PUBLIC_SERVER_URL
      }/checkout-success?orderId=${newOrder._id.toString()}`,
      metadata: {
        eventId: order.eventId,
        buyerId: order.buyerId,
        quantity: order.quantity,
        platformFee: platformFee / 100,
        ...(order.priceCategories && {
          priceCategories: JSON.stringify(order.priceCategories),
        }),
      },
      split: {
        type: 'percentage',
        currency: order.currency.toUpperCase(),
        subaccounts: [{ subaccount: subaccountCode, share: 100 }],
        bearer_type: 'account',
        main_account_share: 0,
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

    // Send email with ticket
    await sendTicketEmail({
      email: order.buyerEmail,
      eventTitle: event.title,
      eventSubtitle: event.subtitle,
      eventImage: event.imageUrl,
      orderId: newOrder._id.toString(),
      totalAmount: newOrder.totalAmount,
      currency: order.currency,
      quantity: order.quantity,
    });

    return {
      url: data.data.authorization_url,
      orderId: newOrder._id.toString(),
    };
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
): Promise<CheckoutOrderResponse> => {
  try {
    await connectToDatabase();

    const event = await Event.findById(order.eventId);
    if (!event) throw new Error('Event not found');

    const user = await User.findById(order.buyerId);

    const organizer = await User.findById(event.organizer);
    if (!organizer || !organizer.stripeId)
      throw new Error('Organizer or Stripe account not found');

    const ticketAmount = order.isFree
      ? 0
      : order.priceCategories!.reduce(
          (sum, cat) =>
            sum + Math.round(Number(cat.price) * 100) * cat.quantity,
          0
        );
    const platformFee = Math.round(ticketAmount * 0.05);
    const totalAmount = ticketAmount + platformFee;

    const newOrder: IOrder = await Order.create({
      event: order.eventId,
      buyer: order.buyerId,
      buyerEmail: user?.email || order.buyerEmail,
      totalAmount: (totalAmount / 100).toString(),
      currency: order.currency,
      paymentMethod: order.paymentMethod || 'stripe',
      quantity: order.quantity,
      ...(order.isFree ? {} : { priceCategories: order.priceCategories }),
    });

    if (order.paymentMethod === 'card') {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: totalAmount,
        currency: order.currency.toLowerCase(),
        payment_method_types: ['card'],
        metadata: {
          eventId: order.eventId,
          buyerId: order.buyerId || null,
          quantity: order.quantity,
          platformFee: platformFee / 100,
          ...(order.priceCategories && {
            priceCategories: JSON.stringify(order.priceCategories),
          }),
        },
        application_fee_amount: 0,
        transfer_data: { destination: organizer.stripeId },
      });

      // Update order with paymentIntent ID
      newOrder.stripeId = paymentIntent.id;
      await newOrder.save();

      // Send email with ticket
      await sendTicketEmail({
        email: order.buyerEmail,
        eventTitle: event.title,
        eventSubtitle: event.subtitle,
        eventImage: event.imageUrl,
        orderId: newOrder._id.toString(),
        totalAmount: newOrder.totalAmount,
        currency: order.currency,
        quantity: order.quantity,
      });

      return {
        clientSecret: paymentIntent.client_secret!,
        orderId: newOrder._id.toString(),
      };
    } else {
      const session: Stripe.Checkout.Session =
        await stripe.checkout.sessions.create({
          payment_method_types: ['card', 'google_pay', 'apple_pay'],
          line_items: order.isFree
            ? [
                {
                  price_data: {
                    currency: order.currency.toLowerCase(),
                    product_data: { name: `${event.title} - Free Ticket` },
                    unit_amount: 0,
                  },
                  quantity: order.quantity,
                },
              ]
            : order
                .priceCategories!.map((cat) => ({
                  price_data: {
                    currency: order.currency.toLowerCase(),
                    product_data: { name: `${event.title} - ${cat.name}` },
                    unit_amount: Math.round(Number(cat.price) * 100),
                  },
                  quantity: cat.quantity,
                }))
                .concat({
                  price_data: {
                    currency: order.currency.toLowerCase(),
                    product_data: { name: 'Platform Fee (5%)' },
                    unit_amount: platformFee,
                  },
                  quantity: 1,
                }),
          mode: 'payment',
          success_url: `${
            process.env.NEXT_PUBLIC_SERVER_URL
          }/checkout-success?orderId=${newOrder._id.toString()}`,
          cancel_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/events/${order.eventId}?canceled=true`,
          customer_email: user?.email || order.buyerEmail,
          metadata: {
            eventId: order.eventId,
            buyerId: order.buyerId,
            quantity: order.quantity.toString(),
            platformFee: platformFee / 100,
            ...(order.priceCategories && {
              priceCategories: JSON.stringify(order.priceCategories),
            }),
          },
          payment_intent_data: {
            application_fee_amount: 0,
            transfer_data: { destination: organizer.stripeId },
          },
        } as Stripe.Checkout.SessionCreateParams);

      // Update order with session ID
      newOrder.stripeId = session.id;
      await newOrder.save();

      // Send email with ticket
      await sendTicketEmail({
        email: order.buyerEmail,
        eventTitle: event.title,
        eventSubtitle: event.subtitle,
        eventImage: event.imageUrl,
        orderId: newOrder._id.toString(),
        totalAmount: newOrder.totalAmount,
        currency: order.currency,
        quantity: order.quantity,
      });

      return { url: session.url!, orderId: newOrder._id.toString() };
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
    return await checkoutPaystack(order);
  } else {
    return await checkoutStripe(order);
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
        select:
          '_id title subtitle imageUrl currency startDate location organizer',
        populate: {
          path: 'organizer',
          model: User,
          select: '_id firstName lastName',
        },
      })
      .populate({
        path: 'buyer',
        model: User,
        select: '_id firstName lastName email',
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
