import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@ui/button';
import { currencySymbols } from '@/constants';
import { formatDateTime } from '@/lib/utils';
import {
  getEventById,
  getRelatedEventsByCategory,
} from '@/lib/actions/event.actions';
import { PriceCategory, SearchParamProps, CurrencyKey } from '@/types';
import Collection from '@shared/Collection';
import EventMap from '@shared/EventMap';
import SafeHTMLRenderer from '@shared/SafeHTMLRenderer';

const EventDetails = async (props: SearchParamProps) => {
  const resolvedSearchParams = await props.searchParams;
  const params = await props.params;

  const { id } = params;

  const event = await getEventById(id);

  const relatedEvents = await getRelatedEventsByCategory({
    categoryId: event.category._id,
    eventId: event._id,
    page: resolvedSearchParams?.page as string,
  });

  const isSameDate =
    formatDateTime(event.startDate).dateOnly ===
    formatDateTime(event.endDate).dateOnly;

  const currencySymbol = currencySymbols[event.currency as CurrencyKey] || '';

  return (
    <>
      <section className="wrapper">
        <div className="2xl:max-w-7xl space-y-6 w-full">
          {/* Event Image */}
          <div className="w-full">
            <Image
              src={event.imageUrl}
              alt={'hero image'}
              width={1000}
              height={1000}
              className="min-h-[300px] md:h-[600px] w-full object-cover object-center rounded-2xl"
            />
          </div>

          <div className="flex w-full flex-col gap-8 p-5 md:p-10">
            <div className="flex flex-col gap-2 space-y-6">
              <h2 className="text-4xl font-bold">{event.title}</h2>
              <div className="flex flex-col gap-5">
                <div className="flex flex-col md:flex-row md:justify-between md:gap-5 gap-3 justify-center mb-3">
                  <div className="flex items-center gap-5 mb-3 md:mb-0">
                    <p className="p-medium-18 ml-2 mt-2 sm:mt-0">
                      <span className="font-bold">Host:</span>{' '}
                      <span>
                        {event.organizer.firstName} {event.organizer.lastName}
                      </span>
                    </p>
                    <p className="p-medium-16 rounded-full bg-grey-500/10 px-4 py-2.5 text-grey-500">
                      {event.category.name}
                    </p>
                  </div>
                  {/* Use Link to navigate to the checkout page */}
                  <Link href={`/checkout/${event._id}`} passHref>
                    <Button
                      type="button"
                      className="button px-10 py-5 p-bold-16 "
                    >
                      Get Ticket
                    </Button>
                  </Link>
                </div>
                <div className="flex gap-2 md:gap-3 items-center">
                  <Image
                    src={'/assets/icons/calendar.svg'}
                    alt="calendar"
                    width={32}
                    height={32}
                  />
                  <div className="p-medium-16 lg:p-regular-20 items-center">
                    {/* Conditionally render the date */}
                    {isSameDate ? (
                      <p>{formatDateTime(event.startDate).dateOnly}</p>
                    ) : (
                      <p>
                        {formatDateTime(event.startDate).dateOnly} -{' '}
                        {formatDateTime(event.endDate).dateOnly}
                      </p>
                    )}
                  </div>
                </div>{' '}
                <div className="flex gap-2 md:gap-3 items-center">
                  <Image
                    src={'/assets/icons/clock.svg'}
                    alt="calendar"
                    width={32}
                    height={32}
                  />
                  <div className="p-medium-16 lg:p-regular-20 items-center">
                    <p>
                      {formatDateTime(event.startTime).timeOnly} -{' '}
                      {formatDateTime(event.endTime).timeOnly}
                    </p>
                  </div>
                </div>
                <div className="p-regular-20 flex item-center gap-3">
                  <Image
                    src={'/assets/icons/location.svg'}
                    alt="location"
                    width={32}
                    height={32}
                  />
                  <p className="p-medium-16 lg:p-regular-20">
                    {event.location}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2 space-y-6">
                <h3 className="text-2xl font-bold">About this Event</h3>
                <SafeHTMLRenderer html={event.description} />
                <p className="p-medium-16 lg:p-regular-18 truncate text-primary-500 underline">
                  {event.url}
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex gap-3">
                  {/* Display Event Price or Price Categories */}
                  {event.isFree ? (
                    <p className="p-bold-20 rounded-full bg-green-500/10 px-5 py-2 text-green-700">
                      FREE
                    </p>
                  ) : event.priceCategories &&
                    event.priceCategories.length === 1 ? (
                    <div className="flex flex-col gap-2">
                      <p className="p-bold-20">Price: </p>
                      <p className="p-medium-16 px-4 py-2">
                        {event.priceCategories[0].name} - {currencySymbol}
                        {event.priceCategories[0].price}
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <p className="p-bold-20">Price Categories</p>
                      {event.priceCategories?.map(
                        (category: PriceCategory, index: number) => (
                          <p key={index} className="p-medium-16 px-4 py-2">
                            {category.name}: {currencySymbol}
                            {category.price}
                          </p>
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* Map Section */}
            {(event.locationType === 'Physical' ||
              event.location === 'Hybrid') &&
              event.coordinates && (
                <div>
                  <h3 className="text-2xl font-bold">Direction</h3>
                  <div className="w-full h-[400px]">
                    <EventMap
                      coordinates={event.coordinates}
                      destinationName={event.location}
                    />
                  </div>
                </div>
              )}
            <Link href={`/checkout/${event._id}`} passHref>
              <Button type="button" className="button px-10 py-5 p-bold-16">
                Get Ticket
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* {RELATED EVENTS - SAME CATEGORY} */}
      <section className="wrapper my-7 flex flex-col gap-8 md:gap-12">
        <h2 className="h2-bold">Related Events</h2>
        <Collection
          data={relatedEvents?.data}
          emptyTitle="No Events Found"
          emptyStateSubtext="Check back later"
          collectionType="All_Events"
          limit={3}
          page={resolvedSearchParams?.page as string}
          totalPages={relatedEvents?.totalPages}
        />
      </section>
    </>
  );
};

export default EventDetails;
