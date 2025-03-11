'use client';

import { Button } from '@ui/button';
import { PaymentDetailsFormActionsProps } from '@/types';

export default function FormActions({
  message,
  existingDetails,
  isNigerianEvent,
  onReuse,
  isSubmitting,
}: PaymentDetailsFormActionsProps) {
  return (
    <>
      {isNigerianEvent && (
        <div className="flex gap-4">
          <Button type="submit" disabled={isSubmitting} className="button">
            {isSubmitting
              ? 'Submitting...'
              : existingDetails?.subaccountCode
              ? 'Update Details'
              : 'Save Details'}
          </Button>
          {existingDetails?.subaccountCode && (
            <Button
              variant="outline"
              className="button"
              onClick={() => onReuse(existingDetails.subaccountCode!)}
            >
              Reuse Existing Details
            </Button>
          )}
        </div>
      )}
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </>
  );
}
