import { z } from "zod";
import { os } from "@orpc/server";
import {
  generateImageUploadUrl,
  generateFileUploadUrl,
  generateFileDownloadUrl,
  deleteFromS3
} from "../s3";

// Schema for requesting IMAGE upload URL
const GenerateImageUploadUrlSchema = z.object({
  fileName: z.string().min(1, "File name is required"),
  fileType: z.string().min(1, "File type is required"),
  fileSize: z.number().max(5 * 1024 * 1024, "Image size must be less than 5MB"),
});

// Schema for requesting FILE upload URL
const GenerateFileUploadUrlSchema = z.object({
  fileName: z.string().min(1, "File name is required"),
  fileType: z.string().min(1, "File type is required"),
  fileSize: z.number().max(100 * 1024 * 1024, "File size must be less than 100MB"),
});

// Schema for requesting FILE download URL
const GenerateFileDownloadUrlSchema = z.object({
  fileKey: z.string().min(1, "File key is required"),
  expiresIn: z.number().optional().default(3600), // 1 hour default
});

// Schema for deleting image
const DeleteImageSchema = z.object({
  fileKey: z.string().min(1, "File key is required"),
});

// Schema for deleting file
const DeleteFileSchema = z.object({
  fileKey: z.string().min(1, "File key is required"),
});

// Generate presigned URL for IMAGE upload (public)
export const generateImageUpload = os
  .input(GenerateImageUploadUrlSchema)
  .handler(async (opt) => {
    const { fileName, fileType } = opt.input;

    try {
      // Validate file type
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
      if (!allowedTypes.includes(fileType)) {
        throw new Error("Invalid file type. Only JPEG, PNG, WEBP, and GIF are allowed.");
      }

      const uploadData = await generateImageUploadUrl(fileName, fileType);

      return {
        success: true,
        ...uploadData,
      };
    } catch (error) {
      console.error("[UPLOAD ERROR]", {
        error: error instanceof Error ? error.message : "Unknown error",
        fileName,
        fileType,
      });
      throw error;
    }
  });

// Generate presigned URL for FILE upload (protected)
export const generateFileUpload = os
  .input(GenerateFileUploadUrlSchema)
  .handler(async (opt) => {
    const { fileName, fileType } = opt.input;

    try {
      // Validate file type (customize based on your needs)
      const allowedTypes = [
        "application/pdf",
        "application/zip",
        "application/x-zip-compressed",
        "application/x-rar-compressed",
        "application/octet-stream",
        "text/plain",
      ];

      if (!allowedTypes.includes(fileType)) {
        throw new Error("Invalid file type. Only PDF, ZIP, RAR, and TXT files are allowed.");
      }

      const uploadData = await generateFileUploadUrl(fileName, fileType);

      return {
        success: true,
        ...uploadData,
      };
    } catch (error) {
      console.error("[UPLOAD ERROR]", {
        error: error instanceof Error ? error.message : "Unknown error",
        fileName,
        fileType,
      });
      throw error;
    }
  });

// Generate presigned URL for FILE download (protected)
export const generateFileDownload = os
  .input(GenerateFileDownloadUrlSchema)
  .handler(async (opt) => {
    const { fileKey, expiresIn } = opt.input;

    try {
      // TODO: Add authorization check here
      // Verify that the user has permission to download this file
      // const user = opt.context.session?.user;
      // if (!user) {
      //   throw new Error("Unauthorized");
      // }

      const downloadUrl = await generateFileDownloadUrl(fileKey, expiresIn);

      return {
        success: true,
        downloadUrl,
      };
    } catch (error) {
      console.error("[DOWNLOAD ERROR]", {
        error: error instanceof Error ? error.message : "Unknown error",
        fileKey,
      });
      throw error;
    }
  });

// Delete image from S3
export const deleteImage = os
  .input(DeleteImageSchema)
  .handler(async (opt) => {
    const { fileKey } = opt.input;

    try {
      // Validate that this is an image file in the images folder
      if (!fileKey.startsWith("products/images/")) {
        throw new Error("Invalid file key. Can only delete images from products/images/ folder.");
      }

      await deleteFromS3(fileKey);

      return {
        success: true,
        message: "Image deleted successfully",
      };
    } catch (error) {
      console.error("[DELETE ERROR]", {
        error: error instanceof Error ? error.message : "Unknown error",
        fileKey,
      });
      throw error;
    }
  });

// Delete file from S3
export const deleteFile = os
  .input(DeleteFileSchema)
  .handler(async (opt) => {
    const { fileKey } = opt.input;

    try {
      // Validate that this is a file in the files folder
      if (!fileKey.startsWith("products/files/")) {
        throw new Error("Invalid file key. Can only delete files from products/files/ folder.");
      }

      await deleteFromS3(fileKey);

      return {
        success: true,
        message: "File deleted successfully",
      };
    } catch (error) {
      console.error("[DELETE ERROR]", {
        error: error instanceof Error ? error.message : "Unknown error",
        fileKey,
      });
      throw error;
    }
  });

export const uploadRoute = {
  generateImageUpload,
  generateFileUpload,
  generateFileDownload,
  deleteImage,
  deleteFile,
};
