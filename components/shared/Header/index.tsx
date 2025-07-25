import { SignedOut, SignInButton, SignedIn, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@ui/button";

import MobileNav from "./MobileNav";
import NavItems from "./NavItems";
import DisplayAdmin from "./DisplayAdminButton";

const Header = () => {
  return (
    <header className="h-20 px-2 lg:px-6 sticky top-0 z-20 bg-neutral-white border-b">
      <div className="max-w-[1950px] mx-auto h-full flex items-center w-full">
        <div className="flex justify-between items-center w-full">
          <Link href={"/"}>
            <Image
              src="/assets/images/logo.svg"
              alt="logo image"
              width={128}
              height={38}
            />
          </Link>
          <div className="flex flex-nowrap justify-between gap-8 whitespace-nowrap">
            <div className="w-full flex items-center">
              <div className="hidden md:flex-between items-center w-full gap-8">
                <NavItems />
                <SignedIn>
                  <DisplayAdmin />
                </SignedIn>
              </div>
            </div>
            <div className="flex justify-end gap-3 flex-nowrap whitespace-nowrap">
              <SignedOut>
                <Button asChild className="primary-btn">
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
      </div>
    </header>
  );
};

export default Header;
