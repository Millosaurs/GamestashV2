# S3 Upload Setup Guide - Public Images & Protected Files

This guide explains how to set up AWS S3 image and file uploads for your product creation form, with separate folders for public images and protected files.

## Architecture Overview

**Folder Structure:**

- `products/images/` → Public images (ACL: public-read)
- `products/files/` → Protected files (Private, presigned URLs only)

**Access Control:**

- ✅ Images: Direct public URL access
- 🔒 Files: Presigned download URLs with expiration
- 🔐 Can add user authentication check before generating download URLs

## Steps to Implement Public Images & Protected Files

### **1. Install Required Dependencies**

```bash
# In your server app
cd apps/server
bun add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
bun add -d @types/node
```

### **2. Set Up AWS S3 Configuration**

Create environment variables file `apps/server/.env`:

```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET_NAME=your-bucket-name
AWS_S3_PUBLIC_URL=https://your-bucket-name.s3.amazonaws.com
```

### **3. Create S3 Service Module**

Create `apps/server/src/lib/s3.ts`:

```typescript
import {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand,
    GetObjectCommand,
} from "@aws-sdk/client-s3";
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
    IMAGES: "products/images/", // Public images
    FILES: "products/files/", // Protected files/assets
} as const;

export interface UploadUrlResponse {
    uploadUrl: string;
    fileKey: string;
    publicUrl?: string; // Only for images
}

// Generate presigned URL for IMAGE upload (public)
export async function generateImageUploadUrl(
    fileName: string,
    fileType: string,
): Promise<UploadUrlResponse> {
    const fileExtension = fileName.split(".").pop();
    const fileKey = `${FOLDERS.IMAGES}${randomUUID()}.${fileExtension}`;

    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: fileKey,
        ContentType: fileType,
        ACL: "public-read", // Make image publicly accessible
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
}

// Generate presigned URL for FILE upload (protected)
export async function generateFileUploadUrl(
    fileName: string,
    fileType: string,
): Promise<UploadUrlResponse> {
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
}

// Generate presigned URL for FILE download (protected)
export async function generateFileDownloadUrl(
    fileKey: string,
    expiresIn: number = 3600, // 1 hour default
): Promise<string> {
    const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: fileKey,
    });

    const downloadUrl = await getSignedUrl(s3Client, command, {
        expiresIn,
    });

    return downloadUrl;
}

// Upload buffer directly for images (alternative method)
export async function uploadImageToS3(
    buffer: Buffer,
    fileName: string,
    contentType: string,
): Promise<string> {
    const fileExtension = fileName.split(".").pop();
    const fileKey = `${FOLDERS.IMAGES}${randomUUID()}.${fileExtension}`;

    await s3Client.send(
        new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: fileKey,
            Body: buffer,
            ContentType: contentType,
            ACL: "public-read",
        }),
    );

    return `${PUBLIC_URL}/${fileKey}`;
}

// Upload buffer directly for files (alternative method)
export async function uploadFileToS3(
    buffer: Buffer,
    fileName: string,
    contentType: string,
): Promise<string> {
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileKey = `${FOLDERS.FILES}${randomUUID()}-${sanitizedFileName}`;

    await s3Client.send(
        new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: fileKey,
            Body: buffer,
            ContentType: contentType,
            // Private by default
        }),
    );

    return fileKey; // Return key, not URL
}

// Delete file from S3 (works for both images and files)
export async function deleteFromS3(fileKey: string): Promise<void> {
    await s3Client.send(
        new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: fileKey,
        }),
    );
}
```

### **4. Add S3 Upload Procedures**

Create `apps/server/src/lib/procedures/upload.ts`:

