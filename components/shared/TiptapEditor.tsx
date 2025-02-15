import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TextEditorMenuBar from './TextEditorMenuBar';

type TextEditorProps = {
  onChange: (content: string) => void;
  initialContent?: string;
};

export default function RichTextEditor({
  onChange,
  initialContent,
}: TextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit, Underline, Link],
    content: initialContent,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          'textarea p-regular-16'
      },
    },
    immediatelyRender: false,
  });
  return (
    <div className="bg-gray-100 border border-gray-300 rounded-md">
      <TextEditorMenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
