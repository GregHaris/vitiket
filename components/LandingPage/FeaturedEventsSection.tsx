"use client";

import {
  Calendar,
  MapPin,
  Heart,
  Share2,
  Bookmark,
  Ticket,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { currencySymbols } from "@/constants";
import { formatDateTime } from "@/lib/utils";
import { IEvent } from "@/lib/database/models/event.model";

type FeaturedEventsSectionProps = {
  data: IEvent[];
};

export function FeaturedEventsSection({ data }: FeaturedEventsSectionProps) {
  const getPriceDisplay = (event: IEvent) => {
    if (event.isFree) return "Free";

    const currency = (event.currency as keyof typeof currencySymbols) || "NGN";
    const currencySymbol = currencySymbols[currency] || "₦";

    if (event.priceCategories?.length === 1) {
      const price = Number(event.priceCategories[0].price);
      return `${currencySymbol}${price.toLocaleString("en-NG", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })}`;
    } else if (event.priceCategories && event.priceCategories.length > 1) {
      const lowestPrice = event.priceCategories.reduce((min, category) => {
        const price = Number(category.price);
        return price < min ? price : min;
      }, Infinity);
      return `From ${currencySymbol}${lowestPrice.toLocaleString("en-NG", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })}`;
    }

    return "Free";
  };

  return (
    <section className="py-20">
      <div className="container mx-auto px-4 lg:px-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-black">
              Trending this week
            </h2>
            <p className="text-xl text-gray-700">
              Don&rsquo;t miss these popular events
            </p>
          </div>
          <Button className="primary-btn">View all events</Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {data.map((event) => (
            <Link href={`/events/${event._id}`} key={event._id} passHref>
              <Card className="cursor-pointer h-145 transition-all duration-500 overflow-hidden bg-gray-800 hover:bg-gray-900 backdrop-blur-sm">
                <div className="relative overflow-hidden">
                  <Image
                    src={event.imageUrl}
                    alt={event.title}
                    width={400}
                    height={240}
                    className="w-full h-48 sm:h-56 object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                </div>

                <CardHeader className="pb-3">
                  <div className="flex justify-between gap-2">
                    {/* Badges */}
                    <Badge
                      variant="secondary"
                      // className="bg-black/50 border-0"
                      style={{ color: event.category?.color }}
                    >
                      {event.category?.name}
                    </Badge>

                    {/* Online/Offline indicator */}
                    <div
                      className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        event.locationType === "Virtual"
                          ? "bg-green-500/20 text-green-400 border border-green-500/30"
                          : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${
                          event.locationType === "Virtual"
                            ? "bg-green-400"
                            : event.locationType === "Physical"
                              ? "bg-blue-400"
                              : "bg-yellow-400"
                        }`}
                      ></div>
                      {event.locationType === "Virtual"
                        ? "Online"
                        : event.locationType === "Physical"
                          ? "In-person"
                          : event.locationType}
                    </div>
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-bold text-lg text-neutral-white line-clamp-2 group-hover:text-[#123f70] transition-colors duration-200">
                      {event.title}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-400">
                    by {event.organizer?.firstName} {event.organizer?.lastName}
                  </p>
                </CardHeader>

                <CardContent>
                  <div className="space-y-3 text-sm text-gray-300">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-[#123f70] flex-shrink-0" />
                      <div>
                        <div className="font-medium">
                          {formatDateTime(event.startDate).dateTime}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-[#123f70] flex-shrink-0" />
                      <span>
                        {event.locationType === "Virtual"
                          ? "Online Event"
                          : event.location?.split(", ||")[0]}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-neutral-white">
                        {getPriceDisplay(event)}
                      </div>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="border-t border-gray-700/50 py-4">
                  <div className="flex items-center justify-between w-full gap-3">
                    {/* Social actions */}
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-red-400 hover:bg-red-400/10 p-2 h-auto transition-all duration-200"
                        onClick={(e) => {
                          e.preventDefault();
                          console.log("Liked event:", event.title);
                        }}
                      >
                        <Heart className="w-4 h-4 mr-1" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 p-2 h-auto transition-all duration-200"
                        onClick={(e) => {
                          e.preventDefault();
                          console.log("Shared event:", event.title);
                        }}
                      >
                        <Share2 className="w-4 h-4 mr-1" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-yellow-400 hover:bg-yellow-400/10 p-2 h-auto transition-all duration-200"
                        onClick={(e) => {
                          e.preventDefault();
                          console.log("Saved event:", event.title);
                        }}
                      >
                        <Bookmark className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* CTA Button */}
                    <Button
                      className="bg-gradient-to-r from-[#123f70] to-[#1e5a96] hover:from-[#0f3460] hover:to-[#1a4f7a] text-neutral-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 flex-shrink-0 cursor-pointer"
                      onClick={(e) => {
                        e.preventDefault();
                        console.log("Get tickets for:", event.title);
                      }}
                    >
                      <Ticket className="w-4 h-4 mr-2" />
                      Get Tickets
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
