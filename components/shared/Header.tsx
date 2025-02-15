'use client';

import { usePathname } from 'next/navigation';
import { SignedOut, SignInButton, SignedIn, UserButton } from '@clerk/nextjs';
import { Button } from '@ui/button';
import Image from 'next/image';
import Link from 'next/link';

import MobileNav from './MobileNav';
import NavItems from './NavItems';
import SearchByName from './SearchByName';
import SearchByLocation from './SearchByLocation';

export const Header = () => {
  const pathname = usePathname();

  return (
    <header className="w-full border-b pb-5">
      <div className="mt-5 px-3 flex justify-between items-center">
        <Link href={'/'} className="w-36">
          <Image
            src="/assets/images/logo.svg"
            alt="logo image"
            width={128}
            height={38}
          />
        </Link>

        {(pathname === '/' || pathname === '/events') && (
          <div className="hidden halfwayFlex flex-1 justify-center mx-4">
            <div className="flex w-full max-w-2xl items-center bg-[#F8F7FA] rounded-full shadow-sm">
              <SearchByName />
              <SearchByLocation />
            </div>
          </div>
        )}

        <div className="flex justify-between gap-3">
          <SignedIn>
            <div className="hidden md:flex-between w-full max-w-xs">
              <NavItems />
            </div>
          </SignedIn>
          <div className="flex w-32 justify-end gap-3 mr-4">
            <SignedIn>
              <UserButton />
              <MobileNav />
            </SignedIn>
            <SignedOut>
              <Button
                asChild
                className="cursor-pointer rounded-full"
                size={'lg'}
              >
                <SignInButton />
              </Button>
            </SignedOut>
          </div>
        </div>
      </div>

      {(pathname === '/' || pathname === '/events') && (
        <div className="wrapper halfwayHidden">
          <div className="flex w-full items-center bg-[#F8F7FA] rounded-full shadow-sm">
            <SearchByName />
            <SearchByLocation />
          </div>
        </div>
      )}
    </header>
  );
};
