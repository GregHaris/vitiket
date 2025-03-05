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
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
          HTMLAttributes: {
            1: { class: 'text-4xl font-bold' },
            2: { class: 'text-2xl font-bold' },
            3: { class: 'text-xl font-bold' },
          },
        },
        bulletList: {
          HTMLAttributes: {
            class: 'list-disc ml-4',
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: 'list-decimal ml-4',
          },
        },
        blockquote: {
          HTMLAttributes: {
            class: 'border-l-4 border-gray-300 pl-4',
          },
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 underline',
        },
      }),
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'textarea p-regular-16',
      },
    },
  });

  return (
    <div className="bg-gray-100 border border-gray-300 rounded-md">
      <TextEditorMenuBar editor={editor} />
      <EditorContent
        editor={editor}
        className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl mx-auto focus:outline-none p-4"
      />
    </div>
  );
}
