'use client';

import { SignedIn, SignedOut, SignInButton, useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';

import { Button } from '../ui/button';
import { IEvent } from '@/lib/database/models/event.model';
import { hasUserPurchasedEvent } from '@/lib/actions/order.actions';
import Checkout from './Checkout';

const CheckoutButton = ({ event }: { event: IEvent }) => {
  const { isLoaded, user } = useUser();
  const [hasPurchased, setHasPurchased] = useState(false);

  useEffect(() => {
    const checkPurchase = async () => {
      if (user) {
        const userId = user.publicMetadata.userId as string;
        const purchased = await hasUserPurchasedEvent(userId, event._id);
        setHasPurchased(purchased ?? false);
      }
    };

    checkPurchase();
  }, [user, event._id]);

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  const userId = user?.publicMetadata.userId as string;
  const isEventCreator = userId === event.organizer._id.toString();
  const hasEventFinished = new Date(event.endDateTime) < new Date();

  return (
    !isEventCreator && (
      <div className="flex item-center gap-3">
        {hasEventFinished ? (
          <p className="p-2 text-red-400">
            Sorry, tickets are no longer available.
          </p>
        ) : hasPurchased ? (
          <p className="p-2 text-red-400">Ticket already purchased</p>
        ) : (
          <>
            <SignedOut>
              <SignInButton>
                <Button
                  className="button cursor-pointer rounded-full"
                  size={'lg'}
                  asChild
                >
                  Get Tickets
                </Button>
              </SignInButton>
            </SignedOut>

            <SignedIn>
              <Checkout event={event} userId={userId} />
            </SignedIn>
          </>
        )}
      </div>
    )
  );
};

export default CheckoutButton;
