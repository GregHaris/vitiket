"use server";

import { Button } from "@ui/button";
import Link from "next/link";
import { getOrdersByUser } from "@/lib/actions/order.actions";
import { SearchParamProps } from "@/types";
import getUserId from "@/utils/userId";
import TicketCard from "@shared/TicketCard";
import Pagination from "@shared/Pagination";
import { IOrder } from "@/lib/database/models/order.model";

export default async function TicketsPage({ searchParams }: SearchParamProps) {
  const resolvedSearchParams = await searchParams;
  const userId = await getUserId();
  const page = Number(resolvedSearchParams?.ordersPage) || 1;

  const orders = await getOrdersByUser({ userId, page });

  return (
    <>
      <section className="bg-primary-50 py-5 md:py-10">
        <div className="wrapper flex items-center justify-between">
          <h3 className="h3-bold">My Tickets</h3>
          <Button asChild size="lg" className="button hidden sm:flex">
            <Link href="/#events">Explore More Events</Link>
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
                page={page}
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
    </>
  );
}
