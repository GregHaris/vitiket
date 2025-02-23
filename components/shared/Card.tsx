import Image from 'next/image';
import Link from 'next/link';

import { CardProps, CurrencyKey } from '@/types';
import { currencySymbols } from '@/constants';
import { formatDateTime } from '@/lib/utils';
import getUserId from '@/utils/userId';

import { DeleteConfirmation } from './DeleteConfirmation';

const Card = async ({ event, hasOrderLink, hidePrice }: CardProps) => {
  const userId = await getUserId();

  const isEventCreator = userId === event.organizer?._id.toString();

  // Calculate the lowest price from priceCategories
  const lowestPrice = event.priceCategories?.reduce((min, category) => {
    const price = parseFloat(category.price);
    return price < min ? price : min;
  }, Infinity);

  // Determine the price display text
  let priceDisplay = '';
  if (event.isFree) {
    priceDisplay = 'Free';
  } else if (event.priceCategories?.length === 1) {
    const priceCategory = event.priceCategories[0];
    const currency = event.currency as CurrencyKey;
    priceDisplay = `${currencySymbols[currency] || ''}${priceCategory.price}`;
  } else if (event.priceCategories && event.priceCategories.length > 1) {
    const currency = event.currency as CurrencyKey;
    priceDisplay = `From ${
      currencySymbols[currency] || ''
    }${lowestPrice?.toFixed(2)}`;
  }

  return (
    <div className="group relative flex min-h-[380px] w-full max-w-[400px] flex-col overflow-hidden rounded-xl bg-white shadow-md transition-all hover:shadow-lg md:min-h-[438px]">
      <Link
        href={`/events/${event._id}`}
        style={{ backgroundImage: `url(${event.imageUrl})` }}
        className="flex-center flex-grow bg-gray-50 bg-cover bg-center text-gray-500"
      />
      {isEventCreator && !hidePrice && (
        <div className="absolute right-2 top-2 flex flex-col gap-4 rounded-xl bg-white p-3 shadow-sm transition-all">
          <Link href={`/events/${event._id}/update`}>
            <Image
              src={'/assets/icons/edit.svg'}
              alt="edit"
              width={20}
              height={20}
            />
          </Link>
          <DeleteConfirmation eventId={event._id} />
        </div>
      )}
      <div className="flex min-h-[230px] flex-col gap-3 p-5 md:gap-4">
        <p className="p-semi-bold-14 w-min rounded-full bg-grey-500/10 px-4 py-1 text-grey-500 whitespace-nowrap line-clamp-1">
          {event.category.name}
        </p>

        <p className="p-medium-16 md:p-medium-18 text-gray-500">
          {formatDateTime(event.startDate).dateTime}
        </p>
        <Link href={`/events/${event._id}`}>
          <p className="p-medium-16 md:p-medium-20 line-clamp-2 flex-1 text-black">
            {event.title}
          </p>
        </Link>
        {!hidePrice && (
          <div
            className={`p-semi-bold-14 w-min rounded-full ${
              event.isFree ? 'bg-green-100 text-green-60' : 'text-gray-600'
            } px-4 py-1`}
          >
            {priceDisplay}
          </div>
        )}

        <div className="flex-between w-full">
          <p className="p-medium-14 md:p-medium-16 text-grey-600">
            <span className="font-bold">Host:</span>{' '}
            <span>
              {event.organizer.firstName} {event.organizer.lastName}
            </span>
          </p>
          {hasOrderLink && (
            <Link href={`/orders?eventId=${event._id}`} className="flex gap-2">
              <p className="text-primary-500">Order Details</p>
              <Image
                src={'/assets/icons/arrow.svg'}
                alt="search"
                width={10}
                height={10}
              />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Card;
