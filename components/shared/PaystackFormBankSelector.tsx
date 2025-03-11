'use client';

import { Check, X } from 'lucide-react';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { z } from 'zod';

import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandEmpty,
} from '@ui/command';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@ui/form';
import { Input } from '@ui/input';
import { paymentDetailsSchema } from '@/lib/validator';
import { PaystackFormBankSelectorProps } from '@/types';
import { Popover, PopoverContent, PopoverTrigger } from '@ui/popover';

export default function BankSelector({ banks }: PaystackFormBankSelectorProps) {
  const { control, setValue } =
    useFormContext<z.infer<typeof paymentDetailsSchema>>();
  const [open, setOpen] = useState(false);

  return (
    <FormField
      control={control}
      name="bankName"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Bank Name</FormLabel>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <FormControl>
                <div className="relative">
                  <Input
                    placeholder="Type to search banks..."
                    {...field}
                    onChange={(e) => field.onChange(e.target.value)}
                    className="select-field"
                  />
                  {field.value && (
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                      title="Remove Bank Details"
                      onClick={() => {
                        setValue('bankName', '');
                        setValue('accountNumber', '');
                        setValue('accountName', '');
                        setOpen(true);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="start">
              <Command>
                <CommandInput placeholder="Search banks..." />
                <CommandList>
                  <CommandEmpty>No banks found.</CommandEmpty>
                  {banks
                    .filter((bank) =>
                      bank.name
                        .toLowerCase()
                        .includes((field.value || '').toLowerCase())
                    )
                    .map((bank) => (
                      <CommandItem
                        key={`${bank.name}-${bank.code}`}
                        value={bank.name}
                        onSelect={() => {
                          setValue('bankName', bank.name);
                          setOpen(false);
                        }}
                        className="flex justify-between items-center"
                      >
                        {bank.name}
                        {field.value === bank.name && (
                          <Check className="h-4 w-4" />
                        )}
                      </CommandItem>
                    ))}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
