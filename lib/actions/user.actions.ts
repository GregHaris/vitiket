'use server';

import { revalidatePath } from 'next/cache';

import { connectToDatabase } from '@/lib/database';
import {
  CreateUserParams,
  PaymentDetails,
  PaymentDetailsUpdate,
  UpdateUserParams,
} from '@/types';
import { handleError } from '@/lib/utils';
import Event from '@/lib/database/models/event.model';
import Order from '@/lib/database/models/order.model';
import User from '@/lib/database/models/user.model';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function createUser(user: CreateUserParams) {
  try {
    await connectToDatabase();

    const existingUser = await User.findOne({ email: user.email });
    if (existingUser) {
      return JSON.parse(JSON.stringify(existingUser));
    }

    const newUser = await User.create(user);
    return JSON.parse(JSON.stringify(newUser));
  } catch (error) {
    handleError(error);
  }
}

export async function getUserById(userId: string) {
  try {
    await connectToDatabase();

    const user = await User.findById(userId);

    if (!user) throw new Error('User not found');
    return JSON.parse(JSON.stringify(user));
  } catch (error) {
    handleError(error);
  }
}

export async function getUserIdByClerkId(clerkId: string) {
  try {
    await connectToDatabase();
    const user = await User.findOne({ clerkId });
    if (!user) throw new Error('User not found');
    return JSON.parse(JSON.stringify(user));
  } catch (error) {
    handleError(error);
    throw error;
  }
}

export async function updateUser(userId: string, user: UpdateUserParams) {
  try {
    await connectToDatabase();

    const updatedUser = await User.findOneAndUpdate({ userId }, user, {
      new: true,
    });

    if (!updatedUser) throw new Error('User update failed');
    return JSON.parse(JSON.stringify(updatedUser));
  } catch (error) {
    handleError(error);
  }
}

export async function deleteUser(clerkId: string) {
  try {
    await connectToDatabase();

    const userToDelete = await User.findOne({ clerkId });

    if (!userToDelete) {
      throw new Error('User not found');
    }

    await Promise.all([
      Event.updateMany(
        { _id: { $in: userToDelete.events } },
        { $pull: { organizer: userToDelete._id } }
      ),
      Order.updateMany(
        { _id: { $in: userToDelete.orders } },
        { $unset: { buyer: 1 } }
      ),
    ]);

    const deletedUser = await User.findByIdAndDelete(userToDelete._id);
    revalidatePath('/');

    return deletedUser ? JSON.parse(JSON.stringify(deletedUser)) : null;
  } catch (error) {
    handleError(error);
  }
}

// Update user payment details including subaccountCode, businessName, bankName, and accountNumber
export async function updateUserPaymentDetails(
  userId: string,
  paymentDetails: PaymentDetails
) {
  try {
    await connectToDatabase();

    const updateData: PaymentDetailsUpdate = {};
    if (paymentDetails.subaccountCode)
      updateData.subaccountCode = paymentDetails.subaccountCode;
    if (paymentDetails.businessName)
      updateData.businessName = paymentDetails.businessName;
    if (paymentDetails.bankName) updateData.bankName = paymentDetails.bankName;
    if (paymentDetails.accountNumber || paymentDetails.accountName) {
      updateData.bankDetails = {
        accountNumber: paymentDetails.accountNumber || '',
        accountName: paymentDetails.accountName || '',
      };
    }
    if (paymentDetails.stripeId) updateData.stripeId = paymentDetails.stripeId;

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    });

    if (!updatedUser) throw new Error('User not found');
    return JSON.parse(JSON.stringify(updatedUser));
  } catch (error) {
    handleError(error);
  }
}

// Update User info to create Stripe connected account
export async function createStripeConnectedAccount(
  userId: string,
  email: string
) {
  try {
    await connectToDatabase();

    const account = await stripe.accounts.create({
      type: 'express',
      email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { stripeId: account.id },
      { new: true }
    );

    if (!updatedUser) throw new Error('User not found');

    // Generate an account link for embedded onboarding completion
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/organizer/setup?refresh=true`,
      return_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/dashboard`,
      type: 'account_onboarding',
    });

    return { stripeId: account.id, onboardingUrl: accountLink.url };
  } catch (error) {
    handleError(error);
    throw error;
  }
}
