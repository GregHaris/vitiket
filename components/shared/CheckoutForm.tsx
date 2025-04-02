"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import Link from "next/link";

import { Button } from "@ui/button";
import {
  CheckoutDetailsProps,
  CheckoutOrderParams,
  CheckoutOrderResponse,
} from "@/types";
import { checkoutFormValues } from "@/lib/validator";
import { checkoutOrder, createOrder } from "@/lib/actions/order.actions";
import { Form } from "@ui/form";
import { sendTicketEmail } from "@/utils/email";
import UserInfoInput from "./FormUserInfoInput";

export default function CheckoutForm({
  event,
  quantity,
  totalPrice,
  userId,
  onCloseDialog,
  form,
  onSignOut,
  priceCategories,
}: {
  event: CheckoutDetailsProps["event"];
  quantity: number;
  totalPrice: number;
  userId: string | null;
  onCloseDialog: (reset?: boolean) => void;
  form: ReturnType<typeof useForm<checkoutFormValues>>;
  onSignOut: () => Promise<void>;
  priceCategories?: { name: string; price: string; quantity: number }[];
}) {
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSignOut = async () => {
    await onSignOut();
  };

  const onSubmit = async (data: checkoutFormValues) => {
    try {
      const orderParams: CheckoutOrderParams = {
        eventTitle: event.title,
        buyerId: userId || "guest",
        eventId: event._id,
        price: totalPrice.toString(),
        isFree: event.isFree || false,
        currency: event.currency,
        quantity: quantity,
        priceCategories: priceCategories || [],
        buyerEmail: data.email,
        paymentMethod: event.isFree ? "none" : "paystack",
        firstName: data.firstName,
        lastName: data.lastName,
      };

      if (event.isFree) {
        const reference = `free_${Date.now()}_${event._id}`;

        const newOrder = await createOrder({
          eventId: event._id,
          buyerId: userId || "guest",
          totalAmount: "0",
          currency: "NGN",
          quantity: quantity,
          priceCategories: priceCategories || [
            { name: "Free", price: "0", quantity: quantity },
          ],
          buyerEmail: data.email,
          paymentMethod: "none",
          firstName: data.firstName,
          lastName: data.lastName,
          reference,
        });

        if (!userId) {
          localStorage.setItem("guestCheckoutEmail", data.email);
        }

        await sendTicketEmail({
          email: data.email,
          eventTitle: event.title,
          eventSubtitle: event.subtitle || "",
          eventImage: event.imageUrl || "",
          orderId: newOrder._id.toString(),
          totalAmount: "0",
          currency: "NGN",
          quantity: quantity,
          firstName: data.firstName,
          priceCategories: priceCategories || [
            { name: "Free", price: "0", quantity: quantity },
          ],
        });

        setIsSuccess(true);
        setTimeout(() => {
          onCloseDialog(false);
          window.location.href = `/events/${event._id}?success=${newOrder._id}`;
        }, 2000);
      } else {
        const result = (await checkoutOrder(
          orderParams,
        )) as CheckoutOrderResponse;

        if ("url" in result && result.url) {
          window.location.href = result.url;
        } else {
          throw new Error("Unexpected response from payment provider");
        }
      }
    } catch (error: unknown) {
      console.error("Checkout failed:", error);
      if (error instanceof Error) {
        if (
          error.message ===
          "You have already purchased a ticket for this event."
        ) {
          setError(error.message);
        } else if (error.message.includes("E11000")) {
          setError(
            "Duplicate order error. Please try again or contact support.",
          );
        } else {
          setError("Checkout failed. Please try again.");
        }
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      {isSuccess ? (
        <div className="flex flex-col items-center justify-center space-y-4 success-container">
          <span className="text-6xl text-green-500 success-check">✅</span>
          <p className="text-lg font-semibold text-green-600">
            Checkout Successful!
          </p>
          <p className="text-sm text-gray-600">Redirecting you shortly...</p>
        </div>
      ) : (
        <>
          {userId ? (
            <div className="mb-6 text-sm text-gray-600 space-y-6">
              <p>
                Logged in as <strong>{form.getValues("email")}</strong>.{" "}
                <button
                  onClick={handleSignOut}
                  className="cursor-pointer text-blue-600 hover:underline"
                >
                  Not you?
                </button>
              </p>
              <p>If you, please confirm details.</p>
            </div>
          ) : (
            <div className="mb-6 text-sm text-gray-600">
              <p>
                <Link
                  href={`/sign-in?redirect_url=${encodeURIComponent(
                    window.location.href + "&checkout=true",
                  )}`}
                  className="cursor-pointer text-blue-600 hover:underline"
                >
                  Sign in
                </Link>{" "}
                for a faster checkout experience.
              </p>
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <UserInfoInput
                name="firstName"
                label="First name"
                placeholder="Enter your first name"
                required
              />
              <UserInfoInput
                name="lastName"
                label="Last name"
                placeholder="Enter your last name"
                required
              />
              <UserInfoInput
                name="email"
                label="Email"
                placeholder="Enter your email"
                required
              />
              {!userId && (
                <UserInfoInput
                  name="confirmEmail"
                  label="Confirm email"
                  placeholder="Confirm your email"
                  required
                />
              )}
              <Button
                type="submit"
                className="w-full button"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Processing..." : "Checkout"}
              </Button>
            </form>
          </Form>
          {error && <p className="text-red-500 mt-4">{error}</p>}
        </>
      )}
    </div>
  );
}
