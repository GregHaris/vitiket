import { useFormContext } from 'react-hook-form';
import DatePicker from 'react-datepicker';
import Image from 'next/image';

import { DateTimePickerProps } from '@/types';

import 'react-datepicker/dist/react-datepicker.css';
import { FormControl, FormField, FormItem, FormLabel } from '../ui/form';

export default function DateTimePicker({
  name,
  label,
  placeholder,
}: DateTimePickerProps) {
  const { control } = useFormContext();

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
                className="filter-grey"
              />
              <p className="ml-3 whitespace-nowrap text-gray-600">
                {placeholder}
              </p>
              <DatePicker
                selected={field.value}
                onChange={(date: Date | null) => field.onChange(date)}
                showTimeSelect
                timeInputLabel="Time:"
                dateFormat="dd/MM/yyyy h:mm aa"
                wrapperClassName="datePicker"
              />
            </div>
          </FormControl>
        </FormItem>
      )}
    />
  );
}
