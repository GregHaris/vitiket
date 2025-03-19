'use client';

import { useFormContext } from 'react-hook-form';

import { Button } from '@ui/button';
import { checkoutFormValues } from '@/lib/validator';
import { checkoutOrder } from '@/lib/actions/order.actions';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@ui/form';
import { PaymentMethodSelectorProps } from '@/types';

export default function PaymentMethodSelector({
  isNigerianEvent,
  orderData,
}: PaymentMethodSelectorProps) {
  const { control, setValue } = useFormContext<checkoutFormValues>();

  const handlePaystackCheckout = async () => {
    const orderWithPaystack = {
      ...orderData,
      paymentMethod: 'paystack' as const,
    };
    await checkoutOrder(orderWithPaystack);
  };

  const handleStripeMethod = async (method: 'googlePay' | 'applePay') => {
    const order = { ...orderData, paymentMethod: method };
    await checkoutOrder(order);
  };

  return (
    <FormField
      control={control}
      name="paymentMethod"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-sm font-bold">
            Payment Methods<span className="text-red-400">*</span>
          </FormLabel>
          <FormControl>
            <div className="flex flex-col space-y-2">
              {isNigerianEvent ? (
                <Button
                  type="button"
                  variant="default"
                  onClick={handlePaystackCheckout}
                  className="w-full rounded-md h-[40px] cursor-pointer sm:w-auto"
                >
                  Pay with Paystack
                </Button>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant={field.value === 'card' ? 'default' : 'outline'}
                    onClick={() => setValue('paymentMethod', 'card')}
                    className="rounded-md h-[40px] cursor-pointer w-full sm:w-auto"
                  >
                    Card
                  </Button>
                  <Button
                    type="button"
                    variant={
                      field.value === 'googlePay' ? 'default' : 'outline'
                    }
                    onClick={() => handleStripeMethod('googlePay')}
                    className="w-full rounded-md h-[40px] cursor-pointer sm:w-auto"
                    disabled={true}
                  >
                    Google Pay
                  </Button>
                  <Button
                    type="button"
                    variant={field.value === 'applePay' ? 'default' : 'outline'}
                    onClick={() => handleStripeMethod('applePay')}
                      className="w-full rounded-md h-[40px] cursor-pointer sm:w-auto"
                      disabled = {true}
                  >
                    Apple Pay
                  </Button>
                </div>
              )}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
