import { SignedOut, SignInButton, SignedIn, UserButton } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@ui/button';

import MobileNav from './MobileNav';
import NavItems from './NavItems';
import DisplayAdmin from './DisplayAdminButton';

const Header = () => {
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

        <div className="flex flex-nowrap justify-between gap-8 whitespace-nowrap">
          <div className="w-full">
            <div className="hidden md:flex-between w-full gap-8">
              <NavItems />
              <SignedIn>
                <DisplayAdmin />
              </SignedIn>
            </div>
          </div>
          <div className="flex w-32 justify-end gap-3 mr-4 flex-nowrap whitespace-nowrap">
            <SignedOut>
              <Button asChild className="cursor-pointer rounded-md" size={'lg'}>
                <SignInButton />
              </Button>
            </SignedOut>
            <SignedIn>
              <UserButton />
              <MobileNav />
            </SignedIn>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
