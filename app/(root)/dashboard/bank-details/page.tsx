"use server";

import { Button } from "@ui/button";
import { getUserById } from "@/lib/actions/user.actions";
import getUserId from "@/utils/userId";

export default async function BankDetailsPage() {
  const userId = await getUserId();
  const user = await getUserById(userId);

  const hasBankDetails = user?.bankDetails?.accountNumber && user?.bankName;

  return (
    <>
      <section className="bg-primary-50 py-5 md:py-10">
        <h3 className="h3-bold wrapper">Bank Details</h3>
      </section>

      <section className="wrapper my-8">
        {hasBankDetails ? (
          <div className="flex flex-col gap-5">
            <div className="bg-white p-5 rounded-lg shadow-md">
              <p>
                <strong>Business Name:</strong> {user.businessName || "N/A"}
              </p>
              <p>
                <strong>Bank Name:</strong> {user.bankName}
              </p>
              <p>
                <strong>Account Number:</strong>{" "}
                {user.bankDetails.accountNumber}
              </p>
              <p>
                <strong>Account Name:</strong>{" "}
                {user.bankDetails.accountName || "N/A"}
              </p>
              <p>
                <strong>Subaccount Code:</strong> {user.subaccountCode || "N/A"}
              </p>
            </div>
            <Button asChild size="lg" className="button self-start">
              <a href="/dashboard/bank-details/setup">Update Bank Details</a>
            </Button>
          </div>
        ) : (
          <div className="flex-center wrapper min-h-[200px] w-full flex-col gap-5 rounded-[14px] bg-grey-50 py-28 text-center">
            <h3 className="p-bold-20 md:h5-bold">No bank details added</h3>
            <p className="p-regular-14">
              Add bank details to start receiving payment for organized events
            </p>
            <Button asChild size="lg" className="button">
              <a href="/dashboard/bank-details/setup">Add Bank Details</a>
            </Button>
          </div>
        )}
      </section>
    </>
  );
}
