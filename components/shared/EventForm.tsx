'use client';

import { FiPhone, FiMail } from 'react-icons/fi';
import { RiLink } from 'react-icons/ri';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useUploadThing } from '@/lib/uploadthing';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import DatePicker from 'react-datepicker';
import Image from 'next/image';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

import 'react-datepicker/dist/react-datepicker.css';

import { Button } from '@/components/ui/button';
import { currencies, eventDefaultValues } from '@/constants';
import { Checkbox } from '@/components/ui/checkbox';
import { createEvent, updateEvent } from '@/lib/actions/event.actions';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import type { IEvent } from '@/lib/database/models/event.model';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { eventFormSchema } from '@/lib/validator/index';
import CategoriesDropdown from './CategoriesDropdown';
import FileUploader from './FileUploader';
import TiptapEditor from './TiptapEditor';
import TypesDropdown from './TypesDropdown';

type EventFormProps = {
  userId: string;
  type: 'Create' | 'Update';
  event?: IEvent;
  eventId?: string;
};

export default function EventForm({
  userId,
  type,
  event,
  eventId,
}: EventFormProps) {
  const [files, setFiles] = useState<File[]>([]);
  const router = useRouter();
  const { startUpload } = useUploadThing('imageUploader');

  const initialValues =
    event && type === 'Update'
      ? {
          ...event,
          category: event.category
            ? {
                _id: event.category._id,
                name: event.category.name,
              }
            : { _id: '', name: '' },
          imageUrl: event.imageUrl || '',
        }
      : { ...eventDefaultValues, imageUrl: '' };

  const form = useForm<z.infer<typeof eventFormSchema>>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: initialValues,
  });

  const locationType = form.watch('locationType');

  async function onSubmit(values: z.infer<typeof eventFormSchema>) {
    let uploadedImageUrl: string = values.imageUrl;

    if (files.length > 0) {
      const uploadedImages = await startUpload(files);

      if (!uploadedImages) {
        return;
      }
      uploadedImageUrl = uploadedImages[0].url;
    }

    const eventData = {
      ...values,
      location: values.locationType === 'Online' ? 'Online' : values.location,
      imageUrl: uploadedImageUrl,
    };

    const contactDetails = {
      phoneNumber: values.contactDetails.phoneNumber,
      email: values.contactDetails.email,
      website: values.contactDetails.website,
      instagram: values.contactDetails.instagram,
      facebook: values.contactDetails.facebook,
      x: values.contactDetails.x,
    };

    if (type === 'Create') {
      try {
        const newEvent = await createEvent({
          event: eventData,
          userId,
          contactDetails,
          path: '/dashboard',
        });

        if (newEvent) {
          router.push(`/events/${newEvent._id}`);
        }
      } catch (error) {
        console.log(error);
      }
    }

    if (type === 'Update') {
      if (!eventId) {
        router.back();
        return;
      }

      try {
        const updatedEvents = await updateEvent({
          userId,
          event: {
            ...eventData,
            _id: eventId,
          },
          contactDetails,
          path: `/events/${eventId}`,
        });

        if (updatedEvents) {
          router.push(`/events/${updatedEvents._id}`);
        }
      } catch (error) {
        console.log(error);
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="wrapper">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <div className="mb-8">
              <h1 className="text-2xl font-semibold mb-2">
                {type === 'Create' ? 'Create a New Event' : 'Update Event'}
              </h1>
              <p className="text-gray-600">
                {type === 'Create'
                  ? 'Fill in the details below to list your event'
                  : 'Update the details of your event'}
              </p>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Title <span className="text-red-400">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Event title"
                          {...field}
                          className="input-field p-regular-14"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Description <span className="text-red-400">*</span>
                      </FormLabel>
                      <FormControl>
                        <TiptapEditor
                          initialContent={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Image <span className="text-red-400">*</span>
                      </FormLabel>
                      <FormControl>
                        <FileUploader
                          imageUrl={field.value}
                          onFieldChange={field.onChange}
                          setFiles={setFiles}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="locationType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Location Type <span className="text-red-400">*</span>
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex gap-4 items-center"
                        >
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="Online" />
                            </FormControl>
                            <FormLabel>Online</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="In-Person" />
                            </FormControl>
                            <FormLabel>In-Person</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="Hybrid" />
                            </FormControl>
                            <FormLabel>Hybrid</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {locationType === 'Online' && (
                  <>
                    <FormField
                      control={form.control}
                      name="url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">
                            Online Event URL{' '}
                            <span className="text-red-400">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://example.com"
                              {...field}
                              className="input-field p-regular-14"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="onlinePrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">
                            Online Price <span className="text-red-400">*</span>
                          </FormLabel>
                          <FormControl>
                            <div className="flex-center h-[40px] w-full overflow-hidden rounded-md border-gray-300 border bg-grey-50 px-4 py-2">
                              <Input
                                placeholder="0.00"
                                {...field}
                                className="nested-input-field p-regular-14"
                                onChange={(e) => {
                                  field.onChange(e);
                                  if (e.target.value) {
                                    form.setValue('isFree', false);
                                  }
                                }}
                              />
                              <FormField
                                control={form.control}
                                name="isFree"
                                render={({ field: isFreeField }) => (
                                  <FormItem>
                                    <FormControl>
                                      <div className="flex items-center">
                                        <label
                                          htmlFor="isFree"
                                          className="whitespace-nowrap pr-3 leading-none text-sm peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                          Free Ticket
                                        </label>
                                        <Checkbox
                                          id="isFree"
                                          checked={isFreeField.value}
                                          onCheckedChange={(checked) => {
                                            isFreeField.onChange(checked);
                                            if (checked) {
                                              form.setValue('onlinePrice', '');
                                            }
                                          }}
                                          className="mr-2 h-5 w-5 border-2 border-primary-500 cursor-pointer"
                                        />
                                      </div>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                {locationType === 'In-Person' && (
                  <>
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">
                            Event Location{' '}
                            <span className="text-red-400">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter event address"
                              {...field}
                              className="input-field p-regular-14"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="inPersonPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">
                            In-Person Price{' '}
                            <span className="text-red-400">*</span>
                          </FormLabel>
                          <FormControl>
                            <div className="flex-center h-[40px] w-full overflow-hidden rounded-md border-gray-300 border bg-grey-50 px-4 py-2">
                              <Input
                                placeholder="0.00"
                                {...field}
                                className="nested-input-field p-regular-14"
                                onChange={(e) => {
                                  field.onChange(e);
                                  if (e.target.value) {
                                    form.setValue('isFree', false);
                                  }
                                }}
                              />
                              <FormField
                                control={form.control}
                                name="isFree"
                                render={({ field: isFreeField }) => (
                                  <FormItem>
                                    <FormControl>
                                      <div className="flex items-center">
                                        <label
                                          htmlFor="isFree"
                                          className="whitespace-nowrap pr-3 leading-none text-sm peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                          Free Ticket
                                        </label>
                                        <Checkbox
                                          id="isFree"
                                          checked={isFreeField.value}
                                          onCheckedChange={(checked) => {
                                            isFreeField.onChange(checked);
                                            if (checked) {
                                              form.setValue(
                                                'inPersonPrice',
                                                ''
                                              );
                                            }
                                          }}
                                          className="mr-2 h-5 w-5 border-2 border-primary-500 cursor-pointer"
                                        />
                                      </div>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                {locationType === 'Hybrid' && (
                  <>
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">
                            Event Location{' '}
                            <span className="text-red-400">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter event address"
                              {...field}
                              className="input-field p-regular-14"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">
                            Online Event URL{' '}
                            <span className="text-red-400">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://example.com"
                              {...field}
                              className="input-field p-regular-14"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex flex-col md:flex-row gap-5">
                      <FormField
                        control={form.control}
                        name="inPersonPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">
                              In-Person Price{' '}
                              <span className="text-red-400">*</span>
                            </FormLabel>
                            <FormControl>
                              <div className="flex-center h-[40px] w-full overflow-hidden rounded-md border-gray-300 border bg-grey-50 px-4 py-2">
                                <Input
                                  placeholder="0.00"
                                  {...field}
                                  className="nested-input-field p-regular-14"
                                  onChange={(e) => {
                                    field.onChange(e);
                                    if (e.target.value) {
                                      form.setValue('isFree', false);
                                    }
                                  }}
                                />
                                <FormField
                                  control={form.control}
                                  name="isFree"
                                  render={({ field: isFreeField }) => (
                                    <FormItem>
                                      <FormControl>
                                        <div className="flex items-center">
                                          <label
                                            htmlFor="isFree"
                                            className="whitespace-nowrap pr-3 leading-none text-sm peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                          >
                                            Free Ticket
                                          </label>
                                          <Checkbox
                                            id="isFree"
                                            checked={isFreeField.value}
                                            onCheckedChange={(checked) => {
                                              isFreeField.onChange(checked);
                                              if (checked) {
                                                form.setValue(
                                                  'inPersonPrice',
                                                  ''
                                                );
                                              }
                                            }}
                                            className="mr-2 h-5 w-5 border-2 border-primary-500 cursor-pointer"
                                          />
                                        </div>
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="onlinePrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">
                              Online Price{' '}
                              <span className="text-red-400">*</span>
                            </FormLabel>
                            <FormControl>
                              <div className="flex-center h-[40px] w-full overflow-hidden rounded-md border-gray-300 border bg-grey-50 px-4 py-2">
                                <Input
                                  placeholder="0.00"
                                  {...field}
                                  className="nested-input-field p-regular-14"
                                  onChange={(e) => {
                                    field.onChange(e);
                                    if (e.target.value) {
                                      form.setValue('isFree', false);
                                    }
                                  }}
                                />
                                <FormField
                                  control={form.control}
                                  name="isFree"
                                  render={({ field: isFreeField }) => (
                                    <FormItem>
                                      <FormControl>
                                        <div className="flex items-center">
                                          <label
                                            htmlFor="isFree"
                                            className="whitespace-nowrap pr-3 leading-none text-sm peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                          >
                                            Free Ticket
                                          </label>
                                          <Checkbox
                                            id="isFree"
                                            checked={isFreeField.value}
                                            onCheckedChange={(checked) => {
                                              isFreeField.onChange(checked);
                                              if (checked) {
                                                form.setValue(
                                                  'onlinePrice',
                                                  ''
                                                );
                                              }
                                            }}
                                            className="mr-2 h-5 w-5 border-2 border-primary-500 cursor-pointer"
                                          />
                                        </div>
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </>
                )}

                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Currency <span className="text-red-400">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="select-field p-regular-14">
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {currencies.map((currency) => (
                            <SelectItem key={currency} value={currency}>
                              {currency}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="typeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Type <span className="text-red-400">*</span>
                      </FormLabel>
                      <TypesDropdown
                        value={field.value}
                        onChange={field.onChange}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Category <span className="text-red-400">*</span>
                      </FormLabel>
                      <CategoriesDropdown
                        value={field.value}
                        onChange={field.onChange}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="startDateTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Start Date & Time{' '}
                        <span className="text-red-400">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="flex-center h-[40px] w-full overflow-hidden rounded-md border-gray-300 border bg-grey-50 px-4 py-2 text-sm">
                          <Image
                            src="/assets/icons/calendar.svg"
                            width={20}
                            height={20}
                            alt="calendar"
                            className="filter-grey"
                          />
                          <p className="ml-3 whitespace-nowrap text-gray-600">
                            Start Date:
                          </p>
                          <DatePicker
                            selected={field.value}
                            onChange={(date: Date | null) =>
                              field.onChange(date)
                            }
                            showTimeSelect
                            timeInputLabel="Time:"
                            dateFormat="dd/MM/yyyy h:mm aa"
                            wrapperClassName="datePicker"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDateTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        End Date & Time <span className="text-red-400">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="flex-center h-[40px] w-full overflow-hidden rounded-md border-gray-300 border text-sm bg-grey-50 px-4 py-2">
                          <Image
                            src="/assets/icons/calendar.svg"
                            width={20}
                            height={20}
                            alt="calendar"
                            className="filter-grey"
                          />
                          <p className="ml-3 whitespace-nowrap text-gray-600">
                            End Date:
                          </p>
                          <DatePicker
                            selected={field.value}
                            onChange={(date: Date | null) =>
                              field.onChange(date)
                            }
                            showTimeSelect
                            timeInputLabel="Time:"
                            dateFormat="dd/MM/yyyy h:mm aa"
                            wrapperClassName="datePicker"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-6 py-10">
                  <h3 className="text-lg font-semibold">Contact Details</h3>
                  <FormField
                    control={form.control}
                    name="contactDetails.phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="flex-center h-[40px] w-full overflow-hidden rounded-md border-gray-300 border bg-grey-50 px-4 py-2">
                            <FiPhone />
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
                    control={form.control}
                    name="contactDetails.email"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="flex-center h-[40px] w-full overflow-hidden rounded-md border-gray-300 border bg-grey-50 px-4 py-2">
                            <FiMail />
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
                    control={form.control}
                    name="contactDetails.website"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="flex-center h-[40px] w-full overflow-hidden rounded-md border-gray-300 border bg-grey-50 px-4 py-2">
                            <RiLink />
                            <Input
                              placeholder="www.example.com"
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
                    control={form.control}
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
                    control={form.control}
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
                    control={form.control}
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

                <Button
                  type="submit"
                  size={'lg'}
                  className="button w-full"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting
                    ? 'Submitting...'
                    : `${type} Event`}
                </Button>
              </form>
            </Form>
          </div>

          <div className="hidden lg:block">
            <Image
              src={'/assets/images/logo.svg'}
              alt="vitiket"
              width={600}
              height={800}
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
