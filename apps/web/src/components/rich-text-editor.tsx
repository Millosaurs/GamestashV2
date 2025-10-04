"use client";

import * as React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Heading from "@tiptap/extension-heading";
import CodeBlock from "@tiptap/extension-code-block";
import Blockquote from "@tiptap/extension-blockquote";
import { mergeAttributes } from "@tiptap/core";

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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  error?: boolean;
}

const CustomHeading = Heading.extend({
  // render HTML and inject inline styles per level so CSS cascade can't flatten them
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

export function RichTextEditor({
  content,
  onChange,
  placeholder = "Write your product description...",
  className,
  error = false,
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      // disable the built-in heading so our custom heading takes over
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
    ],

    content,

    // keep wrapper simple — avoid `prose-sm` / heavy typography that flattens headings
    editorProps: {
      attributes: {
        class: cn(
          "min-h-[200px] px-4 py-3 focus:outline-none",
          // You can re-add `prose` if you want, but if it flattens headings remove it.
          // "prose max-w-none",
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

  // toolbar button
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
    </div>
  );
}
