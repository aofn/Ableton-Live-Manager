"use client";

import "./styles.scss";

import { Color } from "@tiptap/extension-color";
import ListItem from "@tiptap/extension-list-item";
import TextStyle from "@tiptap/extension-text-style";
import { EditorProvider, useCurrentEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import React from "react";
import { Button } from "@/components/ui/button";

import Placeholder from "@tiptap/extension-placeholder";
import { Image } from "@tiptap/extension-image";

//@TODO Headlines not working for some reason.
const EditorButton = ({
  onClick,
  disabled,
  className,
  isActive,
  children,
  title,
}) => (
  <Button
    variant="ghost"
    onClick={onClick}
    disabled={disabled}
    active={isActive}
    className={className}
    title={title}
  >
    {children}
  </Button>
);

const MenuBar = () => {
  const { editor } = useCurrentEditor();

  if (!editor) {
    return null;
  }

  return (
    <section className="">
      <EditorButton
        variant="outline"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={editor.isActive("bold") ? "bg-accent" : ""}
        title="Toggle bold"
      >
        <i className={"ri-bold"} />
      </EditorButton>
      <EditorButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={editor.isActive("italic") ? "bg-accent" : ""}
        title="Toggle italic"
      >
        <i className="ri-italic" />
      </EditorButton>
      <EditorButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={editor.isActive("strike") ? "bg-accent" : ""}
        title="Toggle strikethrough"
      >
        <i className="ri-strikethrough" />
      </EditorButton>
      <EditorButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        disabled={!editor.can().chain().focus().toggleCode().run()}
        className={editor.isActive("code") ? "bg-accent" : ""}
        title="Toggle code"
      >
        <i className="ri-code-s-slash-line"></i>
      </EditorButton>
      <EditorButton
        title="Set paragraph"
        onClick={() => editor.chain().focus().setParagraph().run()}
        className={editor.isActive("paragraph") ? "bg-accent" : ""}
      >
        <i className="ri-paragraph" />
      </EditorButton>
      <EditorButton
        title="Toggle heading level 1"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={editor.isActive("heading", { level: 1 }) ? "bg-accent" : ""}
      >
        <i className="ri-h-1" />
      </EditorButton>
      <EditorButton
        title="Toggle heading level 2"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={editor.isActive("heading", { level: 2 }) ? "bg-accent" : ""}
      >
        <i className="ri-h-2" />
      </EditorButton>
      <EditorButton
        title="Add bullet list"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive("bulletList") ? "bg-accent" : ""}
      >
        <i className="ri-list-unordered" />
      </EditorButton>
      <EditorButton
        title="Add ordered list"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={editor.isActive("orderedList") ? "bg-accent" : ""}
      >
        <i className="ri-list-ordered" />
      </EditorButton>
      <EditorButton
        title="Toggle blockquote"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={editor.isActive("blockquote") ? "bg-accent" : ""}
      >
        <i className="ri-double-quotes-r"></i>
      </EditorButton>
      <EditorButton
        title="Add horizontal line"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      >
        <i className="ri-separator"></i>
      </EditorButton>
      <EditorButton
        title="Undo"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
      >
        <i className="ri-arrow-go-back-line"></i>
      </EditorButton>
      <EditorButton
        title="Redo"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
      >
        <i className="ri-arrow-go-forward-line"></i>
      </EditorButton>
    </section>
  );
};

const extensions = [
  Color.configure({ types: [TextStyle.name, ListItem.name] }),
  TextStyle.configure({ types: [ListItem.name] }),
  StarterKit.configure({
    bulletList: {
      keepMarks: true,
      keepAttributes: false, // TODO : Making this as `false` becase marks are not preserved when I try to preserve attrs, awaiting a bit of help
    },
    orderedList: {
      keepMarks: true,
      keepAttributes: false, // TODO : Making this as `false` becase marks are not preserved when I try to preserve attrs, awaiting a bit of help
    },
  }),
  Placeholder.configure({
    placeholder: "Write something …",
  }),
  Image,
];

const Editor = ({ onSave, content }) => {
  return (
    <EditorProvider
      slotBefore={<MenuBar />}
      extensions={extensions}
      onUpdate={(editor) => {
        onSave(editor.editor.getHTML());
      }}
      editorProps={{
        attributes: {
          class: "h-full min-h-[300px] focus:outline-none p-3",
        },
      }}
      content={content}
    ></EditorProvider>
  );
};

export default Editor;
