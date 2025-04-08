"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { ProfileUpdateFormProps } from "@/types";
import {
  ProfileUpdateFormValues,
  profileUpdateFormSchema,
} from "@/lib/validator";
import { updateUser } from "@/lib/actions/user.actions";

export default function ProfileUpdateForm({
  userId,
  existingDetails,
}: ProfileUpdateFormProps) {
  const [message, setMessage] = useState<string>("");
  const router = useRouter();

  const form = useForm<ProfileUpdateFormValues>({
    resolver: zodResolver(profileUpdateFormSchema),
    defaultValues: {
      firstName: existingDetails.firstName,
      lastName: existingDetails.lastName,
      username: existingDetails.username,
    },
  });

  const onSubmit = async (data: ProfileUpdateFormValues) => {
    try {
      await updateUser(userId, {
        firstName: data.firstName,
        lastName: data.lastName,
        username: data.username,
      });
      router.push("/dashboard/profile");
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage("Error updating profile.");
    }
  };

  return (
    <div className="space-y-6">
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">First Name</label>
            <input
              {...form.register("firstName")}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
            {form.formState.errors.firstName && (
              <p className="text-red-500 text-sm">
                {form.formState.errors.firstName.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium">Last Name</label>
            <input
              {...form.register("lastName")}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
            {form.formState.errors.lastName && (
              <p className="text-red-500 text-sm">
                {form.formState.errors.lastName.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium">Username</label>
            <input
              {...form.register("username")}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
            {form.formState.errors.username && (
              <p className="text-red-500 text-sm">
                {form.formState.errors.username.message}
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="button bg-primary hover:bg-primary-600 px-4 py-2"
          >
            Update
          </button>
        </form>
        {message && <p className="text-sm text-muted-foreground">{message}</p>}
      </FormProvider>
    </div>
  );
}
