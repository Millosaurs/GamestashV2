import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!;
const PUBLIC_URL = process.env.AWS_S3_PUBLIC_URL!;

// Folder structure
const FOLDERS = {
  IMAGES: "products/images/",    // Public images
  FILES: "products/files/",      // Protected files/assets
} as const;

export interface UploadUrlResponse {
  uploadUrl: string;
  fileKey: string;
  publicUrl?: string; // Only for images
}

// Generate presigned URL for IMAGE upload (public)
export async function generateImageUploadUrl(
  fileName: string,
  fileType: string
): Promise<UploadUrlResponse> {
  try {
    const fileExtension = fileName.split(".").pop();
    const fileKey = `${FOLDERS.IMAGES}${randomUUID()}.${fileExtension}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
      ContentType: fileType,
      // Note: ACL removed - ensure bucket policy allows public read for images folder
      // Or use CloudFront for public access
    });

    const uploadUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600, // URL expires in 1 hour
    });

    const publicUrl = `${PUBLIC_URL}/${fileKey}`;

    return {
      uploadUrl,
      fileKey,
      publicUrl,
    };
  } catch (error) {
    console.error("[S3 ERROR] Failed to generate image upload URL:", {
      error: error instanceof Error ? error.message : "Unknown error",
      fileName,
      fileType,
    });
    throw error;
  }
}

// Generate presigned URL for FILE upload (protected)
export async function generateFileUploadUrl(
  fileName: string,
  fileType: string
): Promise<UploadUrlResponse> {
  try {
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileKey = `${FOLDERS.FILES}${randomUUID()}-${sanitizedFileName}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
      ContentType: fileType,
      // No ACL - defaults to private
    });

    const uploadUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    });

    return {
      uploadUrl,
      fileKey,
      // No publicUrl - files are protected
    };
  } catch (error) {
    console.error("[S3 ERROR] Failed to generate file upload URL:", {
      error: error instanceof Error ? error.message : "Unknown error",
      fileName,
      fileType,
    });
    throw error;
  }
}

// Generate presigned URL for FILE download (protected)
export async function generateFileDownloadUrl(
  fileKey: string,
  expiresIn: number = 3600 // 1 hour default
): Promise<string> {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
    });

    const downloadUrl = await getSignedUrl(s3Client, command, {
      expiresIn,
    });

    return downloadUrl;
  } catch (error) {
    console.error("[S3 ERROR] Failed to generate download URL:", {
      error: error instanceof Error ? error.message : "Unknown error",
      fileKey,
    });
    throw error;
  }
}

// Delete file from S3 (works for both images and files)
export async function deleteFromS3(fileKey: string): Promise<void> {
  try {
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: fileKey,
      })
    );
  } catch (error) {
    console.error("[S3 ERROR] Failed to delete file:", {
      error: error instanceof Error ? error.message : "Unknown error",
      fileKey,
    });
    throw error;
  }
}
