'use client';

import { generateClientDropzoneAccept } from 'uploadthing/client';
import { Dispatch, SetStateAction, useCallback, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { X } from 'lucide-react';
import Image from 'next/image';

import { Button } from '@ui/button';
import { convertFileToUrl } from '@/lib/utils';

type FileUploaderProps = {
  imageUrls: string[];
  onFieldChange: (urls: string[]) => void;
  setFiles: Dispatch<SetStateAction<File[]>>;
};

export default function FileUploader({
  imageUrls = [],
  onFieldChange,
  setFiles,
}: FileUploaderProps) {
  const [files, setFilesState] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles = [...files, ...acceptedFiles];
      const totalSize = newFiles.reduce((acc, file) => acc + file.size, 0);

      if (newFiles.length > 6 || totalSize > 128 * 1024 * 1024) {
        alert('Maximum 6 files and total size of 128MB allowed.');
        return;
      }

      setFilesState(newFiles);
      setFiles(newFiles);
      onFieldChange(newFiles.map((file) => convertFileToUrl(file)));
    },
    [files, setFiles, onFieldChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: generateClientDropzoneAccept(['image/*']),
  });

  const handleAddMoreFiles = () => {
    fileInputRef.current?.click();
  };

  const removeFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    setFilesState(updatedFiles);
    onFieldChange(updatedFiles.map((file) => convertFileToUrl(file)));
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
          isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300'
        }`}
      >
        <input {...getInputProps()} ref={fileInputRef} />
        {isDragActive ? (
          <p>Drop the files here ...</p>
        ) : (
          <p>Drag & drop some files here, or click to select files</p>
        )}
      </div>
      {files.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Selected Files:</h3>
          <ul className="list-disc pl-5 mb-4">
            {files.map((file, index) => (
              <li
                key={index}
                className="flex items-center justify-between bg-gray-100 p-2 rounded"
              >
                <span className="truncate flex-1">
                  {file.name} ({formatFileSize(file.size)})
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFile(index)}
                  className="ml-2 text-red-500 hover:text-red-700 cursor-pointer"
                  aria-label={`Remove ${file.name}`}
                  title={`Remove ${file.name}`}
                >
                  <X className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {Array.isArray(imageUrls) && imageUrls.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Uploaded Images:</h3>
          <ul className="list-disc pl-5 mb-4">
            {imageUrls.map((url, index) => (
              <li key={index}>
                <Image
                  src={url}
                  alt={`Uploaded file ${index + 1}`}
                  className="w-full h-auto"
                />
              </li>
            ))}
          </ul>
        </div>
      )}
      <Button
        type="button"
        onClick={handleAddMoreFiles}
        className="w-full mt-3 button"
      >
        {files.length > 0 ? 'Add More Files' : 'Add Files'}
      </Button>
    </div>
  );
}
