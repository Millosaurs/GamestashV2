"use client";

import * as React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Heading from "@tiptap/extension-heading";
import CodeBlock from "@tiptap/extension-code-block";
import Image from "@tiptap/extension-image";
import { mergeAttributes } from "@tiptap/core";
import imageCompression from "browser-image-compression";
import "./rich-text-editor.css";

import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link2,
  Heading1,
  Heading2,
  Heading3,
  ImageIcon,
  Loader2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { orpc } from "@/utils/orpc";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  error?: boolean;
}

const CustomHeading = Heading.extend({
  renderHTML({ node, HTMLAttributes }) {
    const level = node.attrs.level ?? 1;
    const style =
      level === 1
        ? "font-size:1.75rem; font-weight:800; margin-top:1rem; margin-bottom:0.5rem;"
        : level === 2
        ? "font-size:1.375rem; font-weight:700; margin-top:0.9rem; margin-bottom:0.45rem;"
        : "font-size:1.125rem; font-weight:600; margin-top:0.7rem; margin-bottom:0.35rem;";
    return ["h" + level, mergeAttributes(HTMLAttributes, { style }), 0];
  },
}).configure({ levels: [1, 2, 3] });

const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      'data-file-key': {
        default: null,
        parseHTML: element => element.getAttribute('data-file-key'),
        renderHTML: attributes => {
          if (!attributes['data-file-key']) {
            return {};
          }
          return {
            'data-file-key': attributes['data-file-key'],
          };
        },
      },
    };
  },
  addNodeView() {
    return ({ node, getPos, editor }) => {
      const wrapper = document.createElement('div');
      wrapper.classList.add('image-wrapper-container');
      wrapper.style.cssText = 'position: relative; display: inline-block; margin: 1rem 0; max-width: 100%;';

      const img = document.createElement('img');
      img.src = node.attrs.src;
      img.alt = node.attrs.alt || '';
      img.className = 'rounded-lg max-w-full h-auto';
      if (node.attrs['data-file-key']) {
        img.setAttribute('data-file-key', node.attrs['data-file-key']);
      }

      const deleteBtn = document.createElement('button');
      deleteBtn.type = 'button';
      deleteBtn.contentEditable = 'false';
      deleteBtn.className = 'delete-image-btn';
      deleteBtn.style.cssText = 'position: absolute; top: 0.5rem; right: 0.5rem; background-color: rgb(0 0 0 / 0.5); border: none; border-radius: 0.375rem; padding: 0.375rem; cursor: pointer; opacity: 0; transition: opacity 0.2s; z-index: 10; display: flex; align-items: center; justify-content: center; box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);';
      deleteBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgb(239, 68, 68)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';

      deleteBtn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
      });

      deleteBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const fileKey = img.getAttribute('data-file-key');
        const src = img.src;

        if (typeof getPos === 'function') {
          const pos = getPos();
          (window as any).__deleteImageFromEditor?.({ src, fileKey, pos, editor });
        }
      });
      wrapper.addEventListener('mouseenter', () => {
        deleteBtn.style.opacity = '1';
      });

      wrapper.addEventListener('mouseleave', () => {
        deleteBtn.style.opacity = '0';
      });



      wrapper.appendChild(img);
      wrapper.appendChild(deleteBtn);

      return {
        dom: wrapper,
        contentDOM: null,
      };
    };
  },
});

