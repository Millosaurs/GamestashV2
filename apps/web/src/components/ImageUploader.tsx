"use client";

import React, { useState } from "react";
import { AlertCircleIcon, ImageUpIcon, XIcon } from "lucide-react";
import { orpc } from "@/utils/orpc";
import { useMutation } from "@tanstack/react-query";
import imageCompression from "browser-image-compression";
import { toast } from "sonner";

interface ImageUploadProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export default function ImageUpload({
  value,
  onChange,
  disabled,
}: ImageUploadProps) {
  const maxSizeMB = 5;
  const maxSize = maxSizeMB * 1024 * 1024;
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Mutation for generating presigned URL
  const generateUrlMutation = useMutation({
    ...orpc.upload.generateImageUpload.mutationOptions(),
  });

  // Mutation for deleting images from S3
  const deleteImageMutation = useMutation({
    ...orpc.upload.deleteImage.mutationOptions(),
  });

  const compressImage = async (file: File): Promise<File> => {
    try {
      const options = {
        maxSizeMB: 1, // Compress to max 1MB
        maxWidthOrHeight: 1920, // Max dimension
        useWebWorker: true,
        fileType: file.type,
      };

      toast.info("Compressing image...");
      const compressedFile = await imageCompression(file, options);

      const compressionRatio = ((1 - compressedFile.size / file.size) * 100).toFixed(1);
      toast.success(`Image compressed by ${compressionRatio}%`, {
        description: `${(file.size / (1024 * 1024)).toFixed(2)}MB → ${(compressedFile.size / (1024 * 1024)).toFixed(2)}MB`,
      });

      return compressedFile;
    } catch (error) {
      toast.error("Failed to compress image", {
        description: "Uploading original file instead",
      });
      return file;
    }
  };

  const handleFileSelect = async (file: File) => {
    setError(null);

    // Validate file type
    if (!file.type.startsWith("image/")) {
      const errorMsg = "Please select an image file";
      setError(errorMsg);
      toast.error("Invalid file type", {
        description: errorMsg,
      });
      return;
    }

    // Validate file size
    if (file.size > maxSize) {
      const errorMsg = `File size must be less than ${maxSizeMB}MB`;
      setError(errorMsg);
      toast.error("File too large", {
        description: errorMsg,
      });
      return;
    }

    try {
      setIsUploading(true);

      // Compress image before upload
      const compressedFile = await compressImage(file);

      // Step 1: Get presigned URL from server
      toast.loading("Requesting upload URL...", { id: "upload" });

      const result = await generateUrlMutation.mutateAsync({
        fileName: compressedFile.name,
        fileType: compressedFile.type,
        fileSize: compressedFile.size,
      });

      if (!result.success || !result.uploadUrl || !result.publicUrl) {
        throw new Error("Failed to get upload URL from server");
      }

      // Step 2: Upload directly to S3
      toast.loading("Uploading to S3...", { id: "upload" });

      const uploadResponse = await fetch(result.uploadUrl, {
        method: "PUT",
        body: compressedFile,
        headers: {
          "Content-Type": compressedFile.type,
        },
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text().catch(() => "");
        if (errorText.includes("AccessDenied")) {
          throw new Error("Permission denied. Please check S3 bucket permissions.");
        }
        throw new Error(`Upload failed: ${uploadResponse.statusText}`);
      }

      // Update the value with public URL
      onChange(result.publicUrl);
      toast.success("Image uploaded successfully!", { id: "upload" });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to upload image";
      setError(errorMessage);
      toast.error("Upload failed", {
        description: errorMessage,
        id: "upload",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const openFileDialog = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleRemove = async (e: React.MouseEvent) => {
    e.stopPropagation();

    // Extract file key from the image URL
    if (value) {
      try {
        const url = new URL(value);
        const fileKey = url.pathname.substring(1); // Remove leading slash

        toast.loading("Deleting image...", { id: "delete-image" });

        await deleteImageMutation.mutateAsync({ fileKey });

        toast.success("Image deleted from S3", { id: "delete-image" });
      } catch (error) {
        console.error("Failed to delete from S3:", error);
        toast.error("Failed to delete from S3", {
          description: error instanceof Error ? error.message : "Unknown error",
          id: "delete-image",
        });
      }
    }

    onChange("");
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        {/* Drop area */}
        <div
          role="button"
          onClick={openFileDialog}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          data-dragging={isDragging || undefined}
          className="relative flex min-h-52 flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-input p-4 transition-colors hover:bg-accent/50 has-disabled:pointer-events-none has-disabled:opacity-50 has-[img]:border-none has-[input:focus]:border-ring has-[input:focus]:ring-[3px] has-[input:focus]:ring-ring/50 data-[dragging=true]:bg-accent/50"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleInputChange}
            disabled={disabled || isUploading}
            className="sr-only"
            aria-label="Upload file"
          />
          {value ? (
            <div className="absolute inset-0">
              <img
                src={value}
                alt="Uploaded image"
                className="size-full object-cover"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center px-4 py-3 text-center">
              <div
                className="mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border bg-background"
                aria-hidden="true"
              >
                <ImageUpIcon className="size-4 opacity-60" />
              </div>
              <p className="mb-1.5 text-sm font-medium">
                {isUploading
                  ? "Uploading..."
                  : "Drop your image here or click to browse"}
              </p>
              <p className="text-xs text-muted-foreground">
                Max size: {maxSizeMB}MB (will be compressed)
              </p>
            </div>
          )}
        </div>
        {value && !isUploading && (
          <div className="absolute top-4 right-4">
            <button
              type="button"
              className="z-50 flex size-8 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white transition-[color,box-shadow] outline-none hover:bg-black/80 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              onClick={handleRemove}
              aria-label="Remove image"
              disabled={disabled}
            >
              <XIcon className="size-4" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>

      {error && (
        <div
          className="flex items-center gap-1 text-xs text-destructive"
          role="alert"
        >
          <AlertCircleIcon className="size-3 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <p
        aria-live="polite"
        role="region"
        className="mt-2 text-center text-xs text-muted-foreground"
      >
        Single image uploader w/ S3 integration & compression ∙ Max size: {maxSizeMB}MB
      </p>
    </div>
  );
}
