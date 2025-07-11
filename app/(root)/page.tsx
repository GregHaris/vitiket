import { SearchParamProps } from "@/types";
import Collection from "@shared/Collection";
import EventTypeIcons from "@shared/EventTypeFilter";

import { getAllEvents } from "@/lib/actions/event.actions";
import { HeroSection } from "@shared/HeroSection";

import SearchByName from "@shared/SearchByName";
import SearchByLocation from "@shared/SearchByLocation";
import SmoothScroll from "@/utils/smoothScroll";

export default async function Home({ searchParams }: SearchParamProps) {
  const resolvedSearchParams = await searchParams;

  const page = Number(resolvedSearchParams.page) || 1;
  const searchText = (resolvedSearchParams.query as string) || "";
  const category = (resolvedSearchParams.category as string) || "";
  const location = (resolvedSearchParams.location as string) || "";
  const limit = resolvedSearchParams.limit
    ? Number(resolvedSearchParams.limit)
    : 6;

  const events = await getAllEvents({
    query: searchText,
    category,
    page,
    location,
    limit: limit,
  });

  return (
    <>
      <SmoothScroll>
        <section>
          <div className=" md:flex flex-col justify-center gap-8 md:text-center ">
            <h1 className="h1-bold mb-10 px-5">
              Host, Connect, Celebrate: Your Event, Our Platform!
            </h1>
            <HeroSection />
          </div>
        </section>
        <div className="wrapper w-full">
          <div className="flex items-center bg-[#F8F7FA] rounded-md border-gray-300 border shadow-sm w-full">
            <SearchByName />
            <SearchByLocation />
          </div>
        </div>

        <section
          id="events"
          className="wrapper my-8 flex flex-col gap-8 md:gap-12"
        >
          <EventTypeIcons />
          <Collection
            data={events?.data}
            emptyTitle="No Events Found"
            emptyStateSubtext="Check back later"
            collectionType="All_Events"
            limit={limit}
            page={page}
            totalPages={events?.totalPages}
          />
        </section>
      </SmoothScroll>
    </>
  );
}
