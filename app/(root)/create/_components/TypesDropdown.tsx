"use client";

import { useEffect, useState } from "react";

import { getAllTypes } from "@/lib/actions/type.actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DropdownProps } from "@/types";

const TypesDropdown = ({ value, onChange }: DropdownProps) => {
  const [types, setTypes] = useState<{ _id: string; name: string }[]>([]);

  useEffect(() => {
    const fetchTypes = async () => {
      const types = await getAllTypes();
      setTypes(types);
    };

    fetchTypes();
  }, []);

  return (
    <Select onValueChange={onChange} defaultValue={value}>
      <SelectTrigger className="select-field p-regular-14">
        <SelectValue placeholder="Select a type" />
      </SelectTrigger>
      <SelectContent>
        {types.map((type) => (
          <SelectItem key={type._id} value={type._id}>
            {type.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default TypesDropdown;
