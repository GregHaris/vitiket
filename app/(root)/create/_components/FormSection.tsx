import { FormSectionProps } from "@/types";

export default function FormSection({
  title,
  description,
  children,
}: FormSectionProps) {
  return (
    <div className="space-y-6">
      {title && (
        <div className="mb-8">
          <h1 className="text-2xl font-semibold mb-2">{title}</h1>
          {description && <p className="text-gray-600">{description}</p>}
        </div>
      )}
      {children}
    </div>
  );
}
