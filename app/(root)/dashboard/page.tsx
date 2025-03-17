import Link from 'next/link';

import { Button } from '@ui/button';
import { getEventsByUser } from '@/lib/actions/event.actions';
import { getOrdersByUser } from '@/lib/actions/order.actions';
import { IOrder } from '@/lib/database/models/order.model';
import { SearchParamProps } from '@/types';
import getUserId from '@/utils/userId';
import TicketCard from '@shared/TicketCard';
import Collection from '@shared/Collection';
import Pagination from '@shared/Pagination';

const Dashboard = async ({ searchParams }: SearchParamProps) => {
  const resolvedSearchParams = await searchParams;
  const userId = await getUserId();

  const ordersPage = Number(resolvedSearchParams?.ordersPage) || 1;
  const eventsPage = Number(resolvedSearchParams?.eventsPage) || 1;

  const orders = await getOrdersByUser({ userId, page: ordersPage });

  const organizedEvents = await getEventsByUser({ userId, page: eventsPage });

  return (
    <>
      <section className="bg-primary-50 bg-dotted-pattern bg-cover bg-center py-5 md:py-10">
        <div className="wrapper flex items-center justify-center sm:justify-between">
          <h3 className="h3-bold text-center sm:text-left">My Tickets</h3>
          <Button asChild size="lg" className="button hidden sm:flex">
            <Link href={'/#events'}>Explore More Events</Link>
          </Button>
        </div>
      </section>

      <section className="wrapper my-8">
        {orders && orders.data.length > 0 ? (
          <div className="flex flex-col items-center gap-10">
            <ul className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:gap-10">
              {orders.data.map((order: IOrder) => (
                <li key={order._id} className="flex justify-center">
                  <TicketCard order={order} />
                </li>
              ))}
            </ul>
            {orders.totalPages && orders.totalPages > 1 && (
              <Pagination
                urlParamName="ordersPage"
                page={ordersPage}
                totalPages={orders.totalPages}
              />
            )}
          </div>
        ) : (
          <div className="flex-center wrapper min-h-[200px] w-full flex-col gap-3 rounded-[14px] bg-grey-50 py-28 text-center">
            <h3 className="p-bold-20 md:h5-bold">No event tickets purchased</h3>
            <p className="p-regular-14">
              Check the events page to find amazing events to explore
            </p>
          </div>
        )}
      </section>

      <section className="bg-primary-50 bg-dotted-pattern bg-cover bg-center py-5 md:py-10">
        <div className="wrapper flex items-center justify-center sm:justify-between">
          <h3 className="h3-bold text-center sm:text-left">Events Organized</h3>
          <Button asChild size="lg" className="button hidden sm:flex">
            <Link href={'/create'}>Create New Event</Link>
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
          page={eventsPage}
          urlParamName="eventsPage"
          totalPages={organizedEvents?.totalPages}
        />
      </section>
    </>
  );
};

export default Dashboard;
