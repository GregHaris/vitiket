'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { createEvent, updateEvent } from '@/lib/actions/event.actions';
import { eventDefaultValues } from '@/constants';
import { eventFormSchema } from '@/lib/validator/index';
import { Form } from '@/components/ui/form';
import { IEvent } from '@/lib/database/models/event.model';

import CategorySelector from './FormCategorySelector';
import ContactDetails from './FormContactDetails';
import Currency from './FormCurrencySelector';
import DateTimePicker from './FormDatePicker';
import DescriptionEditor from './FormDescriptionEditor';
import EventTypeSelector from './EventTypeSelector';
import FormSection from './FormSection';
import LocationSection from './FormLocationSection';
import LocationTypeSelector from './FormLocationTypeSelector';
import PriceInput from './FormPriceInput';
import TitleInput from './FormTitleInput';
import Url from './FormUrlInput';
import UploadImage from './FormImageUploadSection';

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
  const router = useRouter();

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
    const eventData = {
      ...values,
      location: values.locationType === 'Online' ? 'Online' : values.location,
      coordinates: values.coordinates,
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
            <FormSection
              title={type === 'Create' ? 'Create a New Event' : 'Update Event'}
              description={
                type === 'Create'
                  ? 'Fill in the details below to list your event'
                  : 'Update the details of your event'
              }
            >
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                    }
                  }}
                  className="space-y-6"
                >
                  {Object.keys(form.formState.errors).length > 0 && (
                    <div className="text-red-500 mb-4">
                      * Please fill out all required fields (*)
                    </div>
                  )}

                  <TitleInput control={form.control} />
                  <DescriptionEditor control={form.control} />
                  <UploadImage />
                  <LocationTypeSelector control={form.control} />
                  <LocationSection
                    control={form.control}
                    locationType={locationType}
                    form={form}
                  />
                  {locationType === 'Online' && (
                    <>
                      <Url
                        control={form.control}
                        name="url"
                        label="Online Event URL"
                        placeholder="https://example.com"
                      />
                      <PriceInput
                        control={{ ...form.control, setValue: form.setValue }}
                        name="onlinePrice"
                        label="Price"
                      />
                    </>
                  )}
                  {locationType === 'In-Person' && (
                    <PriceInput
                      control={{ ...form.control, setValue: form.setValue }}
                      name="inPersonPrice"
                      label="Price"
                    />
                  )}
                  {locationType === 'Hybrid' && (
                    <>
                      <PriceInput
                        control={{ ...form.control, setValue: form.setValue }}
                        name="inPersonPrice"
                        label="In-Person Price"
                      />
                      <PriceInput
                        control={{ ...form.control, setValue: form.setValue }}
                        name="onlinePrice"
                        label="Online Price"
                      />
                    </>
                  )}
                  <Currency control={form.control} />
                  <EventTypeSelector control={form.control} />
                  <CategorySelector control={form.control} />
                  <DateTimePicker
                    name="startDateTime"
                    label="Start Date & Time"
                  />
                  <DateTimePicker name="endDateTime" label="End Date & Time" />
                  <ContactDetails control={form.control} />
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
            </FormSection>
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
