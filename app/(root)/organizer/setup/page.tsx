import { Bank } from '@/types';
import { connectToDatabase } from '@/lib/database';
import { PaymentDetailsValues } from '@/lib/validator';
import Event from '@/lib/database/models/event.model';
import getUserId from '@/utils/userId';
import PaymentDetailsForm from '@shared/PaymentDetailsForm';
import User from '@/lib/database/models/user.model';

async function getUserPaymentDetails(
  clerkId: string
): Promise<(PaymentDetailsValues & { subaccountCode: string }) | undefined> {
  try {
    await connectToDatabase();
    const user = await User.findOne({ clerkId });
    if (user && user.subaccountCode) {
      return {
        businessName: user.businessName || `${user.firstName} ${user.lastName}`,
        bankName: user.bankName || '',
        accountName: user.bankDetails?.accountName || '',
        accountNumber: user.bankDetails?.accountNumber || '',
        subaccountCode: user.subaccountCode,
      };
    }
    return undefined;
  } catch (error) {
    console.error('Error fetching user payment details:', error);
    return undefined;
  }
}

async function fetchBanks(): Promise<Bank[]> {
  const res = await fetch('https://api.paystack.co/bank', {
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    },
    cache: 'force-cache',
  });
  if (!res.ok) throw new Error('Failed to fetch banks');
  const data = await res.json();
  return data.data.filter((bank: Bank) => bank.active);
}

export default async function SetupPage({
  searchParams,
}: {
  searchParams: Promise<{ eventId: string }>;
}) {
  const userId = await getUserId();
  const { eventId } = await searchParams;

  if (!userId || !eventId) {
    throw new Error('Missing clerkId or eventId');
  }

  await connectToDatabase();
  if (!userId) throw new Error('User not found');

  const event = await Event.findById(eventId);
  if (!event) throw new Error('Event not found');

  const isNigerianEvent =
    event.currency.toUpperCase() === 'NGN' ||
    event.location.toLowerCase().includes('nigeria');

  const banks = await fetchBanks();
  const existingDetails = await getUserPaymentDetails(userId);

  return (
    <div className="container mx-auto py-8">
      <PaymentDetailsForm
        banks={banks}
        existingDetails={existingDetails}
        eventId={eventId}
        userId={userId}
        isNigerianEvent={isNigerianEvent}
      />
    </div>
  );
}
