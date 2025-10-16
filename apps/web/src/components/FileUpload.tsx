"use client";

import React, { useState } from "react";
import { Upload, X, FileIcon, Loader2, AlertCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { orpc } from "@/utils/orpc";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

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

  // Mutation for generating presigned URL
  const generateUrlMutation = useMutation({
    ...orpc.upload.generateFileUpload.mutationOptions(),
  });

  // Mutation for deleting files from S3
  const deleteFileMutation = useMutation({
    ...orpc.upload.deleteFile.mutationOptions(),
  });

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    setError(null);

    if (value.length + selectedFiles.length > maxFiles) {
      const errorMsg = `You can only upload up to ${maxFiles} files`;
      setError(errorMsg);
      toast.error("Too many files", {
        description: errorMsg,
      });
      return;
    }

    // Validate files
    for (const file of selectedFiles) {
      if (file.size > 100 * 1024 * 1024) {
        const errorMsg = `File ${file.name} is too large. Maximum size is 100MB`;
        setError(errorMsg);
        toast.error("File too large", {
          description: errorMsg,
        });
        return;
      }
    }

    try {
      setIsUploading(true);
      const uploadedFiles: FileData[] = [];

      toast.loading(`Uploading ${selectedFiles.length} file(s)...`, { id: "file-upload" });

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];

        toast.loading(`Uploading ${file.name} (${i + 1}/${selectedFiles.length})...`, {
          id: "file-upload",
        });

        // Step 1: Get presigned URL from server
        const result = await generateUrlMutation.mutateAsync({
          fileName: file.name,
          fileType: file.type || "application/octet-stream",
          fileSize: file.size,
        });

        if (!result.success || !result.uploadUrl || !result.fileKey) {
          throw new Error(`Failed to get upload URL for ${file.name}`);
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
          const errorText = await uploadResponse.text().catch(() => "");
          if (errorText.includes("AccessDenied")) {
            throw new Error("Permission denied. Please check S3 bucket permissions.");
          }
          throw new Error(`Failed to upload ${file.name}: ${uploadResponse.statusText}`);
        }

        uploadedFiles.push({
          name: file.name,
          key: result.fileKey,
          size: file.size,
          type: file.type || "application/octet-stream",
        });
      }

      onChange([...value, ...uploadedFiles]);
      toast.success(
        `${selectedFiles.length} file(s) uploaded successfully!`,
        { id: "file-upload" }
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to upload files";
      setError(errorMessage);
      toast.error("Upload failed", {
        description: errorMessage,
        id: "file-upload",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = async (index: number) => {
    const removedFile = value[index];

    try {
      toast.loading(`Deleting ${removedFile.name}...`, { id: "delete-file" });

      await deleteFileMutation.mutateAsync({ fileKey: removedFile.key });

      const newFiles = [...value];
      newFiles.splice(index, 1);
      onChange(newFiles);

      toast.success(`${removedFile.name} deleted from S3`, { id: "delete-file" });
    } catch (error) {
      console.error("Failed to delete from S3:", error);
      toast.error("Failed to delete from S3", {
        description: error instanceof Error ? error.message : "Unknown error",
        id: "delete-file",
      });
    }
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

      {/* Error Display */}
      {error && (
        <div
          className="flex items-center gap-1 text-xs text-destructive"
          role="alert"
        >
          <AlertCircleIcon className="size-3 shrink-0" />
          <span>{error}</span>
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
