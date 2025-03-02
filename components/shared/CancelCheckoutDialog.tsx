'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@ui/alert-dialog';

interface CancelCheckoutDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export default function CancelCheckoutDialog({
  isOpen,
  onOpenChange,
  onConfirm,
}: CancelCheckoutDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-white">
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel Checkout?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to cancel your checkout? You will lose your
            selected tickets.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-md h-[40px] cursor-pointer bg-primary-600 text-white hover:bg-primary-500 hover:text-white">
            Continue Checkout
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="button bg-red-700 text-white hover:bg-red-600"
          >
            Cancel Checkout
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
