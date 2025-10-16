"use client";

import imageCompression from "browser-image-compression";
import { toast } from "sonner";
import { client } from "@/utils/orpc";

export const MAX_IMAGE_SIZE_MB = 5;
export const MAX_IMAGE_SIZE = MAX_IMAGE_SIZE_MB * 1024 * 1024;

interface UploadResult {
  success: boolean;
  uploadUrl: string;
  fileKey: string;
  publicUrl?: string;
}

/**
 * Compress an image file before uploading
 */
export async function compressImage(file: File): Promise<File> {
  try {
    const options = {
      maxSizeMB: 1, // Compress to max 1MB
      maxWidthOrHeight: 1920, // Max dimension
      useWebWorker: true,
      fileType: file.type,
    };

    const compressedFile = await imageCompression(file, options);

    const compressionRatio = (
      (1 - compressedFile.size / file.size) *
      100
    ).toFixed(1);

    console.log(
      `Image compressed by ${compressionRatio}%: ${(file.size / (1024 * 1024)).toFixed(2)}MB → ${(compressedFile.size / (1024 * 1024)).toFixed(2)}MB`
    );

    return compressedFile;
  } catch (error) {
    console.error("Failed to compress image:", error);
    return file; // Return original if compression fails
  }
}

/**
 * Upload an image to S3 via presigned URL
 * This function is used by the Tiptap editor for image uploads
 */
export async function handleImageUpload(file: File): Promise<string> {
  // Validate file type
  if (!file.type.startsWith("image/")) {
    toast.error("Invalid file type", {
      description: "Please select an image file",
    });
    throw new Error("Please select an image file");
  }

  // Validate file size
  if (file.size > MAX_IMAGE_SIZE) {
    toast.error("File too large", {
      description: `Image size must be less than ${MAX_IMAGE_SIZE_MB}MB`,
    });
    throw new Error(`File size must be less than ${MAX_IMAGE_SIZE_MB}MB`);
  }

  try {
    // Show upload progress
    toast.loading("Compressing image...", { id: "tiptap-upload" });

    // Compress image before upload
    const compressedFile = await compressImage(file);

    // Step 1: Get presigned URL from server
    toast.loading("Getting upload URL...", { id: "tiptap-upload" });

    const result: UploadResult = await client.upload.generateImageUpload({
      fileName: compressedFile.name,
      fileType: compressedFile.type,
      fileSize: compressedFile.size,
    });

    if (!result.success || !result.uploadUrl) {
      throw new Error("Failed to get upload URL from server");
    }

    if (!result.publicUrl) {
      throw new Error("No public URL returned from server");
    }

    // Step 2: Upload directly to S3
    toast.loading("Uploading to S3...", { id: "tiptap-upload" });

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
        throw new Error(
          "Permission denied. Please check S3 bucket permissions."
        );
      }
      throw new Error(`Upload failed: ${uploadResponse.statusText}`);
    }

    toast.success("Image uploaded successfully!", { id: "tiptap-upload" });

    // Return the public URL of the uploaded image
    return result.publicUrl;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to upload image";

    toast.error("Upload failed", {
      description: errorMessage,
      id: "tiptap-upload",
    });

    throw error;
  }
}

/**
 * Create a wrapper function that can be used directly in Tiptap's Image extension
 */
export function createImageUploadHandler() {
  return async (file: File): Promise<string> => {
    return handleImageUpload(file);
  };
}

/**
 * Validate if a URL is a valid image URL
 */
export function isValidImageUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === "http:" || urlObj.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Extract file key from S3 URL for deletion
 */
export function extractFileKeyFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    // Remove leading slash
    return urlObj.pathname.substring(1);
  } catch {
    return null;
  }
}
