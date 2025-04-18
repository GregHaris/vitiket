"use client";

import { generateClientDropzoneAccept } from "uploadthing/client";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { X } from "lucide-react";
import Image from "next/image";

import { Button } from "@ui/button";
import { useUploadThing } from "@/lib/uploadthing";

type FileUploaderProps = {
  imageUrl: string;
  onFieldChange: (url: string) => void;
  setFiles: (files: File[]) => void;
};

export default function FileUploader({
  imageUrl,
  onFieldChange,
  setFiles,
}: FileUploaderProps) {
  const [file, setFileState] = useState<File | null>(null);
  const { startUpload } = useUploadThing("imageUploader");

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const newFile = acceptedFiles[0];

      // Check if the file size exceeds 4MB
      if (newFile.size > 4 * 1024 * 1024) {
        alert("File size must not exceed 4MB.");
        return;
      }

      setFileState(newFile);
      setFiles([newFile]);

      // Upload the file to UploadThing
      const res = await startUpload([newFile]);
      if (res && res[0]?.ufsUrl) {
        onFieldChange(res[0].ufsUrl);
      }
    },
    [setFiles, onFieldChange, startUpload],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: generateClientDropzoneAccept(["image/*"]),
    maxFiles: 1,
  });

  const removeFile = () => {
    setFileState(null);
    setFiles([]);
    onFieldChange("");
  };

  const formatFileSize = (size: number) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <div
        {...getRootProps()}
        className={`p-8 border-2 border-dashed rounded-lg text-center cursor-pointer ${
          isDragActive ? "border-primary bg-primary/10" : "border-gray-300"
        }`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the file here ...</p>
        ) : (
          <div className="flex flex-col items-center justify-between gap-4">
            <p>Drag & drop a file here, or click to select a file</p>
            <Image
              src="/assets/icons/upload.svg"
              width={100}
              height={100}
              alt="Upload"
            />
          </div>
        )}
      </div>
      {file && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Selected File:</h3>
          <div className="flex items-center justify-between bg-gray-100 p-2 rounded">
            <span className="truncate flex-1">
              {file.name} ({formatFileSize(file.size)})
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={removeFile}
              className="ml-2 text-red-500 hover:text-red-700 cursor-pointer"
              aria-label={`Remove ${file.name}`}
              title={`Remove ${file.name}`}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      {imageUrl && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Uploaded Image:</h3>
          <Image
            src={imageUrl}
            alt="Uploaded file"
            width={300}
            height={200}
            className="w-full h-auto rounded-lg"
          />
        </div>
      )}
    </div>
  );
}
