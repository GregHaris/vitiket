import { getAllEvents } from '@/lib/actions/event.actions';
import { SearchParamProps } from '@/types';
import Collection from '@shared/Collection';
import CategoryFilter from '@shared/CategoryFilter';

export default async function Events({ searchParams }: SearchParamProps) {
  const resolvedSearchParams = await searchParams;

  const page = Number(resolvedSearchParams.page) || 1;
  const searchText = (resolvedSearchParams.query as string) || '';
  const category = (resolvedSearchParams.category as string) || '';
  const location = (resolvedSearchParams.location as string) || '';
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
    <section id="events" className="wrapper my-2 flex flex-col gap-8 md:gap-12">
      <CategoryFilter />
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
  );
}
