"use client";

import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { z } from "zod";

import { Button } from "@ui/button";
import { paymentDetailsSchema } from "@/lib/validator";
import { PaystackFormProps } from "@/types";
import AccountNameDisplay from "./PaystackFormAccountNameDisplay";
import AccountNumberInput from "./PaystackFormAccountNumberInput";
import BankSelector from "./PaystackFormBankSelector";
import BusinessNameInput from "./PaystackFormBusinessNameInput";

export default function PaystackForm({
  banks,
  userId,
  handleSubmit,
  existingDetails,
  onSubmitSuccess,
  submitButtonText = "Submit",
}: PaystackFormProps & { submitButtonText?: string }) {
  const { watch, setValue, setError, clearErrors, formState } =
    useFormContext<z.infer<typeof paymentDetailsSchema>>();
  const [resolvedAccountName, setResolvedAccountName] = useState<string | null>(
    null,
  );
  const [message, setMessage] = useState<string>("");

  const accountNumber = watch("accountNumber");
  const bankName = watch("bankName");

  // Watch all form fields to compare with existingDetails
  const formValues = watch();

  // Check if form values match existingDetails
  const hasChanges =
    !existingDetails?.subaccountCode ||
    formValues.businessName !== (existingDetails?.businessName || "") ||
    formValues.bankName !== (existingDetails?.bankName || "") ||
    formValues.accountNumber !== (existingDetails?.accountNumber || "") ||
    formValues.accountName !== (existingDetails?.accountName || "");

  useEffect(() => {
    const resolveAccountName = async () => {
      if (accountNumber?.length === 10 && bankName) {
        try {
          const bank = banks.find((b) => b.name === bankName);
          if (!bank) {
            setError("bankName", { message: "Invalid bank selected" });
            return;
          }

          const res = await fetch(
            `/api/paystack/verify-account?account_number=${accountNumber}&bank_code=${bank.code}`,
          );
          const data = await res.json();

          if (res.ok && data.accountName) {
            setResolvedAccountName(data.accountName);
            setValue("accountName", data.accountName);
            clearErrors("accountNumber");
          } else {
            setResolvedAccountName(null);
            setError("accountNumber", { message: "Invalid account details" });
          }
        } catch (error) {
          console.error("Error verifying account:", error);
          setResolvedAccountName(null);
          setError("accountNumber", { message: "Failed to verify account" });
        }
      } else {
        setResolvedAccountName(null);
        clearErrors("accountNumber");
      }
    };

    resolveAccountName();
  }, [accountNumber, bankName, banks, setValue, setError, clearErrors]);

  const onSubmit = async (data: z.infer<typeof paymentDetailsSchema>) => {
    try {
      const res = await fetch("/api/paystack/create-subaccount", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
        },
        body: JSON.stringify({
          businessName: data.businessName,
          bankName: data.bankName,
          accountNumber: data.accountNumber,
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        console.error("API error:", result);
        setMessage(result.message || "Failed to save/update payment details.");
        return;
      }

      setMessage(
        existingDetails?.subaccountCode
          ? "A new Paystack subaccount has been created with your updated details."
          : result.message || "Payment details saved successfully.",
      );
      await onSubmitSuccess();
    } catch (error) {
      console.error("Submission error:", error);
      setMessage("An error occurred. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {existingDetails?.subaccountCode && (
        <p className="text-sm text-muted-foreground">
          Note: Updating your payment details will create a new Paystack
          subaccount, replacing the existing one.
        </p>
      )}
      <BusinessNameInput />
      <BankSelector banks={banks} />
      <AccountNumberInput />
      <AccountNameDisplay resolvedAccountName={resolvedAccountName} />
      <div className="flex gap-4">
        <Button
          type="submit"
          disabled={
            formState.isSubmitting ||
            (!!existingDetails?.subaccountCode && !hasChanges)
          }
          className="button hover:bg-primary-600 bg-primary px-4 py-2"
        >
          {formState.isSubmitting ? "Submitting..." : submitButtonText}
        </Button>
        {existingDetails?.subaccountCode && (
          <Button
            variant="outline"
            className="rounded-md h-[40px] cursor-pointer hover:bg-gray-200 text-black bg-white border border-gray-300 px-4 py-2"
            onClick={() => onSubmitSuccess()}
            disabled={
              !existingDetails?.subaccountCode || formState.isSubmitting
            }
          >
            Reuse Existing Details
          </Button>
        )}
      </div>
      {message && !formState.errors && (
        <p className="text-sm text-muted-foreground">{message}</p>
      )}
    </form>
  );
}
