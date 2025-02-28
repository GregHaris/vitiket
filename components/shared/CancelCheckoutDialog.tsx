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
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel Checkout?</AlertDialogTitle>
          <AlertDialogDescription className='bg-white'>
            Are you sure you want to cancel your checkout? You will lose your
            selected tickets.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className='button bg-primary text-white'>Continue Checkout</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className='button bg-red-500 text-white'>
            Cancel Checkout
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
