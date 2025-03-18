import { IEvent } from '@/lib/database/models/event.model';
import {
  getEventById,
  getRelatedEventsByCategory,
} from '@/lib/actions/event.actions';
import { SearchParamProps } from '@/types';
import Collection from '@shared/Collection';
import EventDetails from './EventDetails';

export default async function EventDetailsPage(props: SearchParamProps) {
  const resolvedSearchParams = await props.searchParams;
  const params = await props.params;

  const { id } = params;

  const event: IEvent & {
    organizer: {
      businessName?: string;
      firstName: string;
      lastName: string;
      _id: string;
    };
  } = await getEventById(id);
  const relatedEvents = await getRelatedEventsByCategory({
    categoryId: event.category?._id,
    eventId: event._id,
    page: resolvedSearchParams?.page as string,
  });

  return (
    <>
      <EventDetails event={event} />
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
}
