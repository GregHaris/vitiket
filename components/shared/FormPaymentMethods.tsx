'use client';

import { useState } from 'react';
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
import { Input } from '@ui/input';
import { PaymentMethodSelectorProps } from '@/types';

export default function PaymentMethodSelector({
  isNigerianEvent,
  orderData,
}: PaymentMethodSelectorProps) {
  const { control, setValue, getValues } = useFormContext<checkoutFormValues>();
  const [showCardForm, setShowCardForm] = useState(false);

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
                    onClick={() => {
                      setValue('paymentMethod', 'card');
                      setShowCardForm(true);
                    }}
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
                  >
                    Google Pay
                  </Button>
                  <Button
                    type="button"
                    variant={field.value === 'applePay' ? 'default' : 'outline'}
                    onClick={() => handleStripeMethod('applePay')}
                    className="w-full rounded-md h-[40px] cursor-pointer sm:w-auto"
                  >
                    Apple Pay
                  </Button>
                </div>
              )}

              {!isNigerianEvent && showCardForm && field.value === 'card' && (
                <div className="mt-4 space-y-4">
                  <FormItem>
                    <FormLabel>Card Number</FormLabel>
                    <FormControl>
                      <Input
                        className="input-field p-regular-14"
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        onChange={(e) => {
                          const value = e.target.value
                            .replace(/\D/g, '')
                            .replace(/(.{4})/g, '$1 ')
                            .trim();
                          e.target.value = value;
                          setValue('cardNumber', value);
                        }}
                        required
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                  <div className="flex space-x-4">
                    <FormItem className="w-1/2">
                      <FormLabel>Expiry Date</FormLabel>
                      <FormControl>
                        <Input
                          className="input-field p-regular-14"
                          placeholder="MM/YY"
                          maxLength={5}
                          onChange={(e) => {
                            let value = e.target.value.replace(/\D/g, '');
                            if (value.length > 2)
                              value = `${value.slice(0, 2)}/${value.slice(2)}`;
                            e.target.value = value;
                            setValue('expiryDate', value);
                          }}
                          required
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                    <FormItem className="w-1/2">
                      <FormLabel>CVV</FormLabel>
                      <FormControl>
                        <Input
                          className="input-field p-regular-14"
                          placeholder="123"
                          maxLength={3}
                          onChange={(e) => {
                            e.target.value = e.target.value.replace(/\D/g, '');
                            setValue('cvv', e.target.value);
                          }}
                          required
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  </div>
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
