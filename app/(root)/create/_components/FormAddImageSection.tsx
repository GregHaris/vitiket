"use client";

import { useFormContext } from "react-hook-form";

import { AddImageProps } from "@/types";
import { eventFormValues } from "@/lib/validator";
import FileUploader from "./FileUploader";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@ui/form";

export default function AddImage({ setFiles }: AddImageProps) {
  const { control } = useFormContext<eventFormValues>();

  return (
    <FormField
      control={control}
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
  );
}
