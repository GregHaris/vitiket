"use server";

import { ObjectId } from "mongodb";

import {
  CheckoutOrderParams,
  CheckoutOrderResponse,
  CreateOrderParams,
  ExistingOrderConditions,
  GetOrdersByEventParams,
  GetOrdersByUserParams,
} from "@/types";
import { connectToDatabase } from "../database";
import { handleError } from "../utils";
import Event from "../database/models/event.model";
import Order from "../database/models/order.model";
import User from "../database/models/user.model";

// PAYSTACK CHECKOUT
const checkoutPaystack = async (
  order: CheckoutOrderParams,
): Promise<CheckoutOrderResponse> => {
  try {
    await connectToDatabase();

    const event = await Event.findById(order.eventId);
    if (!event) throw new Error("Event not found");

    const user =
      order.buyerId === "guest" ? null : await User.findById(order.buyerId);

    const ticketAmount = order.priceCategories!.reduce((sum, cat) => {
      const price = Number(cat.price);
      const quantity = cat.quantity;
      if (isNaN(price) || price < 0 || quantity < 0) {
        throw new Error(
          `Invalid price or quantity: price=${cat.price}, quantity=${cat.quantity}`,
        );
      }
      return sum + Math.round(price * 100) * quantity;
    }, 0);

    const totalAmount = ticketAmount;

    const organizer = await User.findById(event.organizer);
    if (!organizer || !organizer.subaccountCode)
      throw new Error("Organizer or subaccount not found");

    const subaccountCode = organizer.subaccountCode;

    const paystackFeePercentage = 0.015;
    const paystackFlatFee = 100;
    const paystackFeeCap = 2000;

    let paystackFee =
      Math.round(totalAmount * paystackFeePercentage) + paystackFlatFee;
    if (totalAmount >= 250000) paystackFee = paystackFeeCap;

    if (totalAmount < 100 + paystackFee) {
      throw new Error(
        `Total amount (${totalAmount / 100} NGN) is below the minimum required (${(100 + paystackFee) / 100} NGN) to cover Paystack fees.`,
      );
    }

    const mainAccountMinimumShare =
      Math.ceil((paystackFee / totalAmount) * 100) + 1;
    const subaccountShare = 100 - mainAccountMinimumShare;

    const reference = `txn_${Date.now()}_${order.eventId}`;

    const newOrder = await Order.create({
      event: order.eventId,
      buyer: order.buyerId === "guest" ? null : order.buyerId,
      buyerEmail: user?.email || order.buyerEmail,
      totalAmount: (totalAmount / 100).toString(),
      currency: "NGN",
      paymentMethod: "paystack",
      quantity: order.quantity,
      priceCategories: order.priceCategories,
      reference,
      paymentStatus: "pending",
      firstName: order.firstName || user?.firstName,
      lastName: order.lastName || user?.lastName,
    });

    const payload = {
      email: user?.email || order.buyerEmail,
      amount: totalAmount,
      currency: "NGN",
      reference,
      callback_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/events/${order.eventId}?success=${newOrder._id}`,
      metadata: {
        eventId: order.eventId,
        buyerId: order.buyerId,
        quantity: order.quantity,
        firstName: order.firstName || user?.firstName,
        lastName: order.lastName || user?.lastName,
        ...(order.priceCategories && {
          priceCategories: JSON.stringify(order.priceCategories),
        }),
      },
      split: {
        type: "percentage",
        currency: "NGN",
        subaccounts: [{ subaccount: subaccountCode, share: subaccountShare }],
        bearer_type: "account",
        main_account_share: mainAccountMinimumShare,
      },
    };

    const response = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );

    const data = await response.json();
    if (!response.ok || !data.status) {
      await Order.deleteOne({ _id: newOrder._id });
      throw new Error(
        data.message || "Failed to initialize Paystack transaction",
      );
    }

    return {
      url: data.data.authorization_url,
      orderId: newOrder._id.toString(),
    };
  } catch (error) {
    throw error;
  }
};

// CHECKOUT FREE EVENTS
export async function checkoutFreeEvent(order: CheckoutOrderParams) {
  try {
    await connectToDatabase();

    const event = await Event.findById(order.eventId);
    if (!event) throw new Error("Event not found");
    if (!event.isFree) throw new Error("This is not a free event");

    const user =
      order.buyerId && order.buyerId !== "guest"
        ? await User.findById(order.buyerId)
        : null;

    const existingOrderConditions = {
      event: order.eventId,
      paymentStatus: "completed",
      $or: [
        { buyer: order.buyerId === "guest" ? null : order.buyerId },
        { buyerEmail: order.buyerEmail },
      ],
    };
    const existingOrder = await Order.findOne(existingOrderConditions);
    if (existingOrder)
      throw new Error("You have already registered for this event");

    const reference = `free_${Date.now()}_${order.eventId}`;
    const newOrder = await Order.create({
      event: order.eventId,
      buyer: order.buyerId === "guest" ? null : order.buyerId,
      buyerEmail: user?.email || order.buyerEmail,
      totalAmount: "0",
      currency: "NGN",
      paymentMethod: "none",
      quantity: order.quantity,
      priceCategories: order.priceCategories || [
        { name: "Free", price: "0", quantity: order.quantity },
      ],
      reference,
      paymentStatus: "completed",
      firstName: order.firstName || user?.firstName,
      lastName: order.lastName || user?.lastName,
    });

    fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/send-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: newOrder.buyerEmail,
        eventTitle: event.title,
        eventSubtitle: event.subtitle || "",
        eventImage: event.imageUrl || "",
        orderId: newOrder._id.toString(),
        totalAmount: "0",
        currency: "NGN",
        quantity: newOrder.quantity,
        firstName: newOrder.firstName,
        priceCategories: newOrder.priceCategories,
      }),
    }).catch(() => {});

    return {
      success: true,
      orderId: newOrder._id.toString(),
      redirectUrl: `${process.env.NEXT_PUBLIC_SERVER_URL}/events/${order.eventId}?success=${newOrder._id}`,
    };
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error("An unexpected error occurred");
  }
}

// CHECKOUT
export const checkoutOrder = async (order: CheckoutOrderParams) => {
  await connectToDatabase();
  const event = await Event.findById(order.eventId).populate("organizer");
  if (!event) throw new Error("Event not found");

  const existingOrderConditions: ExistingOrderConditions = {
    event: order.eventId,
    paymentStatus: "completed",
  };

  if (order.buyerId === "guest") {
    existingOrderConditions.$or = [
      { buyerEmail: order.buyerEmail, buyer: null },
    ];
  } else {
    existingOrderConditions.$or = [
      { buyer: order.buyerId as string },
      { buyerEmail: order.buyerEmail, buyer: null },
    ];
  }

  const existingOrder = await Order.findOne(existingOrderConditions);
  if (existingOrder) {
    throw new Error("You have already purchased a ticket for this event.");
  }

  return await checkoutPaystack(order);
};

// CREATE ORDER
export const createOrder = async (order: CreateOrderParams) => {
  try {
    await connectToDatabase();

    const user =
      order.buyerId === "guest" ? null : await User.findById(order.buyerId);
    if (!user && order.buyerId !== "guest") throw new Error("User not found");

    const event = await Event.findById(order.eventId);
    if (!event) throw new Error("Event not found");

    const newOrder = await Order.create({
      ...order,
      event: order.eventId,
      buyer: order.buyerId === "guest" ? null : order.buyerId,
      buyerEmail: order.buyerEmail,
      paymentMethod: order.paymentMethod,
      quantity: order.quantity,
      reference: order.reference || undefined,
      paymentStatus: "completed",
      firstName: order.firstName || user?.firstName,
      lastName: order.lastName || user?.lastName,
      priceCategories: order.priceCategories,
    });

    return JSON.parse(JSON.stringify(newOrder));
  } catch (error) {
    handleError(error);
    throw error;
  }
};

export const hasUserPurchasedEvent = async (
  userId: string,
  eventId: string,
) => {
  try {
    await connectToDatabase();

    const order = await Order.findOne({
      buyer: userId,
      event: eventId,
      paymentStatus: "completed",
    });

    return !!order;
  } catch (error) {
    handleError(error);
    return false;
  }
};

export const hasUserPurchasedEventByEmail = async (
  email: string,
  eventId: string,
) => {
  try {
    await connectToDatabase();
    const order = await Order.findOne({
      buyerEmail: email,
      event: eventId,
      paymentStatus: "completed",
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

    if (!eventId) throw new Error("Event ID is required");
    const eventObjectId = new ObjectId(eventId);

    const orders = await Order.aggregate([
      {
        $match: { paymentStatus: "completed" },
      },
      {
        $lookup: {
          from: "users",
          localField: "buyer",
          foreignField: "_id",
          as: "buyer",
        },
      },
      {
        $unwind: {
          path: "$buyer",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "events",
          localField: "event",
          foreignField: "_id",
          as: "event",
        },
      },
      {
        $unwind: "$event",
      },
      {
        $project: {
          _id: 1,
          totalAmount: 1,
          createdAt: 1,
          eventTitle: "$event.title",
          eventId: "$event._id",
          buyer: {
            $cond: {
              if: { $eq: ["$buyer", null] },
              then: "Guest",
              else: { $concat: ["$buyer.firstName", " ", "$buyer.lastName"] },
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
                { buyer: { $regex: RegExp(searchString, "i") } },
                { buyerEmail: { $regex: RegExp(searchString, "i") } },
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
    const conditions = { buyer: userId, paymentStatus: "completed" };

    const orders = await Order.distinct("event._id")
      .find(conditions)
      .sort({ createdAt: "desc" })
      .skip(skipAmount)
      .limit(limit)
      .populate({
        path: "event",
        model: Event,
        select:
          "_id title subtitle imageUrl currency startDate location organizer",
        populate: {
          path: "organizer",
          model: User,
          select: "_id firstName lastName",
        },
      })
      .populate({
        path: "buyer",
        model: User,
        select: "_id firstName lastName email",
      });

    const ordersCount =
      await Order.distinct("event._id").countDocuments(conditions);

    return {
      data: JSON.parse(JSON.stringify(orders)),
      totalPages: Math.ceil(ordersCount / limit),
    };
  } catch (error) {
    handleError(error);
  }
}
