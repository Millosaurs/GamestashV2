"use client";

import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/core";
import React, { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { client } from "@/utils/orpc";
import { toast } from "sonner";
import { extractFileKeyFromUrl } from "./tiptap-image-upload";

// React component for the image node view with delete button
const ImageComponent = ({ node, deleteNode, editor }: NodeViewProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const src = node.attrs.src;
    if (!src) {
      deleteNode();
      return;
    }

    try {
      setIsDeleting(true);

      // Extract file key from S3 URL
      const fileKey = extractFileKeyFromUrl(src);

      if (fileKey && fileKey.startsWith("products/images/")) {
        // Delete from S3
        toast.loading("Deleting image from S3...", { id: "delete-image" });

        await client.upload.deleteImage({
          fileKey,
        });

        toast.success("Image deleted from S3", { id: "delete-image" });
      }

      // Remove node from editor
      deleteNode();
    } catch (error) {
      console.error("Failed to delete image:", error);
      toast.error("Failed to delete image", {
        description: error instanceof Error ? error.message : "Unknown error",
        id: "delete-image",
      });

      // Still remove from editor even if S3 deletion fails
      deleteNode();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <NodeViewWrapper className="relative inline-block my-4 group">
      <div
        className="relative inline-block"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <img
          src={node.attrs.src}
          alt={node.attrs.alt || ""}
          title={node.attrs.title || ""}
          className="rounded-lg max-w-full h-auto transition-all duration-200"
          style={{
            opacity: isDeleting ? 0.5 : 1,
          }}
        />

        {/* Delete button - shows on hover */}
        {(isHovered || isDeleting) && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="absolute top-2 right-2 z-10 flex items-center justify-center w-8 h-8 bg-black/70 hover:bg-black/90 text-white rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Delete image"
            type="button"
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <X className="w-4 h-4" />
            )}
          </button>
        )}

        {/* Overlay when deleting */}
        {isDeleting && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
            <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-2 rounded-md shadow-lg">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span className="text-sm font-medium">Deleting...</span>
            </div>
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
};

// Custom Image extension with React Node View
export const CustomImage = Node.create({
  name: "image",

  group: "block",

  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: (element) => element.getAttribute("src"),
        renderHTML: (attributes) => {
          if (!attributes.src) {
            return {};
          }
          return {
            src: attributes.src,
          };
        },
      },
      alt: {
        default: null,
        parseHTML: (element) => element.getAttribute("alt"),
        renderHTML: (attributes) => {
          if (!attributes.alt) {
            return {};
          }
          return {
            alt: attributes.alt,
          };
        },
      },
      title: {
        default: null,
        parseHTML: (element) => element.getAttribute("title"),
        renderHTML: (attributes) => {
          if (!attributes.title) {
            return {};
          }
          return {
            title: attributes.title,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "img[src]",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["img", mergeAttributes(HTMLAttributes)];
  },

  addCommands() {
    return {
      setImage:
        (options: { src: string; alt?: string; title?: string }) =>
        ({ commands }: { commands: any }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    } as any;
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageComponent);
  },
});