```typescript
import { z } from "zod";
import { os } from "../orpc";
import {
    generateImageUploadUrl,
    generateFileUploadUrl,
    generateFileDownloadUrl,
} from "../s3";

// Schema for requesting IMAGE upload URL
const GenerateImageUploadUrlSchema = z.object({
    fileName: z.string().min(1, "File name is required"),
    fileType: z.string().min(1, "File type is required"),
    fileSize: z
        .number()
        .max(5 * 1024 * 1024, "Image size must be less than 5MB"),
});

// Schema for requesting FILE upload URL
const GenerateFileUploadUrlSchema = z.object({
    fileName: z.string().min(1, "File name is required"),
    fileType: z.string().min(1, "File type is required"),
    fileSize: z
        .number()
        .max(100 * 1024 * 1024, "File size must be less than 100MB"),
});

// Schema for requesting FILE download URL
const GenerateFileDownloadUrlSchema = z.object({
    fileKey: z.string().min(1, "File key is required"),
    expiresIn: z.number().optional().default(3600), // 1 hour default
});

// Generate presigned URL for IMAGE upload (public)
export const generateImageUpload = os
    .input(GenerateImageUploadUrlSchema)
    .handler(async (opt) => {
        const { fileName, fileType } = opt.input;

        // Validate file type
        const allowedTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp",
            "image/gif",
        ];
        if (!allowedTypes.includes(fileType)) {
            throw new Error(
                "Invalid file type. Only JPEG, PNG, WEBP, and GIF are allowed.",
            );
        }

        const uploadData = await generateImageUploadUrl(fileName, fileType);

        return {
            success: true,
            ...uploadData,
        };
    });

// Generate presigned URL for FILE upload (protected)
export const generateFileUpload = os
    .input(GenerateFileUploadUrlSchema)
    .handler(async (opt) => {
        const { fileName, fileType } = opt.input;

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
            throw new Error(
                "Invalid file type. Only PDF, ZIP, RAR, and TXT files are allowed.",
            );
        }

        const uploadData = await generateFileUploadUrl(fileName, fileType);

        return {
            success: true,
            ...uploadData,
        };
    });

// Generate presigned URL for FILE download (protected)
export const generateFileDownload = os
    .input(GenerateFileDownloadUrlSchema)
    .handler(async (opt) => {
        const { fileKey, expiresIn } = opt.input;

        // TODO: Add authorization check here
        // Verify that the user has permission to download this file

        const downloadUrl = await generateFileDownloadUrl(fileKey, expiresIn);

        return {
            success: true,
            downloadUrl,
        };
    });

export const uploadRouter = {
    generateImageUpload,
    generateFileUpload,
    generateFileDownload,
};
```

### **5. Update Database Schema**

Update your product schema to include files. In `apps/server/src/db/schema.ts` (or wherever your schema is):

```typescript
export const products = pgTable("products", {
    // ... existing fields
    image: text("image").notNull(),

    // Add files field - store as JSON array
    files: jsonb("files")
        .$type<
            {
                name: string;
                key: string;
                size: number;
                type: string;
            }[]
        >()
        .default([]),

    // ... rest of fields
});
```

### **6. Update Product Creation Schema**

Update `apps/server/src/lib/procedures/products.ts`:

```typescript
const CreateProductSchema = z.object({
    name: z.string().min(1, "Product name is required"),
    slug: z.string().min(1, "Slug is required"),
    description: z.string().min(1, "Description is required"),
    content: z.string().optional(),
    price: z.string().min(0, "Price must be positive"),
    originalPrice: z.string().min(0, "Original price must be positive"),
    discount: z.number().min(0).max(100).optional().default(0),
    platformId: z.string().min(1, "Platform is required"),
    categoryId: z.string().min(1, "Category is required"),
    image: z.string().url("Valid image URL is required"),
    files: z
        .array(
            z.object({
                name: z.string(),
                key: z.string(),
                size: z.number(),
                type: z.string(),
            }),
        )
        .optional()
        .default([]),
    author: z.string().min(1, "Author name is required"),
    authorId: z.string().min(1, "Author ID is required"),
    tags: z.array(z.string()).optional().default([]),
    isFeatured: z.boolean().optional().default(false),
    isNew: z.boolean().optional().default(false),
});

// Then in createProduct handler, include files in the insert
```

### **7. Add Image Upload Component**

Create `apps/web/src/components/image-upload.tsx`:

```typescript
"use client";

import React, { useState } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
}

export function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Step 1: Get presigned URL from your API
      const response = await fetch("/api/upload/generate-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get upload URL");
      }

      const { uploadUrl, publicUrl } = await response.json();

      // Step 2: Upload directly to S3
      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload file");
      }

      setUploadProgress(100);
      onChange(publicUrl);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemove = () => {
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        disabled={disabled || isUploading}
        className="hidden"
      />

      {!value ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition"
        >
          {isUploading ? (
            <div className="space-y-2">
              <Loader2 className="w-10 h-10 mx-auto animate-spin text-gray-400" />
              <p className="text-sm text-gray-500">Uploading... {uploadProgress}%</p>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="w-10 h-10 mx-auto text-gray-400" />
              <p className="text-sm text-gray-500">
                Click to upload product image
              </p>
              <p className="text-xs text-gray-400">PNG, JPG, WEBP up to 5MB</p>
            </div>
          )}
        </div>
      ) : (
        <div className="relative">
          <img
            src={value}
            alt="Product preview"
            className="w-full h-64 object-cover rounded-lg"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={handleRemove}
            disabled={disabled}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
```

