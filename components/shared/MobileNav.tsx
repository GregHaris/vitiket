import Image from 'next/image';
import { Separator } from '@ui/separator';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from '@ui/sheet';

import NavItems from './NavItems';
import DisplayAdmin from './DisplayAdminButton';

const MobileNav = () => {
  return (
    <nav className="md:hidden">
      <Sheet>
        <SheetTrigger className="align-middle">
          <Image
            src={'/assets/icons/menu.svg'}
            alt="menu"
            width={24}
            height={24}
            className="cursor-pointer"
          />
        </SheetTrigger>
        <SheetContent className="flex flex-col w-[200px] gap-6 bg-white md:hidden">
          <SheetHeader>
            <SheetTitle className="sr-only">Mobile Navigation</SheetTitle>{' '}
            <SheetDescription className="sr-only">
              Navigation menu for mobile devices.
            </SheetDescription>{' '}
          </SheetHeader>
          <Image
            src={'/assets/images/logo.svg'}
            alt="logo"
            width={128}
            height={38}
          />
          <Separator className="border border-gray-50" />
          <NavItems />
          <DisplayAdmin/>
        </SheetContent>
      </Sheet>
    </nav>
  );
};

export default MobileNav;