export function RichTextEditor({
  content,
  onChange,
  placeholder = "Write your product description...",
  className,
  error = false,
}: RichTextEditorProps) {
  const [isUploading, setIsUploading] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [imageToDelete, setImageToDelete] = React.useState<{
    src: string;
    fileKey: string | null;
    pos: number;
    editor: any;
  } | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Mutation for generating presigned URL
  const generateUrlMutation = useMutation({
    ...orpc.upload.generateImageUpload.mutationOptions(),
  });

  // Mutation for deleting images from S3
  const deleteImageMutation = useMutation({
    ...orpc.upload.deleteImage.mutationOptions(),
  });

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        link: false,
      }),
      CustomHeading,
      Placeholder.configure({
        placeholder,
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
        HTMLAttributes: {
          class: "text-primary underline cursor-pointer hover:text-primary/80",
        },
      }),
      CodeBlock.configure({
        HTMLAttributes: {
          class: "rounded-md bg-muted p-2 font-mono bg-secondary",
        },
      }),
      CustomImage.configure({
        HTMLAttributes: {
          class: "rounded-lg max-w-full h-auto",
        },
        inline: false,
        allowBase64: false,
      }),
    ],

    content,

    editorProps: {
      attributes: {
        class: cn(
          "min-h-[200px] px-4 py-3 focus:outline-none",
          "list-disc list-outside pl-6 marker:text-muted-foreground",
          "[&_ol]:list-decimal [&_ol]:pl-6 [&_ol>li]:my-1",
          "[&_ul]:list-disc [&_ul]:pl-6 [&_ul>li]:my-1",
          "text-foreground"
        ),
      },
    },

    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Update editor content when content prop changes
  React.useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [editor, content]);

  // Set up global delete handler
  React.useEffect(() => {
    if (!editor) return;

    (window as any).__deleteImageFromEditor = ({ src, fileKey, pos, editor: ed }: any) => {
      setImageToDelete({ src, fileKey, pos, editor: ed });
      setDeleteDialogOpen(true);
    };

    return () => {
      delete (window as any).__deleteImageFromEditor;
    };
  }, [editor]);

  // Handle confirmed deletion
  const handleConfirmDelete = async () => {
    if (!imageToDelete) return;

    const { src, fileKey, pos, editor: ed } = imageToDelete;

    try {
      // Extract file key from URL if not provided
      let key = fileKey;
      if (!key) {
        try {
          const url = new URL(src);
          key = url.pathname.substring(1);
        } catch (e) {
          console.error('Failed to parse URL:', e);
        }
      }

      if (key && key.startsWith('products/images/')) {
        toast.loading('Deleting image from S3...', { id: 'delete-image' });

        await deleteImageMutation.mutateAsync({ fileKey: key });

        toast.success('Image deleted from S3', { id: 'delete-image' });
      }

      // Remove image from editor
      const transaction = ed.state.tr.delete(pos, pos + 1);
      ed.view.dispatch(transaction);
    } catch (error) {
      console.error('Failed to delete image:', error);
      toast.error('Failed to delete image', {
        description: error instanceof Error ? error.message : 'Unknown error',
        id: 'delete-image',
      });
    } finally {
      setDeleteDialogOpen(false);
      setImageToDelete(null);
    }
  };

  const handleDeleteImage = async (src: string, fileKey: string | null) => {
    if (!editor) return;

    const confirmed = window.confirm('Are you sure you want to delete this image?');
    if (!confirmed) return;

    try {
      // Extract file key from URL if not provided
      let key = fileKey;
      if (!key) {
        const url = new URL(src);
        key = url.pathname.substring(1); // Remove leading slash
      }

      if (key && key.startsWith('products/images/')) {
        toast.loading('Deleting image from S3...', { id: 'delete-image' });

        await deleteImageMutation.mutateAsync({ fileKey: key });

        toast.success('Image deleted from S3', { id: 'delete-image' });
      }

      // Remove image from editor
      const { state } = editor;
      const { tr } = state;
      let deleted = false;

      state.doc.descendants((node, pos) => {
        if (node.type.name === 'image' && node.attrs.src === src) {
          tr.delete(pos, pos + node.nodeSize);
          deleted = true;
          return false;
        }
      });

      if (deleted) {
        editor.view.dispatch(tr);
      }
    } catch (error) {
      console.error('Failed to delete image:', error);
      toast.error('Failed to delete image', {
        description: error instanceof Error ? error.message : 'Unknown error',
        id: 'delete-image',
      });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !editor) return;

    const file = files[0];

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Invalid file type', {
        description: 'Please select an image file',
      });
      return;
    }

    // Validate file size (5MB before compression)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large', {
        description: 'Image size must be less than 5MB',
      });
      return;
    }

    setIsUploading(true);
    const toastId = 'image-upload';

    try {
      // Step 1: Compress image
      toast.loading('Compressing image...', { id: toastId });
      const originalSize = file.size;

      const compressionOptions = {
        maxSizeMB: 1, // Max file size in MB
        maxWidthOrHeight: 1920, // Max width or height
        useWebWorker: true,
        fileType: 'image/jpeg', // Convert to JPEG for better compression
      };

      const compressedFile = await imageCompression(file, compressionOptions);
      const compressedSize = compressedFile.size;
      const compressionRatio = ((1 - compressedSize / originalSize) * 100).toFixed(0);

      // Show compression result
      toast.loading(
        `Compressed: ${(originalSize / (1024 * 1024)).toFixed(2)}MB → ${(compressedSize / (1024 * 1024)).toFixed(2)}MB (${compressionRatio}% smaller)`,
        { id: toastId }
      );

      // Step 2: Get presigned URL from server
      await new Promise(resolve => setTimeout(resolve, 800)); // Brief pause to show compression result
      toast.loading('Requesting upload URL...', { id: toastId });

      const result = await generateUrlMutation.mutateAsync({
        fileName: file.name.replace(/\.[^/.]+$/, '.jpg'), // Change extension to .jpg
        fileType: 'image/jpeg',
        fileSize: compressedFile.size,
      });

      if (!result.success || !result.uploadUrl || !result.fileKey || !result.publicUrl) {
        throw new Error('Failed to get upload URL');
      }

      // Step 3: Upload compressed file to S3
      toast.loading('Uploading to S3...', { id: toastId });
      const uploadResponse = await fetch(result.uploadUrl, {
        method: 'PUT',
        body: compressedFile,
        headers: {
          'Content-Type': 'image/jpeg',
        },
      });

      if (!uploadResponse.ok) {
        throw new Error(`Failed to upload ${file.name}: ${uploadResponse.statusText}`);
      }

      // Step 4: Insert image into editor with file key at cursor position
      const { from } = editor.state.selection;
      editor
        .chain()
        .focus()
        .insertContentAt(from, {
          type: 'image',
          attrs: {
            src: result.publicUrl,
            alt: file.name,
            'data-file-key': result.fileKey,
          },
        })
        .run();

      toast.success(`Image uploaded! (${compressionRatio}% smaller)`, { id: toastId });
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Failed to upload image', {
        description: error instanceof Error ? error.message : 'Unknown error',
        id: toastId,
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const ToolbarButton = ({
    onClick,
    active,
    disabled,
    children,
    title,
  }: {
    onClick: () => void;
    active?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    title: string;
  }) => (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "h-8 w-8 p-0 rounded-xl transition-colors",
        active && "bg-accent text-accent-foreground",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      {children}
    </Button>
  );

  const setLink = React.useCallback(() => {
    if (!editor) return;
    const previousUrl = (editor.getAttributes("link") as any).href;
    const url = window.prompt("Enter URL:", previousUrl || "");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    const finalUrl = url.startsWith("http") ? url : `https://${url}`;
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: finalUrl })
      .run();
  }, [editor]);

  const triggerImageUpload = () => {
    fileInputRef.current?.click();
  };

  if (!editor) {
    return (
      <div
        className={cn(
          "border rounded-xl overflow-hidden bg-background",
          error && "border-destructive",
          className
        )}
      >
        <div className="flex items-center justify-center p-4 text-muted-foreground">
          Loading editor...
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "border rounded-xl overflow-hidden bg-background",
        error && "border-destructive",
        className
      )}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-muted/30">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          title="Bold (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          title="Italic (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive("strike")}
          disabled={!editor.can().chain().focus().toggleStrike().run()}
          title="Strikethrough"
        >
          <Strikethrough className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive("codeBlock")}
          title="Code Block"
        >
          <Code className="h-4 w-4" />
        </ToolbarButton>

        <div className="w-px h-6 bg-border mx-1" />

        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          active={editor.isActive("heading", { level: 1 })}
          disabled={
            !editor.can().chain().focus().toggleHeading({ level: 1 }).run()
          }
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          active={editor.isActive("heading", { level: 2 })}
          disabled={
            !editor.can().chain().focus().toggleHeading({ level: 2 }).run()
          }
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          active={editor.isActive("heading", { level: 3 })}
          disabled={
            !editor.can().chain().focus().toggleHeading({ level: 3 }).run()
          }
          title="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>

        <div className="w-px h-6 bg-border mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          disabled={!editor.can().chain().focus().toggleBulletList().run()}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          disabled={!editor.can().chain().focus().toggleOrderedList().run()}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>

        <div className="w-px h-6 bg-border mx-1" />

        <ToolbarButton
          onClick={setLink}
          active={editor.isActive("link")}
          title="Add/Edit Link"
        >
          <Link2 className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={triggerImageUpload}
          disabled={isUploading}
          title="Upload Image"
        >
          <ImageIcon className="h-4 w-4" />
        </ToolbarButton>

        <div className="w-px h-6 bg-border mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
          title="Undo (Ctrl+Z)"
        >
          <Undo className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
          title="Redo (Ctrl+Shift+Z)"
        >
          <Redo className="h-4 w-4" />
        </ToolbarButton>
      </div>

      <EditorContent editor={editor} />

      {isUploading && (
        <div className="px-4 py-2 bg-muted/50 text-sm text-muted-foreground border-t">
          <div className="flex items-center gap-2">
            <Loader2 className="h-3 w-3 animate-spin" />
            Compressing and uploading image...
          </div>
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Image</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this image? This will remove the image from S3 storage and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setImageToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