### **8. Create File Upload Component**

Create `apps/web/src/components/file-upload.tsx`:

```typescript
"use client";

import React, { useState } from "react";
import { Upload, X, FileIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileData {
  name: string;
  key: string;
  size: number;
  type: string;
}

interface FileUploadProps {
  value: FileData[];
  onChange: (files: FileData[]) => void;
  disabled?: boolean;
  maxFiles?: number;
}

export function FileUpload({
  value = [],
  onChange,
  disabled,
  maxFiles = 5
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    if (value.length + selectedFiles.length > maxFiles) {
      alert(`You can only upload up to ${maxFiles} files`);
      return;
    }

    // Validate files
    for (const file of selectedFiles) {
      if (file.size > 100 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is 100MB`);
        return;
      }
    }

    try {
      setIsUploading(true);
      const uploadedFiles: FileData[] = [];

      for (const file of selectedFiles) {
        const fileId = Math.random().toString(36);
        setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));

        // Step 1: Get presigned URL
        const response = await fetch("/api/upload/generate-file-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: file.name,
            fileType: file.type || "application/octet-stream",
            fileSize: file.size,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to get upload URL for ${file.name}`);
        }

        const { uploadUrl, fileKey } = await response.json();

        // Step 2: Upload to S3
        const uploadResponse = await fetch(uploadUrl, {
          method: "PUT",
          body: file,
          headers: {
            "Content-Type": file.type || "application/octet-stream",
          },
        });

        if (!uploadResponse.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }

        setUploadProgress(prev => ({ ...prev, [fileId]: 100 }));

        uploadedFiles.push({
          name: file.name,
          key: fileKey,
          size: file.size,
          type: file.type || "application/octet-stream",
        });
      }

      onChange([...value, ...uploadedFiles]);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload files. Please try again.");
    } finally {
      setIsUploading(false);
      setUploadProgress({});
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = (index: number) => {
    const newFiles = [...value];
    newFiles.splice(index, 1);
    onChange(newFiles);
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        disabled={disabled || isUploading || value.length >= maxFiles}
        className="hidden"
      />

      {/* Upload Area */}
      {value.length < maxFiles && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition"
        >
          {isUploading ? (
            <div className="space-y-2">
              <Loader2 className="w-8 h-8 mx-auto animate-spin text-gray-400" />
              <p className="text-sm text-gray-500">Uploading files...</p>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="w-8 h-8 mx-auto text-gray-400" />
              <p className="text-sm text-gray-500">
                Click to upload product files
              </p>
              <p className="text-xs text-gray-400">
                PDF, ZIP, RAR up to 100MB ({value.length}/{maxFiles} files)
              </p>
            </div>
          )}
        </div>
      )}

      {/* File List */}
      {value.length > 0 && (
        <div className="space-y-2">
          {value.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <FileIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemove(index)}
                disabled={disabled}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### **9. Set Up ORPC Client in Frontend**

Add the upload router to your main server router in `apps/server/src/routers/index.ts`:

```typescript
import { uploadRoute } from "../lib/procedures/upload";

export const appRouter = {
    // ... other routes
    upload: uploadRoute,
};

export type AppRouter = typeof appRouter;
```

The ORPC client should already be set up in your web app. Verify `apps/web/src/utils/orpc.ts`:

```typescript
import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { appRouter } from "../../../server/src/routers/index";
import type { RouterClient } from "@orpc/server";

export const link = new RPCLink({
    url: `${process.env.NEXT_PUBLIC_SERVER_URL}/rpc`,
    fetch(url, options) {
        return fetch(url, {
            ...options,
            credentials: "include",
        });
    },
});

export const client: RouterClient<typeof appRouter> = createORPCClient(link);
```

Now you can call upload procedures directly from components:

```typescript
import { client } from "@/utils/orpc";

// Generate image upload URL
const result = await client.upload.generateImageUpload({
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
});

// Generate file upload URL
const result = await client.upload.generateFileUpload({
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
});

// Generate file download URL
const result = await client.upload.generateFileDownload({
    fileKey: fileKey,
    expiresIn: 300,
});
```

### **10. Protected File Downloads are Already Configured**

The `generateFileDownload` procedure in `apps/server/src/lib/procedures/upload.ts` is already set up to handle protected downloads. You can call it directly from your components:

```typescript
import { client } from "@/utils/orpc";

// Request a protected download URL
const result = await client.upload.generateFileDownload({
    fileKey: "products/files/abc123-myfile.zip",
    expiresIn: 300, // 5 minutes
});

if (result.success) {
    window.open(result.downloadUrl, "_blank");
}
```

**Add Authorization Logic:**

Update `apps/server/src/lib/procedures/upload.ts` to add authentication and purchase verification:

```typescript
export const generateFileDownload = os
    .input(GenerateFileDownloadUrlSchema)
    .handler(async (opt) => {
        const { fileKey, expiresIn } = opt.input;

        // Add authorization check here
        // 1. Check if user is authenticated
        const user = opt.context.session?.user;
        if (!user) {
            throw new Error("You must be logged in to download files");
        }

        // 2. Extract productId from fileKey and verify purchase
        // const productId = extractProductIdFromFileKey(fileKey);
        // const hasPurchased = await checkUserPurchase(user.id, productId);
        // if (!hasPurchased) {
        //   throw new Error("You must purchase this product before downloading");
        // }

        const downloadUrl = await generateFileDownloadUrl(fileKey, expiresIn);

        return {
            success: true,
            downloadUrl,
        };
    });
```

### **11. Update Image Upload Component to Use ORPC**

Update `apps/web/src/components/ImageUploader.tsx`:

```typescript
"use client";

import React, { useState } from "react";
import { AlertCircleIcon, ImageUpIcon, XIcon } from "lucide-react";
import { client } from "@/utils/orpc";

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

    const handleFileSelect = async (file: File) => {
        setError(null);

        // Validate file type
        if (!file.type.startsWith("image/")) {
            setError("Please select an image file");
            return;
        }

        // Validate file size
        if (file.size > maxSize) {
            setError(`File size must be less than ${maxSizeMB}MB`);
            return;
        }

        try {
            setIsUploading(true);

            // Step 1: Get presigned URL from ORPC
            const result = await client.upload.generateImageUpload({
                fileName: file.name,
                fileType: file.type,
                fileSize: file.size,
            });

            if (!result.success || !result.uploadUrl || !result.publicUrl) {
                throw new Error("Failed to get upload URL");
            }

            // Step 2: Upload directly to S3
            const uploadResponse = await fetch(result.uploadUrl, {
                method: "PUT",
                body: file,
                headers: {
                    "Content-Type": file.type,
                },
            });

            if (!uploadResponse.ok) {
                throw new Error("Failed to upload file");
            }

            // Update the value with public URL
            onChange(result.publicUrl);
        } catch (error) {
            console.error("Upload error:", error);
            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to upload image. Please try again.",
            );
        } finally {
            setIsUploading(false);
        }
    };

    // ... rest of the component (drag/drop handlers, etc.)
}
```

### **12. Create File Upload Component Using ORPC**

Create `apps/web/src/components/FileUpload.tsx`:

```typescript
"use client";

