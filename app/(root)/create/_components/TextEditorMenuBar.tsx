import { BiUndo, BiRedo } from "react-icons/bi";
import { BsTypeUnderline } from "react-icons/bs";
import { Editor } from "@tiptap/react";
import { IoListOutline } from "react-icons/io5";
import {
  RiBold,
  RiItalic,
  RiStrikethrough,
  RiListOrdered2,
  RiDoubleQuotesL,
  RiH1,
  RiH2,
  RiH3,
  RiLink,
} from "react-icons/ri";

const Button = ({
  onClick,
  isActive,
  disabled,
  children,
  className,
  title,
}: {
  onClick: () => void;
  isActive: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
  title: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`p-2 ${
      isActive ? "bg-primary text-white rounded-md" : ""
    } ${className}`}
    title={title}
  >
    {children}
  </button>
);

export default function TextEditorMenuBar({
  editor,
}: {
  editor: Editor | null;
}) {
  if (!editor) return null;

  const buttons = [
    {
      icon: <RiBold className="size-5" />,
      onClick: () => editor.chain().focus().toggleBold().run(),
      isActive: editor.isActive("bold"),
      title: "Bold",
    },
    {
      icon: <BsTypeUnderline className="size-5" />,
      onClick: () => editor.chain().focus().toggleUnderline().run(),
      isActive: editor.isActive("underline"),
      title: "Underline",
    },
    {
      icon: <RiItalic className="size-5" />,
      onClick: () => editor.chain().focus().toggleItalic().run(),
      isActive: editor.isActive("italic"),
      disabled: !editor.can().chain().focus().toggleItalic().run(),
      title: "Italic",
    },
    {
      icon: <RiDoubleQuotesL className="size-5" />,
      onClick: () => editor.chain().focus().toggleBlockquote().run(),
      isActive: editor.isActive("blockquote"),
      title: "Blockquote",
    },
    {
      icon: <RiH1 className="size-5" />,
      onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: editor.isActive("heading", { level: 1 }),
      title: "Heading 1",
    },
    {
      icon: <RiH2 className="size-5" />,
      onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: editor.isActive("heading", { level: 2 }),
      title: "Heading 2",
    },
    {
      icon: <RiH3 className="size-5" />,
      onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      isActive: editor.isActive("heading", { level: 3 }),
      title: "Heading 3",
    },
    {
      icon: <RiStrikethrough className="size-5" />,
      onClick: () => editor.chain().focus().toggleStrike().run(),
      isActive: editor.isActive("strike"),
      disabled: !editor.can().chain().focus().toggleStrike().run(),
      title: "Strikethrough",
    },
    {
      icon: <RiLink className="size-5" />,
      onClick: () => {
        const url = prompt("Enter the URL");
        if (url) {
          editor.chain().focus().setLink({ href: url }).run();
        }
      },
      isActive: editor.isActive("link"),
      disabled: !editor.can().chain().focus().setLink({ href: "" }).run(),
      title: "Link",
    },
    {
      icon: <IoListOutline className="size-5" />,
      onClick: () => editor.chain().focus().toggleBulletList().run(),
      isActive: editor.isActive("bulletList"),
      title: "Bullet List",
    },
    {
      icon: <RiListOrdered2 className="size-5" />,
      onClick: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: editor.isActive("orderedList"),
      disabled: !editor.can().chain().focus().toggleOrderedList().run(),
      title: "Ordered List",
    },
  ];

  const undoRedoButtons = [
    {
      icon: <BiUndo className="size-5" />,
      onClick: () => editor.chain().focus().undo().run(),
      isActive: editor.isActive("undo"),
      disabled: !editor.can().chain().focus().undo().run(),
      title: "Undo",
    },
    {
      icon: <BiRedo className="size-5" />,
      onClick: () => editor.chain().focus().redo().run(),
      isActive: editor.isActive("redo"),
      disabled: !editor.can().chain().focus().redo().run(),
      title: "Redo",
    },
  ];

  return (
    <div className="mb-2 flex justify-between bg-gray-300! flex-nowrap">
      <div>
        {buttons.map(({ icon, onClick, isActive, disabled, title }, index) => (
          <Button
            key={index}
            onClick={onClick}
            isActive={isActive}
            disabled={disabled}
            className="cursor-pointer"
            title={title}
          >
            {icon}
          </Button>
        ))}
      </div>
      <div>
        {undoRedoButtons.map(
          ({ icon, onClick, isActive, disabled, title }, index) => (
            <Button
              key={index}
              onClick={onClick}
              isActive={isActive}
              disabled={disabled}
              className="cursor-pointer"
              title={title}
            >
              {icon}
            </Button>
          ),
        )}
      </div>
    </div>
  );
}
