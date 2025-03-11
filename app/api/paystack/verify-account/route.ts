'use server';

import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const accountNumber = searchParams.get('account_number');
  const bankCode = searchParams.get('bank_code');

  if (!accountNumber || !bankCode) {
    return NextResponse.json(
      { message: 'Account number and bank code are required' },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(
      `https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );
    const data = await res.json();

    if (data.status && data.data?.account_name) {
      return NextResponse.json(
        { accountName: data.data.account_name },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { message: data.message || 'Invalid account details' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error verifying account:', error);
    return NextResponse.json(
      { message: 'Failed to verify account' },
      { status: 500 }
    );
  }
}
