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

    const user =
      order.buyerId === 'guest' ? null : await User.findById(order.buyerId);

    const organizer = await User.findById(event.organizer);
    if (!organizer || !organizer.subaccountCode)
      throw new Error('Organizer or subaccount not found');

    const subaccountCode = organizer.subaccountCode;

    // Calculate ticket amount with validation
    const ticketAmount = order.isFree
      ? 0
      : order.priceCategories!.reduce((sum, cat) => {
          const price = Number(cat.price);
          const quantity = cat.quantity;
          if (isNaN(price) || price < 0 || quantity < 0) {
            throw new Error(
              `Invalid price or quantity in priceCategories: price=${cat.price}, quantity=${cat.quantity}`
            );
          }
          return sum + Math.round(price * 100) * quantity;
        }, 0);

    const platformFeePercentage = 0.05; // 5%
    const platformFee = Math.round(ticketAmount * platformFeePercentage);
    let totalAmount = ticketAmount + platformFee;

    console.log('Paystack checkout initial:', {
      ticketAmount,
      platformFee,
      totalAmount,
    });

    // Handle free events
    if (order.isFree) {
      if (totalAmount !== 0) {
        throw new Error('Free event should have a total amount of 0');
      }
      const reference = `txn_${Date.now()}_${order.eventId}`;
      const newOrder = await Order.create({
        event: order.eventId,
        buyer: order.buyerId === 'guest' ? null : order.buyerId,
        buyerEmail: user?.email || order.buyerEmail,
        totalAmount: '0',
        currency: order.currency.toUpperCase(),
        paymentMethod: 'none',
        quantity: order.quantity,
        priceCategories: order.priceCategories,
        reference,
        paymentStatus: 'completed',
        firstName: order.firstName || user?.firstName,
        lastName: order.lastName || user?.lastName,
      });

      await sendTicketEmail({
        email: user?.email || order.buyerEmail,
        eventTitle: event.title,
        eventSubtitle: event.subtitle || '',
        eventImage: event.imageUrl || '',
        orderId: newOrder._id.toString(),
        totalAmount: '0',
        currency: order.currency.toUpperCase(),
        quantity: order.quantity,
        firstName: newOrder.firstName,
      });

      return {
        orderId: reference,
        url: `${process.env.NEXT_PUBLIC_SERVER_URL}/events/${order.eventId}?success=${reference}`,
      };
    }

    // Paystack fee constants (in kobo)
    const paystackMinimumAmount = 100;
    const paystackFeePercentage = 0.015;
    const paystackFlatFee = 100;
    const paystackFeeCap = 2000;

    let paystackFee =
      Math.round(totalAmount * paystackFeePercentage) + paystackFlatFee;
    if (totalAmount >= 250000) paystackFee = paystackFeeCap;
    const minimumRequiredAmount = ticketAmount + platformFee + paystackFee;
    totalAmount = Math.max(totalAmount, minimumRequiredAmount);

    paystackFee =
      Math.round(totalAmount * paystackFeePercentage) + paystackFlatFee;
    if (totalAmount >= 250000) paystackFee = paystackFeeCap;

    if (totalAmount < paystackMinimumAmount + paystackFee) {
      throw new Error(
        `Total amount (${totalAmount / 100} ${
          order.currency
        }) is below the minimum required (${
          (paystackMinimumAmount + paystackFee) / 100
        } ${order.currency}) to cover Paystack fees.`
      );
    }

    const mainAccountMinimumShare =
      Math.ceil((paystackFee / totalAmount) * 100) || 1;
    const subaccountShare = 100 - mainAccountMinimumShare;

    const reference = `txn_${Date.now()}_${order.eventId}`;

    const payload = {
      email: user?.email || order.buyerEmail,
      amount: totalAmount,
      currency: order.currency.toUpperCase(),
      reference,
      callback_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/events/${order.eventId}?success=${reference}`,
      metadata: {
        eventId: order.eventId,
        buyerId: order.buyerId,
        quantity: order.quantity,
        platformFee: platformFee / 100,
        firstName: order.firstName || user?.firstName,
        lastName: order.lastName || user?.lastName,
        ...(order.priceCategories && {
          priceCategories: JSON.stringify(order.priceCategories),
        }),
      },
      split: {
        type: 'percentage',
        currency: order.currency.toUpperCase(),
        subaccounts: [{ subaccount: subaccountCode, share: subaccountShare }],
        bearer_type: 'account',
        main_account_share: mainAccountMinimumShare,
      },
    };

    console.log('Paystack payload:', payload);

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
    if (!response.ok || !data.status) {
      throw new Error(
        data.message || 'Failed to initialize Paystack transaction'
      );
    }

    return {
      url: data.data.authorization_url,
      orderId: reference,
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

    const user =
      order.buyerId === 'guest' ? null : await User.findById(order.buyerId);

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

    if (order.isFree) {
      const stripeId = `free_${Date.now()}_${order.eventId}`;
      const newOrder = await Order.create({
        event: order.eventId,
        buyer: order.buyerId === 'guest' ? null : order.buyerId,
        buyerEmail: user?.email || order.buyerEmail,
        totalAmount: '0',
        currency: order.currency.toLowerCase(),
        paymentMethod: 'none',
        quantity: order.quantity,
        priceCategories: order.priceCategories,
        stripeId,
        paymentStatus: 'completed',
        firstName: order.firstName || user?.firstName,
        lastName: order.lastName || user?.lastName,
      });

      await sendTicketEmail({
        email: user?.email || order.buyerEmail,
        eventTitle: event.title,
        eventSubtitle: event.subtitle || '',
        eventImage: event.imageUrl || '',
        orderId: newOrder._id.toString(),
        totalAmount: '0',
        currency: order.currency.toLowerCase(),
        quantity: order.quantity,
        firstName: newOrder.firstName,
      });

      return {
        orderId: stripeId,
        url: `${process.env.NEXT_PUBLIC_SERVER_URL}/events/${order.eventId}?success=${stripeId}`,
      };
    }

    let stripeId: string;
    let result: CheckoutOrderResponse;

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
          firstName: order.firstName || user?.firstName,
          lastName: order.lastName || user?.lastName,
          ...(order.priceCategories && {
            priceCategories: JSON.stringify(order.priceCategories),
          }),
        },
        application_fee_amount: 0,
        transfer_data: { destination: organizer.stripeId },
      });

      stripeId = paymentIntent.id;
      result = {
        clientSecret: paymentIntent.client_secret!,
        orderId: stripeId,
      };
    } else {
      const session: Stripe.Checkout.Session =
        await stripe.checkout.sessions.create({
          payment_method_types: ['card', 'google_pay', 'apple_pay'],
          line_items: order
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
          success_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/events/${
            order.eventId
          }?success=${order.eventId}_${Date.now()}`,
          cancel_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/events/${order.eventId}?canceled=true`,
          customer_email: user?.email || order.buyerEmail,
          metadata: {
            eventId: order.eventId,
            buyerId: order.buyerId,
            quantity: order.quantity.toString(),
            platformFee: platformFee / 100,
            firstName: order.firstName || user?.firstName,
            lastName: order.lastName || user?.lastName,
            ...(order.priceCategories && {
              priceCategories: JSON.stringify(order.priceCategories),
            }),
          },
          payment_intent_data: {
            application_fee_amount: 0,
            transfer_data: { destination: organizer.stripeId },
          },
        } as Stripe.Checkout.SessionCreateParams);

      stripeId = session.id;
      result = { url: session.url!, orderId: stripeId };
    }

    return result;
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

  const existingOrderConditions: any = {
    event: order.eventId,
    paymentStatus: 'completed',
  };

  if (order.buyerId === 'guest') {
    existingOrderConditions.$or = [
      { buyerEmail: order.buyerEmail, buyer: null },
    ];
  } else {
    existingOrderConditions.$or = [
      { buyer: order.buyerId },
      { buyerEmail: order.buyerEmail, buyer: null },
    ];
  }

  const existingOrder = await Order.findOne(existingOrderConditions);
  if (existingOrder) {
    throw new Error('You have already purchased a ticket for this event.');
  }

  if (order.isFree) {
    const reference = `free_${Date.now()}_${order.eventId}`;
    return { orderId: reference };
  }

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

    const user =
      order.buyerId === 'guest' ? null : await User.findById(order.buyerId);
    if (!user && order.buyerId !== 'guest') throw new Error('User not found');

    const event = await Event.findById(order.eventId);
    if (!event) throw new Error('Event not found');

    const newOrder = await Order.create({
      ...order,
      event: order.eventId,
      buyer: order.buyerId === 'guest' ? null : order.buyerId,
      buyerEmail: order.buyerEmail,
      paymentMethod: order.paymentMethod,
      quantity: order.quantity,
      stripeId: order.stripeId || undefined,
      reference: order.reference || undefined,
      paymentStatus: 'completed',
      firstName: order.firstName || user?.firstName,
      lastName: order.lastName || user?.lastName,
    });

    await sendTicketEmail({
      email: order.buyerEmail,
      eventTitle: event.title,
      eventSubtitle: event.subtitle || '',
      eventImage: event.imageUrl || '',
      orderId: newOrder._id.toString(),
      totalAmount: order.totalAmount || newOrder.totalAmount,
      currency: order.currency,
      quantity: order.quantity,
      firstName: newOrder.firstName,
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

    const order = await Order.findOne({
      buyer: userId,
      event: eventId,
      paymentStatus: 'completed',
    });

    return !!order;
  } catch (error) {
    handleError(error);
    return false;
  }
};

export const hasUserPurchasedEventByEmail = async (
  email: string,
  eventId: string
) => {
  try {
    await connectToDatabase();
    const order = await Order.findOne({
      buyerEmail: email,
      event: eventId,
      paymentStatus: 'completed',
    });
    return !!order;
  } catch (error) {
    handleError(error);
    return false;
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
        $match: { paymentStatus: 'completed' },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'buyer',
          foreignField: '_id',
          as: 'buyer',
        },
      },
      {
        $unwind: {
          path: '$buyer',
          preserveNullAndEmptyArrays: true,
        },
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
            $cond: {
              if: { $eq: ['$buyer', null] },
              then: 'Guest',
              else: { $concat: ['$buyer.firstName', ' ', '$buyer.lastName'] },
            },
          },
          buyerEmail: 1,
        },
      },
      {
        $match: {
          $and: [
            { eventId: eventObjectId },
            {
              $or: [
                { buyer: { $regex: RegExp(searchString, 'i') } },
                { buyerEmail: { $regex: RegExp(searchString, 'i') } },
              ],
            },
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
    const conditions = { buyer: userId, paymentStatus: 'completed' };

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
