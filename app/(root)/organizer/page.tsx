'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { getUserById } from '@/lib/actions/user.actions';
import { getEventById, updateEventStatus } from '@/lib/actions/event.actions';
import { IEvent } from '@/lib/database/models/event.model';
import { IUser } from '@/lib/database/models/user.model';

export default function OrganizerConfirmationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');
  const eventId = searchParams.get('eventId');
  const [userDetails, setUserDetails] = useState<IUser | null>(null);
  const [eventDetails, setEventDetails] = useState<IEvent | null>(null);

  useEffect(() => {
    async function fetchDetails() {
      if (userId && eventId) {
        try {
          const [user, event] = await Promise.all([
            getUserById(userId),
            getEventById(eventId),
          ]);
          setUserDetails(user);
          setEventDetails(event);
        } catch (error) {
          console.error('Error fetching details:', error);
        }
      }
    }
    fetchDetails();
  }, [userId, eventId]);

  const handleContinue = async () => {
    if (!userId || !eventId) return;
    await updateEventStatus({
      userId,
      eventId,
      status: 'published',
      path: `/events/${eventId}`,
    });
    router.push(`/events/${eventId}`);
  };

  const handleUpdate = () => {
    if (!userId || !eventId) return;
    router.push(`/organizer/setup?userId=${userId}&eventId=${eventId}`);
  };

  return (
    <div className="wrapper space-y-6">
      <h2 className="text-4xl font-bold text-center mb-10">
        Confirm Payment Details
      </h2>
      {userDetails?.subaccountCode ? (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold">Paystack Details</h3>
          <p>
            <strong>Business Name:</strong> {userDetails.businessName}
          </p>
          <p>
            <strong>Bank Name:</strong> {userDetails.bankName}
          </p>
          <p>
            <strong>Account Number:</strong>{' '}
            {userDetails.bankDetails?.accountNumber}
          </p>
          <p>
            <strong>Account Name:</strong>{' '}
            {userDetails.bankDetails?.accountName}
          </p>
          <p>
            <strong>Subaccount Code:</strong> {userDetails.subaccountCode}
          </p>
        </div>
      ) : (
        <p className="text-sm text-gray-600">
          No Paystack payment details found. Please update your details.
        </p>
      )}
      <div className="flex gap-4">
        <button
          onClick={handleContinue}
          className="button hover:bg-primary-600 bg-primary px-4 py-2"
        >
          Continue with Existing Details
        </button>
        <button
          onClick={handleUpdate}
          className="rounded-md h-[40px] cursor-pointer hover:bg-gray-200 text-black bg-white border border-gray-300 px-4 py-2"
        >
          Update Payment Details
        </button>
      </div>
    </div>
  );
}
