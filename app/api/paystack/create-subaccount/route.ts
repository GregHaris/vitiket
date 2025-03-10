import { NextRequest, NextResponse } from 'next/server';

import { Bank } from '@/types';
import { connectToDatabase } from '@/lib/database';
import { updateUserPaymentDetails } from '@/lib/actions/user.actions';

export async function POST(req: NextRequest) {
  const { businessName, bankName, accountNumber } = await req.json();
  const clerkId = req.headers.get('x-user-id'); 

  if (!businessName || !bankName || !accountNumber || !clerkId) {
    return NextResponse.json(
      { message: 'All fields are required' },
      { status: 400 }
    );
  }

  try {
    // Fetch banks to map bankName to bank_code
    const banksRes = await fetch('https://api.paystack.co/bank', {
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
      cache: 'force-cache',
    });
    const banksData = await banksRes.json();
    const bank = banksData.data.find((b: Bank) => b.name === bankName);

    if (!bank) {
      return NextResponse.json(
        { message: 'Invalid bank name' },
        { status: 400 }
      );
    }

    // Create subaccount
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
        percentage_charge: 20,
      }),
    });

    const subaccountData = await subaccountRes.json();

    if (!subaccountRes.ok) {
      throw new Error(subaccountData.message || 'Failed to create subaccount');
    }

    // Save payment details to User model
    await connectToDatabase();
    await updateUserPaymentDetails(clerkId, {
      subaccountCode: subaccountData.data.subaccount_code,
      businessName,
      bankName,
      accountNumber,
    });

    return NextResponse.json(
      {
        message: 'Subaccount created successfully',
        subaccountCode: subaccountData.data.subaccount_code,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating subaccount:', error);
    return NextResponse.json(
      { message: (error as Error).message || 'Failed to create subaccount' },
      { status: 500 }
    );
  }
}
