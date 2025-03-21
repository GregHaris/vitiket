import { Suspense } from "react";
import VerifyTicket from "./VerifyTicket";

export default function VerifyTicketWrapper() {
  return (
    <Suspense
      fallback={
        <div className="flex-center min-h-screen w-full flex-col gap-3 bg-gray-50">
          <p className="text-lg font-semibold">Verifying Ticket...</p>
        </div>
      }
    >
      <VerifyTicket />
    </Suspense>
  );
}