import React, { useState } from "react";
import { Upload, X, FileIcon, Loader2, AlertCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { client } from "@/utils/orpc";

interface FileData {
    name: string;
    key: string;
    size: number;
    type: string;
}

interface FileUploadProps {
    value: FileData[];
    onChange: (files: FileData[]) => void;
    disabled?: boolean;
    maxFiles?: number;
}

export function FileUpload({
    value = [],
    onChange,
    disabled,
    maxFiles = 5,
}: FileUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || []);
        if (selectedFiles.length === 0) return;

        setError(null);

        if (value.length + selectedFiles.length > maxFiles) {
            setError(`You can only upload up to ${maxFiles} files`);
            return;
        }

        try {
            setIsUploading(true);
            const uploadedFiles: FileData[] = [];

            for (const file of selectedFiles) {
                // Step 1: Get presigned URL from ORPC
                const result = await client.upload.generateFileUpload({
                    fileName: file.name,
                    fileType: file.type || "application/octet-stream",
                    fileSize: file.size,
                });

                if (!result.success || !result.uploadUrl || !result.fileKey) {
                    throw new Error(
                        `Failed to get upload URL for ${file.name}`,
                    );
                }

                // Step 2: Upload to S3
                const uploadResponse = await fetch(result.uploadUrl, {
                    method: "PUT",
                    body: file,
                    headers: {
                        "Content-Type": file.type || "application/octet-stream",
                    },
                });

                if (!uploadResponse.ok) {
                    throw new Error(`Failed to upload ${file.name}`);
                }

                uploadedFiles.push({
                    name: file.name,
                    key: result.fileKey,
                    size: file.size,
                    type: file.type || "application/octet-stream",
                });
            }

            onChange([...value, ...uploadedFiles]);
        } catch (error) {
            console.error("Upload error:", error);
            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to upload files.",
            );
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    // ... rest of the component
}
```

### **13. Update Product Form**

Update the form in `apps/web/src/app/dashboard/products/create/page.tsx`:

```typescript
import { ImageUpload } from "@/components/image-upload";
import { FileUpload } from "@/components/file-upload";

