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

  const eventLocation = event.location?.split(', ||')[0];

  // Calculate the lowest price from priceCategories
  const lowestPrice = event.priceCategories?.reduce((min, category) => {
    const price = parseFloat(category.price);
    return price < min ? price : min;
  }, Infinity);

  // Determine the price display text
  let priceDisplay = '';
  const currency = event.currency as CurrencyKey;
  const currencySymbol = currencySymbols[currency] || '₦'; 

  if (event.isFree) {
    priceDisplay = 'Free';
  } else if (event.priceCategories?.length === 1) {
    const priceCategory = event.priceCategories[0];
    priceDisplay = `${currencySymbol}${Number(
      priceCategory.price
    ).toLocaleString('en-NG', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  } else if (event.priceCategories && event.priceCategories.length > 1) {
    priceDisplay = `From ${currencySymbol}${Number(lowestPrice).toLocaleString(
      'en-NG',
      {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }
    )}`;
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
        <Link href={`/events/${event._id}`}>
          <h4 className="text-xl font-bold line-clamp-2 flex-1 text-black">
            {event.title}
          </h4>
        </Link>
        <div className="flex items-center gap-3">
          <Image
            src={'/assets/icons/calendar.svg'}
            alt="calendar"
            width={20}
            height={20}
          />
          <p className="p-medium-16 md:p-medium-18 text-gray-400">
            {formatDateTime(event.startDate).dateTime}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Image
            src={'/assets/icons/location.svg'}
            alt="location"
            width={20}
            height={20}
          />
          <p className="p-medium-16 md:p-medium-18 text-gray-400">
            {event.locationType === 'Virtual' ? 'Virtual Event' : eventLocation}
          </p>
        </div>

        {!hidePrice && (
          <div className="flex justify-between items-center gap-3">
            <p
              className={
                'w-min rounded-full whitespace-nowrap text-primary font-bold'
              }
            >
              {priceDisplay}
            </p>
            <p
              className="text-sm font-bold w-min rounded-full bg-gray-100 px-4 py-1 whitespace-nowrap line-clamp-1"
              style={{ color: event.category?.color }}
            >
              {event.category?.name}
            </p>
          </div>
        )}

        <div className="flex-between w-full">
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
