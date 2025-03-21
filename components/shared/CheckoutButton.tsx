"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

import { Button } from "@ui/button";
import { CheckoutButtonProps, CurrencyKey } from "@/types";
import { currencySymbols } from "@/constants";
import { Dialog, DialogContent, DialogDescription } from "@ui/dialog";
import { hasUserPurchasedEventByEmail } from "@/lib/actions/order.actions";
import { useCheckout } from "@shared/CheckoutContext";
import CheckoutDetails from "@shared/CheckoutDetails";

export default function CheckoutButton({
  event,
  hasPurchased,
}: CheckoutButtonProps & { hasPurchased?: boolean }) {
  const searchParams = useSearchParams();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { resetCheckout } = useCheckout();
  const [guestPurchased, setGuestPurchased] = useState(false);

  useEffect(() => {
    if (searchParams?.get("checkout") === "true") setIsDialogOpen(true);
  }, [searchParams]);

  useEffect(() => {
    const checkGuestPurchase = async () => {
      const email = localStorage.getItem("guestCheckoutEmail");
      if (email) {
        const purchased = await hasUserPurchasedEventByEmail(email, event._id);
        setGuestPurchased(purchased);
      }
    };
    checkGuestPurchase();
  }, [event._id]);

  let totalQuantity = 0;
  let ticketPrice = 0;
  const priceCategories: { name: string; price: string; quantity: number }[] =
    [];

  if (event.isFree) {
    const freeQuantity = Number(searchParams?.get("free")) || 0;
    totalQuantity = freeQuantity;
    ticketPrice = 0;
    if (freeQuantity > 0) {
      priceCategories.push({
        name: "Free",
        price: "0",
        quantity: freeQuantity,
      });
    }
  } else {
    event.priceCategories?.forEach((category, index) => {
      const categoryId = `category-${index}`;
      const quantity = Number(searchParams?.get(categoryId)) || 0;
      if (quantity > 0) {
        priceCategories.push({
          name: category.name,
          price: category.price,
          quantity,
        });
        totalQuantity += quantity;
        ticketPrice += quantity * Number(category.price);
      }
    });
  }

  const totalPrice = ticketPrice;

  useEffect(() => {
    if (searchParams?.get("checkout") === "true" && totalQuantity === 0) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("checkout");
      window.history.replaceState(
        {},
        "",
        `${window.location.pathname}?${params.toString()}`,
      );
    }
  }, [searchParams, totalQuantity]);

  const currencySymbol = currencySymbols[event.currency as CurrencyKey] || "₦";

  const handleCheckout = () => setIsDialogOpen(true);
  const handleCloseDialog = (reset: boolean = false) => {
    if (reset) {
      resetCheckout();
      const params = new URLSearchParams(searchParams?.toString());
      params.delete("checkout");
      if (event.isFree) {
        params.delete("free");
      } else {
        event.priceCategories?.forEach((_, index) => {
          params.delete(`category-${index}`);
        });
      }
      window.history.replaceState(
        {},
        "",
        `${window.location.pathname}?${params.toString()}`,
      );
    }
    setIsDialogOpen(false);
  };

  const isPurchased = hasPurchased || guestPurchased;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 w-full md:sticky md:top-4 z-50 p-3 bg-white rounded-md shadow-gray-300 shadow-lg transition-all duration-300">
        {totalQuantity === 0 ? (
          <Button
            className="button w-full md:w-[300px] cursor-pointer font-bold transition-all duration-100"
            size={"lg"}
            onClick={() =>
              document
                .getElementById("price-section")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Get Tickets
          </Button>
        ) : isPurchased ? (
          <div className="text-center p-2 bg-green-100 rounded-md w-full md:w-[300px]">
            <p className="text-green-700 font-semibold">
              You’ve already purchased this event!
            </p>
            {hasPurchased && (
              <Link
                href={`/dashboard`}
                className="text-blue-600 hover:underline"
              >
                View your tickets
              </Link>
            )}
          </div>
        ) : (
          <Button
            className="button w-full md:w-[300px] font-bold transition-all duration-300"
            size={"lg"}
            onClick={handleCheckout}
          >
            <span>Checkout</span>
            <span>
              {currencySymbol}
              {ticketPrice.toLocaleString()}{" "}
            </span>
          </Button>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent
          className="sm:max-w-[90%] md:max-w-[800px] lg:max-w-[1000px] w-full max-h-[90vh] overflow-y-auto border-none bg-white rounded-lg shadow-lg p-0"
          onInteractOutside={(e) => e.preventDefault()}
          aria-describedby="checkout-dialog-description"
        >
          <DialogDescription
            id="checkout-dialog-description"
            className="sr-only"
          >
            Checkout details and order summary
          </DialogDescription>
          <CheckoutDetails
            event={event}
            quantity={totalQuantity}
            totalPrice={totalPrice}
            selectedTickets={priceCategories}
            onCloseDialog={handleCloseDialog}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
