import { useFormContext } from "react-hook-form";
import DatePicker from "react-datepicker";
import Image from "next/image";

import { DatePickerProps } from "@/types";
import { eventFormValues } from "@/lib/validator";
import { FormControl, FormField, FormItem, FormLabel } from "@ui/form";

import "react-datepicker/dist/react-datepicker.css";

export default function DatePickerComponent({
  name,
  label,
  placeholder,
}: DatePickerProps) {
  const { control } = useFormContext<eventFormValues>();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-sm font-medium">
            {label} <span className="text-red-400">*</span>
          </FormLabel>
          <FormControl>
            <div className="flex-center h-[40px] w-full overflow-hidden rounded-md border-gray-300 border bg-grey-50 px-4 py-2 text-sm">
              <Image
                src="/assets/icons/calendar.svg"
                width={20}
                height={20}
                alt="calendar"
              />
              <p className="ml-3 whitespace-nowrap text-gray-600">
                {placeholder}
              </p>
              <DatePicker
                selected={field.value as Date}
                onChange={(date: Date | null) => field.onChange(date)}
                dateFormat="dd/MM/yyyy"
                wrapperClassName="datePicker"
              />
            </div>
          </FormControl>
        </FormItem>
      )}
    />
  );
}
