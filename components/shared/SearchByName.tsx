'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';

import { formUrlQuery, removeKeysFromQuery } from '@/lib/utils';
import { Input } from '@ui/input';

export const NameSearch = ({
  placeholder = 'Search events...',
}: {
  placeholder?: string;
}) => {
  const [query, setQuery] = useState('');
  const searchParams = useSearchParams();
  const router = useRouter();

  // update the URL based on the search query with a debounce delay
  useEffect(() => {
    let newUrl = '';

    // Update the URL with the search query or remove the query parameter if empty
    const delayDebounceFn = setTimeout(() => {
      if (query) {
        newUrl = formUrlQuery({
          params: searchParams.toString(),
          key: 'query',
          value: query,
        });
      } else {
        newUrl = removeKeysFromQuery({
          params: searchParams.toString(),
          keysToRemove: ['query'],
        });
      }

      router.push(newUrl, { scroll: false });
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query, router, searchParams]);

  return (
    <div className="flex items-center flex-1 border-r border-gray-300">
      <Image
        src="/assets/icons/search.svg"
        alt="search"
        width={24}
        height={24}
        className="ml-4"
      />
      <Input
        type="text"
        placeholder={placeholder}
        className="input-field p-regular-16"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
    </div>
  );
};

export default function Search() {
  return (
    <Suspense>
      <NameSearch />
    </Suspense>
  );
}
