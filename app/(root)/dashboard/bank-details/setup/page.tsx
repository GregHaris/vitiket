"use server";

import { Bank } from "@/types";
import { connectToDatabase } from "@/lib/database";
import { PaymentDetailsValues } from "@/lib/validator";
import getUserId from "@/utils/userId";
import PaymentDetailsForm from "@shared/PaymentDetailsForm";
import User from "@/lib/database/models/user.model";

async function getUserPaymentDetails(
  clerkId: string,
): Promise<(PaymentDetailsValues & { subaccountCode: string }) | undefined> {
  try {
    await connectToDatabase();
    const user = await User.findOne({ clerkId });
    if (user) {
      return {
        businessName: user.businessName || `${user.firstName} ${user.lastName}`,
        bankName: user.bankName || "",
        accountName: user.bankDetails?.accountName || "",
        accountNumber: user.bankDetails?.accountNumber || "",
        subaccountCode: user.subaccountCode || "",
      };
    }
    return undefined;
  } catch (error) {
    console.error("Error fetching user payment details:", error);
    return undefined;
  }
}

async function fetchBanks(): Promise<Bank[]> {
  const res = await fetch("https://api.paystack.co/bank", {
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    },
    cache: "force-cache",
  });
  if (!res.ok) throw new Error("Failed to fetch banks");
  const data = await res.json();
  return data.data.filter((bank: Bank) => bank.active);
}

export default async function BankDetailsSetupPage() {
  const userId = await getUserId();

  if (!userId) {
    throw new Error("User not found");
  }

  const banks = await fetchBanks();
  const existingDetails = await getUserPaymentDetails(userId);

  return (
    <div className="container mx-auto py-8">
      <h2 className="text-2xl font-bold mb-6">
        {existingDetails ? "Update Bank Details" : "Add Bank Details"}
      </h2>
      <PaymentDetailsForm
        banks={banks}
        existingDetails={existingDetails}
        userId={userId}
      />
    </div>
  );
}
