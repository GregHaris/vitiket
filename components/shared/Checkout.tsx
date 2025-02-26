import { useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';

import { Button } from '../ui/button';
import { checkoutOrder } from '@/lib/actions/order.actions';
import { IEvent } from '@/lib/database/models/event.model';

loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const Checkout = ({
  event,
  userId,
  quantity,
  totalPrice,
}: {
  event: IEvent;
  userId: string;
  quantity: number;
  totalPrice: number;
}) => {
  useEffect(() => {
    // Check to see if this is a redirect back from Checkout
    const query = new URLSearchParams(window.location.search);
    if (query.get('success')) {
      console.log('Order placed! You will receive an email confirmation.');
    }

    if (query.get('canceled')) {
      console.log(
        'Order canceled -- continue to shop around and checkout when you’re ready.'
      );
    }
  }, []);

  const onCheckout = async () => {
    const order = {
      eventTitle: event.title,
      buyerId: userId,
      eventId: event._id,
      price: totalPrice.toString(),
      isFree: event.isFree || false,
      currency: event.currency,
      quantity: quantity,
    };

    await checkoutOrder(order);
  };

  return (
    <form
      action={onCheckout}
      className="fixed bottom-0 left-0 right-0 md:sticky md:top-4 z-50 flex justify-end p-4 bg-white shadow-lg md:bg-transparent md:shadow-none"
    >
      <Button
        type="submit"
        role="link"
        size="lg"
        className="button w-full md:w-auto cursor-pointer font-bold px-25"
      >
        {event.isFree
          ? 'Checkout - Free'
          : `Checkout - ${event.currency} ${totalPrice}`}
      </Button>
    </form>
  );
};

export default Checkout;
