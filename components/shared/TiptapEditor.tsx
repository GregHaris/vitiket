import { useEditor, EditorContent } from '@tiptap/react';
import BulletList from '@tiptap/extension-bullet-list';
import Document from '@tiptap/extension-document';
import Heading from '@tiptap/extension-heading';
import Link from '@tiptap/extension-link';
import ListItem from '@tiptap/extension-list-item';
import OrderedList from '@tiptap/extension-ordered-list';
import Paragraph from '@tiptap/extension-paragraph';
import StarterKit from '@tiptap/starter-kit';
import Text from '@tiptap/extension-text';
import TextEditorMenuBar from './TextEditorMenuBar';
import Underline from '@tiptap/extension-underline';

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
      Document,
      Paragraph,
      Text,
      BulletList,
      ListItem,
      OrderedList,
      Heading.configure({
        levels: [1, 2, 3],
      }),
      StarterKit,
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
    // Set immediatelyRender to false to avoid SSR hydration mismatch
    immediatelyRender: false,
  });

  return (
    <div className="bg-gray-100 border border-gray-300 rounded-md">
      <TextEditorMenuBar editor={editor} />
      <EditorContent
        editor={editor}
        className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none p-1"
      />
    </div>
  );
}
