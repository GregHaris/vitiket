import { formatDateTime, formatPrice } from "@/lib/utils";
import { getOrdersByEvent } from "@/lib/actions/order.actions";
import { NameSearch } from "@shared/SearchByName";
import { IOrderItem } from "@/lib/database/models/order.model";
import { SearchParamProps } from "@/types";
import ExportButtons from "@shared/ExportButtons";

const Orders = async ({ searchParams }: SearchParamProps) => {
  const resolvedSearchParams = await searchParams;
  const eventId = (resolvedSearchParams.eventId as string) || "";
  const searchText = (resolvedSearchParams.query as string) || "";

  const orders = await getOrdersByEvent({ eventId, searchString: searchText });

  return (
    <>
      <section className="bg-gradient-to-r from-gray-300 to-gray-400 text-white py-8 md:py-12">
        <h1 className="wrapper text-6xl font-bold text-center tracking-tight">
          Orders
        </h1>
      </section>

      <section className="wrapper">
        <h2 className="wrapper text-black text-3xl font-semibold tracking-tight">
          {orders[0].eventTitle}
        </h2>
        <NameSearch placeholder="Search by buyer name..." />
      </section>

      <section className="wrapper overflow-x-auto">
        <div className="text-right sticky top-0 bg-white z-10">
          <ExportButtons orders={orders} />
        </div>
        <table className="w-full border-collapse border-r border-l border bg-white">
          <thead>
            <tr className="bg-gray-700 text-white text-sm uppercase tracking-wider">
              <th className="py-4 pl-6 text-left">Order ID</th>
              <th className="py-4 pl-6 text-left">Buyer</th>
              <th className="py-4 pl-6 text-left">Buyer Email</th>
              <th className="py-4 pl-6 text-left">Created</th>
              <th className="py-4 pr-6 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {orders && orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-gray-500">
                  No orders found.
                </td>
              </tr>
            ) : (
              orders.map((row: IOrderItem) => (
                <tr
                  key={row._id}
                  className="border-b hover:bg-gray-50 transition-colors"
                >
                  <td className="py-4 pl-6 text-primary font-medium">
                    {row._id}
                  </td>
                  <td className="py-4 pl-6">{row.buyer}</td>
                  <td className="py-4 pl-6 break-words">{row.buyerEmail}</td>
                  <td className="py-4 pl-6">
                    {formatDateTime(row.createdAt).dateTime}
                  </td>
                  <td className="py-4 pr-6 text-right font-medium">
                    {formatPrice(row.totalAmount)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </>
  );
};

export default Orders;
