'use client';

import { useFormContext } from 'react-hook-form';

import FileUploader from './FileUploader';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useUploadThing } from '@/lib/uploadthing';

export default function UploadImage() {
  const { startUpload } = useUploadThing('imageUploader');
  const { control, setValue } = useFormContext();

  const handleFileChange = async (files: File[]) => {
    if (files.length > 0) {
      const uploadedImages = await startUpload(files);
      if (!uploadedImages) return;
      setValue('imageUrl', uploadedImages[0].url);
    }
  };

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
              setFiles={handleFileChange}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
