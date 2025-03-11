'use server';

import { ObjectId } from 'mongodb';
import { redirect } from 'next/navigation';

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

// Initialize Paystack transaction with split payment
export const checkoutOrder = async (order: CheckoutOrderParams) => {
  try {
    await connectToDatabase();

    // Find the event to get the organizer's userId
    const event = await Event.findById(order.eventId);
    if (!event) throw new Error('Event not found');

    // Find the organizer to get their subaccountCode
    const organizer = await User.findById(event.organizer);
    if (!organizer || !organizer.subaccountCode) {
      throw new Error('Organizer or subaccount not found');
    }

    const subaccountCode = organizer.subaccountCode;

    // Calculate amounts (e.g., 80% to host, 20% to platform)
    const totalAmount = order.isFree
      ? 0
      : Math.round(Number(order.price) * 100);
    const platformPercentage = 20;
    const hostPercentage = 80;
    const platformShare = Math.round((platformPercentage / 100) * totalAmount);
    const hostShare = totalAmount - platformShare;

    // Define the split configuration
    const split = {
      type: 'percentage',
      currency: order.currency.toUpperCase(),
      subaccounts: [
        {
          subaccount: subaccountCode,
          share: hostPercentage,
        },
      ],
      bearer_type: 'subaccount',
      main_account_share: platformPercentage,
    };

    const user = await User.findById(order.buyerId);
    if (!user) throw new Error('User not found');

    // Initialize Paystack transaction
    const response = await fetch(
      'https://api.paystack.co/transaction/initialize',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          amount: totalAmount,
          currency: order.currency.toUpperCase(),
          reference: `txn_${Date.now()}_${order.eventId}`,
          callback_url: `${process.env.NEXT_PUBLIC_SERVER_URL}dashboard`,
          metadata: {
            eventId: order.eventId,
            buyerId: order.buyerId,
            quantity: order.quantity,
          },
          split,
        }),
      }
    );

    const data = await response.json();
    if (!response.ok || !data.status) {
      throw new Error(
        data.message || 'Failed to initialize Paystack transaction'
      );
    }

    redirect(data.data.authorization_url);
  } catch (error) {
    console.error('Paystack checkout error:', error);
    throw error;
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
      buyerEmail: user.email,
      currency: order.currency,
      priceCategory: order.priceCategory,
      quantity: order.quantity,
    });

    return JSON.parse(JSON.stringify(newOrder));
  } catch (error) {
    handleError(error);
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
