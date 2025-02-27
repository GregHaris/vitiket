import { getEventById } from '@/lib/actions/event.actions';
import CheckoutDetails from '@shared/CheckoutDetails';

export default async function Checkout({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { quantity: string; totalPrice: string };
}) {
  const event = await getEventById(params.id);
  const quantity = parseInt(searchParams.quantity);
  const totalPrice = parseFloat(searchParams.totalPrice);

  return (
    <CheckoutDetails event={event} quantity={quantity} totalPrice={totalPrice} />
  );
}
