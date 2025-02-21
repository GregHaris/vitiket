import { useFormContext } from 'react-hook-form';
import { FiMail, FiPhone } from 'react-icons/fi';
import { RiLink } from 'react-icons/ri';
import Image from 'next/image';

import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

export default function ContactDetails() {
  const { control } = useFormContext();
  return (
    <div className="space-y-6 py-10">
      <h3 className="text-lg font-semibold">Contact Details</h3>
      <FormField
        control={control}
        name="contactDetails.phoneNumber"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <div className="flex-center h-[40px] w-full overflow-hidden rounded-md border-gray-300 border bg-grey-50 px-4 py-2">
                <FiPhone />
                <span className="text-red-400">*</span>
                <Input
                  placeholder="Your phone number"
                  {...field}
                  className="nested-input-field p-regular-14"
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="contactDetails.email"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <div className="flex-center h-[40px] w-full overflow-hidden rounded-md border-gray-300 border bg-grey-50 px-4 py-2">
                <FiMail />
                <span className="text-red-400">*</span>
                <Input
                  placeholder="Your email"
                  {...field}
                  className="nested-input-field p-regular-14"
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="contactDetails.website"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <div className="flex-center h-[40px] w-full overflow-hidden rounded-md border-gray-300 border bg-grey-50 px-4 py-2">
                <RiLink />
                <Input
                  placeholder="Your website (www.example.com)"
                  {...field}
                  className="nested-input-field p-regular-14"
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="contactDetails.instagram"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <div className="flex-center h-[40px] w-full overflow-hidden rounded-md border-gray-300 border bg-grey-50 px-4 py-2">
                <Image
                  src="/assets/icons/instagram.svg"
                  width={20}
                  height={20}
                  alt="calendar"
                />
                <Input
                  placeholder="Your Instagram handle"
                  {...field}
                  className="nested-input-field p-regular-14"
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="contactDetails.facebook"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <div className="flex-center h-[40px] w-full overflow-hidden rounded-md border-gray-300 border bg-grey-50 px-4 py-2">
                <Image
                  src="/assets/icons/facebook.svg"
                  width={20}
                  height={20}
                  alt="calendar"
                />
                <Input
                  placeholder="Your Facebook handle"
                  {...field}
                  className="nested-input-field p-regular-14"
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="contactDetails.x"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <div className="flex-center h-[40px] w-full overflow-hidden rounded-md border-gray-300 border bg-grey-50 px-4 py-2">
                <Image
                  src="/assets/icons/x.svg"
                  width={20}
                  height={20}
                  alt="calendar"
                />
                <Input
                  placeholder="Your X (Twitter) handle"
                  {...field}
                  className="nested-input-field p-regular-14"
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
