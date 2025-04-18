"use client";

import { useFormContext } from "react-hook-form";
import dynamic from "next/dynamic";

import { eventFormValues } from "@/lib/validator";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@ui/form";

const RichTextEditor = dynamic(() => import("./TiptapEditor"));

export default function DescriptionEditor() {
  const { control } = useFormContext<eventFormValues>();
  return (
    <FormField
      control={control}
      name="description"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-sm font-medium">
            Description <span className="text-red-400">*</span>
          </FormLabel>
          <FormControl>
            <RichTextEditor
              initialContent={field.value}
              onChange={field.onChange}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
