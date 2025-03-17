import { NextRequest, NextResponse } from 'next/server';

import { Bank } from '@/types';
import { connectToDatabase } from '@/lib/database';
import { updateUserPaymentDetails } from '@/lib/actions/user.actions';
import User from '@/lib/database/models/user.model';

export async function POST(req: NextRequest) {
  const { businessName, bankName, accountNumber } = await req.json();
  const userId = req.headers.get('x-user-id');

  if (!businessName || !bankName || !accountNumber || !userId) {
    return NextResponse.json(
      { message: 'All fields are required' },
      { status: 400 }
    );
  }

  try {
    await connectToDatabase();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Fetch banks to map bankName to bank_code
    const banksRes = await fetch('https://api.paystack.co/bank', {
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
      cache: 'force-cache',
    });
    if (!banksRes.ok) {
      throw new Error('Failed to fetch banks from Paystack');
    }
    const banksData = await banksRes.json();
    const bank = banksData.data.find((b: Bank) => b.name === bankName);

    if (!bank) {
      return NextResponse.json(
        { message: 'Invalid bank name' },
        { status: 400 }
      );
    }

    // Create subaccount with 0% charge (host pays only gateway fees)
    const subaccountRes = await fetch('https://api.paystack.co/subaccount', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        business_name: businessName,
        bank_code: bank.code,
        account_number: accountNumber,
        percentage_charge: 0, 
      }),
    });

    const subaccountData = await subaccountRes.json();

    if (!subaccountRes.ok) {
      return NextResponse.json(
        { message: subaccountData.message || 'Failed to create subaccount' },
        { status: subaccountRes.status }
      );
    }

    // Save payment details to User model
    await updateUserPaymentDetails(userId, {
      subaccountCode: subaccountData.data.subaccount_code,
      businessName,
      bankName,
      accountNumber,
      accountName: subaccountData.data.account_name,
    });

    return NextResponse.json(
      {
        message: 'Account details saved successfully',
        subaccountCode: subaccountData.data.subaccount_code,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating subaccount:', error);
    return NextResponse.json(
      { message: 'Failed to save account details' },
      { status: 500 }
    );
  }
}
