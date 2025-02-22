import { SearchParamProps } from '@/types';
import Image from 'next/image';

import {
  getEventById,
  getRelatedEventsByCategory,
} from '@/lib/actions/event.actions';
import CheckoutButton from '@shared/CheckoutButton';
import Collection from '@shared/Collection';
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

  return (
    <>
      <section className="flex justify-center wrapper">
        <div className="2xl:max-w-7xl">
          <Image
            src={event.imageUrl}
            alt={'hero image'}
            width={1000}
            height={1000}
            className="min-h-[300px] object-cover object-center rounded-2xl"
          />
          <div className="flex w-full flex-col gap-8 p-5 md:p-10">
            <div className="flex flex-col gap-2">
              <h2 className="text-4xl font-bold">{event.title}</h2>
              <div className="flex flex-col gap-5">
                <div className="flex gap-2 md:gap-3 ">
                  <Image
                    src={'/assets/icons/calendar.svg'}
                    alt="calendar"
                    width={32}
                    height={32}
                  />
                  <div className="p-medium-16 lg:p-regular-20 items-center">
                    <p>
                      {event.startDate} - {event.endDate}
                    </p>
                    <p>
                      {event.startTime} - {event.endTime}
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
              <div className="flex flex-col gap-2">
                <p className="p-bold-20 text-gray-600">About Event</p>
                <SafeHTMLRenderer html={event.description} />
                <p className="p-medium-16 lg:p-regular-18 truncate text-primary-500 underline">
                  {event.url}
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex gap-3">
                  <p className="p-bold-20 rounded-full bg-green-500/10 px-5 py-2 text-green-700">
                    {event.isFree ? 'FREE' : `$${event.price}`}
                  </p>
                  <p className="p-medium-16 rounded-full bg-grey-500/10 px-4 py-2.5 text-grey-500">
                    {event.category.name}
                  </p>
                </div>
                <p className="p-medium-18 ml-2 mt-2 sm:mt-0">
                  by{' '}
                  <span className="text-primary-500">
                    {event.organizer.firstName} {event.organizer.lastName}
                  </span>
                </p>
              </div>
            </div>
            <CheckoutButton event={event} />
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
