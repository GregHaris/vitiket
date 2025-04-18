"use client";

import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import Image from "next/image";

import { Button } from "@ui/button";
import { createEvent, updateEvent } from "@/lib/actions/event.actions";
import { eventDefaultValues } from "@/constants";
import { EventFormProps } from "@/types";
import { eventFormSchema } from "@/lib/validator/index";
import { Form } from "@ui/form";
import { getUserById } from "@/lib/actions/user.actions";
import { useUploadThing } from "@/lib/uploadthing";

import CategorySelector from "./FormCategorySelector";
import ContactDetails from "./FormContactDetails";
import Currency from "./FormCurrencyInput";
import DatePickerComponent from "./FormDatePicker";
import DescriptionEditor from "./FormDescriptionEditor";
import EventTypeSelector from "../../../../../../components/shared/EventTypeSelector";
import FormSection from "./FormSection";
import IsFreeCheckbox from "./FormIsFreeCheckbox";
import LocationSection from "./FormLocationSection";
import LocationTypeSelector from "./FormLocationTypeSelector";
import PriceCategoriesInput from "../../../../../../components/shared/PriceCategoriesInput";
import SubtitleInput from "./FormSubtitleTextArea";
import TimePickerComponent from "./FormTimePicker";
import TitleInput from "./FormTitleInput";
import QuantityInput from "./FormQuantityInput";
import Url from "./FormUrlInput";
import AddImage from "../../../../../../components/shared/FormAddImageSection";

export default function EventForm({
  userId,
  type,
  event,
  eventId,
}: EventFormProps) {
  const { startUpload } = useUploadThing("imageUploader");
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);

  const initialValues =
    event && type === "Update"
      ? {
          ...event,
          startDate: new Date(event.startDate),
          endDate: new Date(event.endDate),
          startTime: new Date(event.startTime),
          endTime: new Date(event.endTime),
          category: event.category
            ? {
                _id: event.category._id,
                name: event.category.name,
              }
            : { _id: "", name: "" },
          priceCategories: event.priceCategories || [],
          imageUrl: event.imageUrl || "",
        }
      : { ...eventDefaultValues, imageUrl: "" };

  const form = useForm<z.infer<typeof eventFormSchema>>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: initialValues,
  });

  const locationType = form.watch("locationType");
  const isFree = form.watch("isFree");

  async function onSubmit(values: z.infer<typeof eventFormSchema>) {
    const user = await getUserById(userId);

    let uploadedImageUrl: string = values.imageUrl;

    if (files.length > 0) {
      const uploadedImages = await startUpload(files);
      if (!uploadedImages) return;
      uploadedImageUrl = uploadedImages[0].ufsUrl;
    }

    const eventData = {
      ...values,
      imageUrl: uploadedImageUrl,
      location: values.locationType === "Virtual" ? "Virtual" : values.location,
      coordinates: values.coordinates,
      typeId: values.typeId,
    };

    const contactDetails = {
      phoneNumber: values.contactDetails.phoneNumber,
      email: values.contactDetails.email,
      website: values.contactDetails.website,
      instagram: values.contactDetails.instagram,
      facebook: values.contactDetails.facebook,
      x: values.contactDetails.x,
      linkedin: values.contactDetails.linkedin,
    };

    if (type === "Create") {
      try {
        const newEvent = await createEvent({
          event: eventData,
          userId,
          contactDetails,
          path: "/dashboard",
        });

        if (newEvent) {
          if (values.isFree) {
            router.push(`/events/${newEvent._id}`);
          } else {
            const hasPaymentDetails = user.subaccountCode;
            if (hasPaymentDetails) {
              router.push(
                `/organizer?userId=${userId}&eventId=${newEvent._id}`,
              );
            } else {
              router.push(
                `/organizer/setup?userId=${userId}&eventId=${newEvent._id}`,
              );
            }
          }
        }
      } catch (error) {
        console.log(error);
      }
    }

    if (type === "Update") {
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
          if (values.isFree) {
            router.push(`/events/${updatedEvents._id}`);
          } else {
            const hasPaymentDetails = user.subaccountCode;
            if (hasPaymentDetails) {
              router.push(
                `/organizer?userId=${userId}&eventId=${updatedEvents._id}`,
              );
            } else {
              router.push(
                `/organizer/setup?userId=${userId}&eventId=${updatedEvents._id}`,
              );
            }
          }
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
              title={type === "Create" ? "Create a New Event" : "Update Event"}
              description={
                type === "Create"
                  ? "Fill in the details below to list your event"
                  : "Update the details of your event"
              }
            >
              <FormProvider {...form}>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
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
                    <TitleInput />
                    <SubtitleInput />
                    <DescriptionEditor />
                    <AddImage setFiles={setFiles} />
                    <LocationTypeSelector />
                    <LocationSection locationType={locationType} form={form} />
                    <IsFreeCheckbox
                      onCheckedChange={(isChecked) => {
                        if (isChecked) {
                          form.setValue("priceCategories", []);
                        }
                      }}
                    />
                    <QuantityInput />
                    {!isFree && (
                      <>
                        {locationType === "Virtual" && (
                          <>
                            <PriceCategoriesInput />
                            <Url
                              name="url"
                              label="Event URL"
                              placeholder="https://example.com"
                            />
                          </>
                        )}
                        {locationType === "Physical" && (
                          <>
                            <PriceCategoriesInput />
                          </>
                        )}
                        {locationType === "Hybrid" && (
                          <>
                            <PriceCategoriesInput />
                            <Url
                              name="url"
                              label="Virtual Event URL"
                              placeholder="https://example.com"
                            />
                          </>
                        )}
                      </>
                    )}
                    {isFree && (
                      <>
                        {locationType === "Virtual" && (
                          <Url
                            name="url"
                            label="Event URL"
                            placeholder="https://example.com"
                          />
                        )}

                        {locationType === "Hybrid" && (
                          <Url
                            name="url"
                            label="Virtual Event URL"
                            placeholder="https://example.com"
                          />
                        )}
                      </>
                    )}
                    <Currency />
                    <EventTypeSelector />
                    <CategorySelector />
                    <DatePickerComponent
                      name="startDate"
                      label="Start Date"
                      placeholder="Start Date:"
                    />
                    <DatePickerComponent
                      name="endDate"
                      label="End Date"
                      placeholder="End Date:"
                    />
                    <TimePickerComponent
                      name="startTime"
                      label="Start Time"
                      placeholder="Start Time:"
                    />
                    <TimePickerComponent
                      name="endTime"
                      label="End Time"
                      placeholder="End Time:"
                    />
                    <ContactDetails />
                    <Button
                      type="submit"
                      size={"lg"}
                      className="button w-full"
                      disabled={form.formState.isSubmitting}
                    >
                      {form.formState.isSubmitting
                        ? "Submitting..."
                        : `${type} Event`}
                    </Button>
                  </form>
                </Form>
              </FormProvider>
            </FormSection>
          </div>

          <div className="hidden lg:block">
            <Image
              src={"/assets/images/logo.svg"}
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
