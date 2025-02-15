'use client';

import { Button } from '@ui/button';
import { Input } from '@ui/input';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

export const SearchUsers = () => {
  const router = useRouter();
  const pathname = usePathname() || '';
  const [searchTerm, setSearchTerm] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (!value.trim()) {
      router.push(pathname);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      router.push(pathname + '?search=' + searchTerm);
    }
  };

  return (
    <div className="mb-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const formData = new FormData(form);
          const queryTerm = formData.get('search') as string;
          router.push(pathname + '?search=' + queryTerm);
        }}
        className="flex gap-2"
      >
        <label htmlFor="search" className="sr-only">
          Search for users
        </label>
        <Input
          id="search"
          name="search"
          type="text"
          className="input-field p-regular-16"
          placeholder="Search for users"
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
        />
        <Button type="submit" className="button">
          Submit
        </Button>
      </form>
    </div>
  );
};
