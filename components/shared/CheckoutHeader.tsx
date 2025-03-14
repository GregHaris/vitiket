'use client';

import { ArrowLeft, X } from 'lucide-react';
import { DialogHeader, DialogTitle } from '@ui/dialog';

export default function CheckoutHeader({
  onBack,
  onCancel,
}: {
  onBack: () => void;
  onCancel: () => void;
}) {
  return (
    <>
      <DialogHeader className="p-6 border-b flex flex-row items-center justify-between">
        <button
          className="cursor-pointer flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          onClick={onBack}
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Event
        </button>
        <button
          className="cursor-pointer text-gray-600 hover:bg-gray-100 p-2 rounded-full"
          title="Cancel checkout"
          onClick={onCancel}
        >
          <X className="w-5 h-5" />
        </button>
      </DialogHeader>
      <DialogTitle className="sr-only">Checkout Details</DialogTitle>
    </>
  );
}