// Update FormData interface
interface ProductFormData {
  // ... existing fields
  image: string;
  files: Array<{
    name: string;
    key: string;
    size: number;
    type: string;
  }>;
}

// Initialize with empty array
const [formData, setFormData] = React.useState<ProductFormData>({
  // ... other fields
  image: "",
  files: [],
});

// In your form JSX:
<div>
  <label className="block text-sm font-medium mb-2">
    Product Image
  </label>
  <ImageUpload
    value={formData.image}
    onChange={(url) => handleInputChange("image", url)}
    disabled={isLoading}
  />
  {errors.image && (
    <p className="text-sm text-red-500 mt-1">{errors.image}</p>
  )}
</div>

<div>
  <label className="block text-sm font-medium mb-2">
    Product Files (Assets/Downloads)
  </label>
  <FileUpload
    value={formData.files}
    onChange={(files) => handleInputChange("files", files)}
    disabled={isLoading}
    maxFiles={5}
  />
</div>
```

### **14. Configure S3 Bucket Policy**

Create this bucket policy to make images public but keep files private:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadImages",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::your-bucket-name/products/images/*"
        },
        {
            "Sid": "DenyPublicReadFiles",
            "Effect": "Deny",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::your-bucket-name/products/files/*"
        }
    ]
}
```

Apply via AWS Console or CLI:

```bash
aws s3api put-bucket-policy --bucket your-bucket-name --policy file://bucket-policy.json
```

### **15. Configure S3 Bucket CORS**

Add CORS configuration to your S3 bucket:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["PUT", "POST", "GET"],
        "AllowedOrigins": ["http://localhost:3000", "https://yourdomain.com"],
        "ExposeHeaders": ["ETag"],
        "MaxAgeSeconds": 3000
    }
]
```

Apply via AWS Console or CLI:

```bash
aws s3api put-bucket-cors --bucket your-bucket-name --cors-configuration file://cors.json
```

### **16. Configure S3 Bucket to Block Public Access (Optional)**

For extra security on files, ensure Block Public Access settings are configured:

1. Go to AWS S3 Console
2. Select your bucket
3. Go to "Permissions" tab
4. Edit "Block public access" settings
5. Keep "Block public ACLs" OFF (so images can be public)
6. The bucket policy will control access

---

## How It Works

### Image Upload Flow:

1. User selects image in `ImageUpload` component
2. Frontend calls `client.upload.generateImageUpload()` via ORPC
3. Server generates presigned URL with `ACL: public-read`
4. Frontend uploads directly to S3 using presigned URL
5. Server returns public URL
6. Public URL is saved in database
7. Images are accessible via direct URL

### File Upload Flow:

1. User selects files in `FileUpload` component
2. Frontend calls `client.upload.generateFileUpload()` via ORPC
3. Server generates presigned URL without public ACL (private)
4. Frontend uploads directly to S3
5. Server returns file key (not public URL)
6. File key is saved in database
7. Files require presigned download URLs to access

### File Download Flow:

1. User clicks download button
2. Frontend calls `client.upload.generateFileDownload()` via ORPC
3. Server verifies user authentication/authorization
4. Server generates presigned download URL (expires in 5 minutes)
5. Frontend opens presigned URL in new tab
6. S3 serves the file
7. Server verifies user authentication/
