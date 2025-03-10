import { Bank } from '@/types';
import { connectToDatabase } from '@/lib/database';
import { PaymentDetailsValues } from '@/lib/validator';
import { updateEventStatus } from '@/lib/actions/event.actions'; 
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
  searchParams: { eventId: string };
}) {
  const clerkId = await getUserId();
  const eventId = searchParams.eventId;

  if (!clerkId || !eventId) {
    throw new Error('Missing clerkId or eventId');
  }

  await connectToDatabase();
  const user = await User.findOne({ clerkId });
  if (!user) throw new Error('User not found');
  const userId = user._id.toString();

  const event = await Event.findById(eventId);
  if (!event) throw new Error('Event not found');

  const banks = await fetchBanks();
  const existingDetails = await getUserPaymentDetails(clerkId);

  const handleSubmitSuccess = async () => {
    try {
      await updateEventStatus({
        userId,
        eventId,
        status: 'published',
        path: `/events/${eventId}`,
      });
    } catch (error) {
      console.error('Error finalizing event:', error);
      throw error;
    }
  };

  return (
    <div className="container mx-auto py-8">
      <PaymentDetailsForm
        banks={banks}
        existingDetails={existingDetails}
        onSubmitSuccess={handleSubmitSuccess}
        userId={clerkId}
      />
    </div>
  );
}
