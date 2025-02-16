'use client';

import { SignedOut, SignInButton, SignedIn } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';


import { Button } from '@ui/button';
import NavItems from './NavItems';

const Header = () => {

  return (
    <header className="w-full border-b pb-5">
      <div className="mt-5 pl-3 flex justify-between items-center">
        <Link href={'/'} className="w-36">
          <Image
            src="/assets/images/logo.svg"
            alt="logo image"
            width={128}
            height={38}
          />
        </Link>

        <div className="flex justify-between gap-3">
          <SignedIn>
            <div className="hidden md:flex-between w-full max-w-xs">
              <NavItems />
            </div>
          </SignedIn>
          <div className="flex w-32 justify-end gap-3 mr-4">
            <SignedOut>
              <Button
                asChild
                className="cursor-pointer rounded-md"
                size={'lg'}
              >
                <SignInButton />
              </Button>
            </SignedOut>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
