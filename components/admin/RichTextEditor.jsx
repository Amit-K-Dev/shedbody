"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";

import {
  Bold,
  Italic,
  Strikethrough,
  Underline as UnderlineIcon,
  Highlighter,
  List,
  ListOrdered,
  Quote,
  Table as TableIcon,
  Trash2,
  SplitSquareHorizontal,
  SplitSquareVertical,
  MinusSquare,
  XSquare,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link as LinkIcon,
  Unlink,
  Image as ImageIcon,
  Code,
  ChevronDown,
} from "lucide-react";
import { useEffect, useCallback } from "react";

const lowlight = createLowlight(common);

const MenuBar = ({ editor }) => {
  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter URL", previousUrl);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const addImage = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("Enter Image URL");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  if (!editor) return null;

  const btnClass = (isActive) =>
    `p-2 rounded-md transition ${isActive ? "bg-emerald-500/20 text-emerald-400" : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"}`;

  // Current Heading Level nikalne ke liye
  const getCurrentHeading = () => {
    if (editor.isActive("heading", { level: 1 })) return "1";
    if (editor.isActive("heading", { level: 2 })) return "2";
    if (editor.isActive("heading", { level: 3 })) return "3";
    if (editor.isActive("heading", { level: 4 })) return "4";
    if (editor.isActive("heading", { level: 5 })) return "5";
    if (editor.isActive("heading", { level: 6 })) return "6";
    return "0";
  };

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 bg-zinc-950/50 border-b border-zinc-800 rounded-t-xl sticky top-0 z-10 backdrop-blur-md">
      {/* HEADINGS DROPDOWN */}
      <div className="relative flex items-center pr-2 border-r border-zinc-800">
        <select
          value={getCurrentHeading()}
          onChange={(e) => {
            const level = parseInt(e.target.value);
            if (level === 0) editor.chain().focus().setParagraph().run();
            else editor.chain().focus().toggleHeading({ level }).run();
          }}
          className="bg-zinc-900 text-zinc-300 text-xs font-bold py-2 pl-3 pr-8 rounded-md border border-zinc-800 focus:outline-none focus:border-emerald-500/50 appearance-none cursor-pointer"
        >
          <option value="0">Paragraph</option>
          <option value="1">Heading 1</option>
          <option value="2">Heading 2</option>
          <option value="3">Heading 3</option>
          <option value="4">Heading 4</option>
          <option value="5">Heading 5</option>
          <option value="6">Heading 6</option>
        </select>
        <ChevronDown
          size={14}
          className="absolute right-4 text-zinc-500 pointer-events-none"
        />
      </div>

      {/* TEXT FORMATTING */}
      <div className="flex items-center gap-1 px-2 border-r border-zinc-800">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={btnClass(editor.isActive("bold"))}
          title="Bold"
        >
          <Bold size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={btnClass(editor.isActive("italic"))}
          title="Italic"
        >
          <Italic size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={btnClass(editor.isActive("underline"))}
          title="Underline"
        >
          <UnderlineIcon size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          className={btnClass(editor.isActive("highlight"))}
          title="Highlight"
        >
          <Highlighter size={16} />
        </button>
      </div>

      {/* ALIGNMENT */}
      <div className="flex items-center gap-1 px-2 border-r border-zinc-800">
        <button
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={btnClass(editor.isActive({ textAlign: "left" }))}
          title="Align Left"
        >
          <AlignLeft size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={btnClass(editor.isActive({ textAlign: "center" }))}
          title="Align Center"
        >
          <AlignCenter size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={btnClass(editor.isActive({ textAlign: "right" }))}
          title="Align Right"
        >
          <AlignRight size={16} />
        </button>
      </div>

      {/* LISTS & CODE */}
      <div className="flex items-center gap-1 px-2 border-r border-zinc-800">
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={btnClass(editor.isActive("bulletList"))}
          title="Bullet List"
        >
          <List size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={btnClass(editor.isActive("orderedList"))}
          title="Numbered List"
        >
          <ListOrdered size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={btnClass(editor.isActive("codeBlock"))}
          title="Code Block"
        >
          <Code size={16} />
        </button>
      </div>

      {/* MEDIA & LINKS */}
      <div className="flex items-center gap-1 px-2 border-r border-zinc-800">
        <button
          onClick={setLink}
          className={btnClass(editor.isActive("link"))}
          title="Add Link"
        >
          <LinkIcon size={16} />
        </button>
        <button
          onClick={addImage}
          className={btnClass(false)}
          title="Add Image URL"
        >
          <ImageIcon size={16} />
        </button>
      </div>

      {/* TABLE CONTROLS */}
      <div className="flex items-center gap-1 pl-2">
        <button
          onClick={() =>
            editor
              .chain()
              .focus()
              .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              .run()
          }
          className={btnClass(editor.isActive("table"))}
          title="Insert Table"
        >
          <TableIcon size={16} />
        </button>

        {editor.isActive("table") && (
          <div className="flex items-center gap-1 ml-2 bg-emerald-500/10 p-1 rounded-lg border border-emerald-500/20 animate-in fade-in zoom-in-95">
            <button
              onClick={() => editor.chain().focus().addColumnAfter().run()}
              className="p-1.5 text-emerald-400 hover:bg-emerald-500/20 rounded"
            >
              <SplitSquareVertical size={14} />
            </button>
            <button
              onClick={() => editor.chain().focus().addRowAfter().run()}
              className="p-1.5 text-emerald-400 hover:bg-emerald-500/20 rounded"
            >
              <SplitSquareHorizontal size={14} />
            </button>
            <button
              onClick={() => editor.chain().focus().deleteTable().run()}
              className="p-1.5 text-red-500 hover:bg-red-500/20 rounded"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default function RichTextEditor({ content, onChange }) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Underline,
      Highlight.configure({ multicolor: true }),
      Image.configure({ inline: true, allowBase64: true }),
      Link.configure({ openOnClick: false, autolink: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({
        placeholder: "Start writing your amazing article here...",
      }),
      CodeBlockLowlight.configure({ lowlight }),
    ],
    content: content || "",
    editorProps: {
      attributes: {
        className:
          "prose prose-invert prose-emerald prose-lg max-w-none focus:outline-none min-h-[500px] p-10 text-zinc-300",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  return (
    <div className="flex flex-col bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-inner focus-within:ring-2 focus-within:ring-emerald-500/50 transition-all">
      <MenuBar editor={editor} />
      <div className="editor-container overflow-y-auto max-h-187.5 custom-scrollbar bg-zinc-900/30">
        <EditorContent editor={editor} />
      </div>

      <style jsx global>{`
        .ProseMirror table {
          border-collapse: collapse;
          table-layout: fixed;
          width: 100%;
          margin: 24px 0;
          overflow: hidden;
        }
        .ProseMirror table td,
        .ProseMirror table th {
          min-width: 1em;
          border: 1px solid #3f3f46;
          padding: 12px;
          vertical-align: top;
          box-sizing: border-box;
          position: relative;
        }
        .ProseMirror table th {
          font-weight: bold;
          text-align: left;
          background-color: #18181b;
          color: #10b981;
        }
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #52525b;
          pointer-events: none;
          height: 0;
        }
        .ProseMirror img {
          max-width: 100%;
          height: auto;
          border-radius: 0.75rem;
          margin: 32px 0;
        }
        .ProseMirror a {
          color: #10b981;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
