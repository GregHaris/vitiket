'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';

import { formUrlQuery, removeKeysFromQuery } from '@/lib/utils';
import { Input } from '@ui/input';

const Search = ({ placeholder = 'Location...' }: { placeholder?: string }) => {
  const [location, setLocation] = useState('');
  const searchParams = useSearchParams();
  const router = useRouter();

  // update the URL based on the location search query with a debounce delay
  useEffect(() => {
    let newUrl = '';

    // Update the URL with the location query or remove the location parameter if empty
    const delayDebounceFn = setTimeout(() => {
      if (location) {
        newUrl = formUrlQuery({
          params: searchParams?.toString() || '',
          key: 'location',
          value: location,
        });
      } else {
        newUrl = removeKeysFromQuery({
          params: searchParams?.toString() || '',
          keysToRemove: ['location'],
        });
      }

      router.push(newUrl, { scroll: false });
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [location, router, searchParams]);

  return (
    <div className="flex items-center flex-1 pl-2">
      <Image
        src="/assets/icons/location.svg"
        alt="search"
        width={24}
        height={24}
      />
      <Input
        type="text"
        placeholder={placeholder}
        className="nested-input-field p-regular-16"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      />
    </div>
  );
};

export default function LocationSearch() {
  return (
    <Suspense>
      <Search />
    </Suspense>
  );
}
