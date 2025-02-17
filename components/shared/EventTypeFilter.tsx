'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import {
  Calendar,
  Gamepad2,
  Computer,
  Laptop,
  Users,
  Mic2,
} from 'lucide-react';
import { TypeProps } from '@/types';
import { BiParty } from 'react-icons/bi';
import { RiComputerLine } from 'react-icons/ri';
import { formUrlQuery, removeKeysFromQuery } from '@/lib/utils';

const types: TypeProps[] = [
  { name: 'Conferences', icon: Mic2 },
  { name: 'Meetups', icon: Users },
  { name: 'WorkShops', icon: RiComputerLine },
  { name: 'Hackathons', icon: Calendar },
  { name: 'Webinars', icon: Laptop },
  { name: 'Fun & Games', icon: Gamepad2 },
  { name: 'Festivals', icon: BiParty },
  { name: 'Bootcamps', icon: Computer },
];

export default function EventTypeIcons() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Handle type selection
  const handleTypeClick = (type: string) => {
    let newUrl = '';

    if (type !== 'All') {
      newUrl = formUrlQuery({
        params: searchParams.toString(),
        key: 'type',
        value: type,
      });
    } else {
      newUrl = removeKeysFromQuery({
        params: searchParams.toString(),
        keysToRemove: ['type'],
      });
    }

    router.push(newUrl, { scroll: false });
  };

  return (
    <div className="overflow-x-auto whitespace-nowrap scrollbar-hide">
      <div className="flex justify-between gap-8">
        {types.map((type) => (
          <div
            key={type.name}
            onClick={() => handleTypeClick(type.name)}
            className="flex flex-col items-center gap-3 text-center group cursor-pointer"
          >
            <div className="w-[72px] h-[72px] rounded-full border border-gray-200 flex items-center justify-center group-hover:border-primary transition-colors">
              <type.icon className="h-7 w-6 text-[#6f7287] group-hover:text-primary-500 transition-colors" />
            </div>
            <span className="text-sm text-[#6f7287] group-hover:text-primary-500 transition-colors">
              {type.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
