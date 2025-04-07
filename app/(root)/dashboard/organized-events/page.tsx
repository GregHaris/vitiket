"use server";

import { Button } from "@ui/button";
import Link from "next/link";
import { getEventsByUser } from "@/lib/actions/event.actions";
import { SearchParamProps } from "@/types";
import getUserId from "@/utils/userId";
import Collection from "@shared/Collection";

export default async function OrganizedEventsPage({
  searchParams,
}: SearchParamProps) {
  const resolvedSearchParams = await searchParams;
  const userId = await getUserId();
  const page = Number(resolvedSearchParams?.eventsPage) || 1;

  const organizedEvents = await getEventsByUser({ userId, page });

  return (
    <>
      <section className="bg-primary-50 py-5 md:py-10">
        <div className="wrapper flex items-center justify-between">
          <h3 className="h3-bold">Events Organized</h3>
          <Button asChild size="lg" className="button hidden sm:flex">
            <Link href="/create">Create New Event</Link>
          </Button>
        </div>
      </section>

      <section className="wrapper my-8">
        <Collection
          data={organizedEvents?.data}
          emptyTitle="No events have been created yet"
          emptyStateSubtext="Go create some now"
          collectionType="Events_Organized"
          limit={3}
          page={page}
          urlParamName="eventsPage"
          totalPages={organizedEvents?.totalPages}
        />
      </section>
    </>
  );
}
