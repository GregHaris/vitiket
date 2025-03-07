import { useFormContext } from 'react-hook-form';
import { FiMail, FiPhone } from 'react-icons/fi';
import { RiLink } from 'react-icons/ri';
import Image from 'next/image';

import { eventFormValues } from '@/lib/validator';
import { FormControl, FormField, FormItem, FormMessage } from '@ui/form';
import { Input } from '@ui/input';

export default function ContactDetails() {
  const { control } = useFormContext<eventFormValues>();
  return (
    <div className="space-y-6 py-10">
      <h3 className="text-lg font-semibold">Contact Details</h3>
      <p className="italic text-gray-500 text-sm">
        Required <span className="text-red-400">*</span>
      </p>
      <FormField
        control={control}
        name="contactDetails.email"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <div className="flex-center h-[40px] w-full overflow-hidden rounded-md border-gray-300 border bg-grey-50 px-4 py-2">
                <FiMail className="text-white fill-primary w-5 h-5" />
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
      <p className="italic text-gray-500 text-sm">Optional</p>
      <FormField
        control={control}
        name="contactDetails.phoneNumber"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <div className="flex-center h-[40px] w-full overflow-hidden rounded-md border-gray-300 border bg-grey-50 px-4 py-2">
                <FiPhone className="text-white fill-primary w-5 h-5" />
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
        name="contactDetails.website"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <div className="flex-center h-[40px] w-full overflow-hidden rounded-md border-gray-300 border bg-grey-50 px-4 py-2">
                <RiLink className="text-primary h-5 w-5" />
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
                  placeholder="https://www.instagram.com/your-username"
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
                  placeholder="https://www.facebook.com/your-username"
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
                  placeholder="https://x.com/your-username"
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
        name="contactDetails.linkedin"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <div className="flex-center h-[40px] w-full overflow-hidden rounded-md border-gray-300 border bg-grey-50 px-4 py-2">
                <Image
                  src="/assets/icons/linkedIn.svg"
                  width={25}
                  height={25}
                  alt="linkedIn"
                />
                <Input
                  placeholder="https://www.linkedin.com/in/your-profile-name"
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
