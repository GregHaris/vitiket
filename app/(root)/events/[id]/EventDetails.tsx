"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

import { Button } from "@ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@ui/dialog";
import { CurrencyKey, EventDetailsClientProps } from "@/types";
import { currencySymbols } from "@/constants";
import { CheckoutProvider } from "@shared/CheckoutContext";
import { formatDateTime } from "@/lib/utils";
import { IOrder } from "@/lib/database/models/order.model";
import CheckoutButton from "@shared/CheckoutButton";
import ContactHost from "@shared/ContactHost";
import EventMapWrapper from "@shared/EventMapWrapper";
import PriceCards from "@shared/PriceCards";
import SafeHTMLRenderer from "@shared/SafeHTMLRenderer";
import TicketCard from "@shared/TicketCard";

async function fetchOrder(orderId: string): Promise<IOrder | null> {
  try {
    const response = await fetch(`/api/orders/${orderId}`);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error("Error fetching order:", error);
    return null;
  }
}

export default function EventDetails({
  event,
  hasPurchased,
  userId,
}: EventDetailsClientProps & { hasPurchased: boolean; userId: string | null }) {
  const searchParams = useSearchParams();
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [order, setOrder] = useState<IOrder | null>(null);

  useEffect(() => {
    const successOrderId = searchParams.get("success");
    if (successOrderId) {
      fetchOrder(successOrderId).then((fetchedOrder) => {
        if (fetchedOrder) {
          setOrder(fetchedOrder);
          setIsSuccessOpen(true);
        }
      });
    }
  }, [searchParams]);

  const isSameDate =
    formatDateTime(event.startDate).dateOnly ===
    formatDateTime(event.endDate).dateOnly;

  const currencySymbol = currencySymbols[event.currency as CurrencyKey] || "";
  const eventLocation = event.location?.split(", ||")[0] || "";
  const hostName =
    event.organizer?.businessName ||
    (event.organizer?.firstName && event.organizer?.lastName
      ? `${event.organizer.firstName} ${event.organizer.lastName}`
      : "Unknown Host");

  const handleBackToEvent = () => {
    setIsSuccessOpen(false);
  };

  return (
    <CheckoutProvider>
      <section className="wrapper pb-20 md:pb-0">
        <div className="2xl:max-w-7xl space-y-6 w-full">
          <div className="w-full">
            <Image
              src={event.imageUrl}
              alt="hero image"
              width={1000}
              height={1000}
              className="min-h-[300px] md:h-[600px] w-full object-cover object-center rounded-2xl"
            />
          </div>
          <div className="flex w-full flex-col gap-8 p-5 md:p-10">
            <div className="flex flex-col gap-2 space-y-6">
              <div className="flex justify-between gap-3">
                <div className="flex flex-col gap-5">
                  <h2 className="text-4xl font-bold">{event.title}</h2>

                  <div className="flex flex-col md:flex-row gap-5 flex-wrap">
                    <p
                      className="text-sm font-bold rounded-full bg-gray-100 px-4 py-2.5 w-fit"
                      style={{ color: event.type?.color }}
                    >
                      {event.type?.name}
                    </p>
                    <p
                      className="text-sm font-bold rounded-full bg-gray-100 px-4 py-2.5 w-fit"
                      style={{ color: event.category?.color }}
                    >
                      {event.category?.name}
                    </p>
                  </div>

                  <p className="p-regular-16 lg:p-regular-18">
                    {event.subtitle}
                  </p>

                  {hasPurchased && userId && (
                    <div className="bg-green-100 p-4 rounded-lg">
                      <p className="text-green-700 font-semibold">
                        You&apos;ve already purchased this event!{" "}
                        <Link
                          href={`/dashboard`}
                          className="text-blue-600 hover:underline"
                        >
                          View your tickets
                        </Link>
                      </p>
                    </div>
                  )}

                  <p className="p-medium-18 ml-2 mt-2 sm:mt-0">
                    <span className="font-bold">Host:</span>{" "}
                    <span>{hostName}</span>
                  </p>
                  <div className="flex gap-2 md:gap-3 items-center">
                    <Image
                      src="/assets/icons/calendar.svg"
                      alt="calendar"
                      width={32}
                      height={32}
                    />
                    <div className="p-medium-16 lg:p-regular-20 items-center">
                      {isSameDate ? (
                        <p>{formatDateTime(event.startDate).dateOnly}</p>
                      ) : (
                        <p>
                          {formatDateTime(event.startDate).dateOnly} -{" "}
                          {formatDateTime(event.endDate).dateOnly}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 md:gap-3 items-center">
                    <Image
                      src="/assets/icons/clock.svg"
                      alt="calendar"
                      width={32}
                      height={32}
                    />
                    <div className="p-medium-16 lg:p-regular-20 items-center">
                      <p>
                        {formatDateTime(event.startTime).timeOnly} -{" "}
                        {formatDateTime(event.endTime).timeOnly}
                      </p>
                    </div>
                  </div>

                  <div className="p-regular-20 flex item-center gap-3">
                    <Image
                      src="/assets/icons/location.svg"
                      alt="location"
                      width={32}
                      height={32}
                    />
                    <p className="p-medium-16 lg:p-regular-20">
                      {eventLocation}
                    </p>
                  </div>

                  <div className="flex flex-col gap-3">
                    <h3 className="text-2xl font-bold">About this Event</h3>
                    <SafeHTMLRenderer html={event.description} />
                  </div>

                  <div id="price-section" className="flex flex-col gap-3">
                    <h3 className="text-2xl font-bold">Tickets</h3>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <PriceCards
                        event={event}
                        currencySymbol={currencySymbol}
                      />
                    </div>
                  </div>

                  {(event.locationType === "Physical" ||
                    event.locationType === "Hybrid") &&
                    event.coordinates && (
                      <div className="flex flex-col gap-3">
                        <h3 className="text-2xl font-bold">Direction</h3>
                        <div className="w-full h-[400px]">
                          <EventMapWrapper
                            coordinates={event.coordinates}
                            destinationInfo={event.location}
                          />
                        </div>
                      </div>
                    )}

                  <div className="mt-5">
                    {event.contactDetails && (
                      <ContactHost contactDetails={event.contactDetails} />
                    )}
                  </div>
                </div>

                <div>
                  <CheckoutButton event={event} hasPurchased={hasPurchased} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Dialog open={isSuccessOpen} onOpenChange={setIsSuccessOpen}>
        <DialogTitle className="sr-only">
          {" "}
          Successful checkout confirmation{" "}
        </DialogTitle>
        <DialogContent
          className="sm:max-w-[90%] md:max-w-[800px] lg:max-w-[1000px] w-full max-h-[90vh] overflow-y-auto border-none bg-white rounded-lg shadow-lg p-0"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogDescription className="sr-only">
            Purchase confirmation details
          </DialogDescription>
          {order ? (
            <div className="flex flex-col m-5 items-center ">
              <div className="space-y-6 ">
                <div className="flex flex-col items-center space-y-6">
                  <h2 className="text-2xl font-bold text-green-600">
                    Purchase Successful!
                  </h2>
                  <p className="text-gray-600">
                    Your ticket has been sent to your email. Here&apos;s your
                    order summary:
                  </p>
                  <TicketCard order={order} />
                </div>
                <div className="flex gap-4 flex-nowrap justify-center">
                  <Link
                    href="/"
                    className="w-full h-[40px] bg-primary-500 p-regular-14 text-white py-2 rounded-md hover:bg-primary-600 transition text-center"
                  >
                    Continue Browsing
                  </Link>
                  <Button
                    onClick={handleBackToEvent}
                    className="w-full h-[40px] bg-gray-300 text-gray-800 py-2 rounded-md cursor-pointer hover:bg-gray-300 transition p-regular-14 focus-visible:ring-transparent focus-visible:ring-offset-0"
                  >
                    Back to Event
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <p>Loading order...</p>
          )}
        </DialogContent>
      </Dialog>
    </CheckoutProvider>
  );
}
