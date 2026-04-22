"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { uploadImage } from "@/lib/supabase/upload";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  ImageIcon,
} from "lucide-react";

const MenuBar = ({ editor }) => {
  if (!editor) return null;

  // Toolbar button styling helper
  const btnClass = (isActive) =>
    `p-2 rounded-md transition-colors ${
      isActive
        ? "bg-emerald-500/20 text-emerald-400"
        : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
    }`;

  // Image Upload Logic
  const addImage = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        // Supabase storage me upload karo
        const url = await uploadImage(file);

        if (url) {
          // Upload hote hi editor me photo dikha do
          editor.chain().focus().setImage({ src: url }).run();
        } else {
          alert("Image upload failed! Please check your connection.");
        }
      }
    };

    input.click();
  };

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 bg-zinc-900 border-b border-zinc-800 rounded-t-xl">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={btnClass(editor.isActive("bold"))}
        title="Bold"
      >
        <Bold size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={btnClass(editor.isActive("italic"))}
        title="Italic"
      >
        <Italic size={18} />
      </button>

      <div className="w-px h-6 bg-zinc-700 mx-1"></div>

      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={btnClass(editor.isActive("heading", { level: 2 }))}
        title="Heading 2"
      >
        <Heading2 size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={btnClass(editor.isActive("heading", { level: 3 }))}
        title="Heading 3"
      >
        <Heading3 size={18} />
      </button>

      <div className="w-px h-6 bg-zinc-700 mx-1"></div>

      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={btnClass(editor.isActive("bulletList"))}
        title="Bullet List"
      >
        <List size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={btnClass(editor.isActive("orderedList"))}
        title="Numbered List"
      >
        <ListOrdered size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={btnClass(editor.isActive("blockquote"))}
        title="Quote"
      >
        <Quote size={18} />
      </button>

      <div className="w-px h-6 bg-zinc-700 mx-1"></div>

      {/* IMAGE UPLOAD BUTTON */}
      <button
        onClick={addImage}
        className={btnClass(false)}
        title="Upload Image"
      >
        <ImageIcon size={18} />
      </button>

      <div className="w-px h-6 bg-zinc-700 mx-1"></div>

      <button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className="p-2 text-zinc-400 hover:text-zinc-100 disabled:opacity-30"
      >
        <Undo size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        className="p-2 text-zinc-400 hover:text-zinc-100 disabled:opacity-30"
      >
        <Redo size={18} />
      </button>
    </div>
  );
};

export default function RichTextEditor({ content, onChange }) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Image.configure({
        allowBase64: true,
        HTMLAttributes: {
          class:
            "rounded-xl border border-zinc-800 my-6 max-w-full h-auto shadow-lg",
        },
      }),
    ],
    content: content || "<p>Start writing your amazing article here...</p>",
    editorProps: {
      attributes: {
        class:
          "prose prose-invert prose-emerald max-w-none min-h-[400px] p-6 focus:outline-none bg-zinc-950 rounded-b-xl border border-t-0 border-zinc-800",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  return (
    <div className="flex flex-col shadow-xl">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
