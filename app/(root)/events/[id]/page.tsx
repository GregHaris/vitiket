import {
  getEventById,
  getRelatedEventsByCategory,
} from "@/lib/actions/event.actions";
import { hasUserPurchasedEvent } from "@/lib/actions/order.actions";
import { SearchParamProps } from "@/types";
import Collection from "@shared/Collection";
import EventDetails from "../../create/_components/EventDetails";
import getUserId from "@/utils/userId";

export default async function EventDetailsPage(props: SearchParamProps) {
  const resolvedSearchParams = await props.searchParams;
  const params = await props.params;
  const userId = await getUserId();

  const { id } = params;
  const event = await getEventById(id);

  // Check if user has purchased the event using userId directly
  const hasPurchased = userId
    ? ((await hasUserPurchasedEvent(userId, id)) ?? false)
    : false;

  const relatedEvents = await getRelatedEventsByCategory({
    categoryId: event.category?._id,
    eventId: event._id,
    page: resolvedSearchParams?.page as string,
  });

  return (
    <>
      <EventDetails event={event} hasPurchased={hasPurchased} userId={userId} />
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
