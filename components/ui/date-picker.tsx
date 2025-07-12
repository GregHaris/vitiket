"use client";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  placeholder?: string;
}

export function DatePicker({
  date,
  setDate,
  placeholder = "Pick a date",
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal h-14 bg-gray-700/50 text-neutral-white placeholder:text-gray-400 border-0 focus-visible:ring-2 focus-visible:ring-[#123f70] rounded-2xl text-lg cursor-pointer",
            !date && "text-gray-400",
          )}
        >
          <CalendarIcon className="mr-2 h-5 w-5 text-gray-400" />
          {date ? format(date, "MMM dd, yyyy") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 bg-gray-800 border-gray-700 text-neutral-white"
        align="start"
      >
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          autoFocus
          classNames={{
            day_selected:
              "bg-[#123f70] text-neutral-white hover:bg-[#0f3460] hover:text-neutral-white focus:bg-[#123f70] focus:text-neutral-white",
            day_today: "bg-gray-700 text-neutral-white font-semibold",
            day_range_start: "bg-[#123f70] text-neutral-white",
            day_range_end: "bg-[#123f70] text-neutral-white",
            day_range_middle: "bg-gray-700",
            nav_button:
              "text-gray-300 hover:bg-gray-700 hover:text-neutral-white",
            nav_button_previous: "absolute left-1",
            nav_button_next: "absolute right-1",
            caption_label: "text-neutral-white font-medium",
            weeknumber: "text-gray-400",
            cell: "text-gray-200 hover:bg-gray-700 rounded-md",
            head_cell: "text-gray-400 font-medium",
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
