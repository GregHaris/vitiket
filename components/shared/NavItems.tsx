'use client';

import { headerLinks } from '@/constants';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '../ui/button';

const NavItems = () => {
  const pathName = usePathname();

  return (
    <ul className="md:flex-between md:flex w-full md:gap-3 items-start md:flex-row text-grey-600 ">
      {headerLinks.map((link) => {
        const isActive = pathName === link.route;
        return (
          <li
            key={link.route}
            className={`${
              isActive && 'text-primary-500'
            } whitespace-nowrap hover:bg-grey-50 rounded-md mb-5 md:mb-0`}
          >
            <Link href={link.route}>
              <Button variant={'ghost'} className=" p-medium-16 cursor-pointer">
                {link.label}
              </Button>
            </Link>
          </li>
        );
      })}
    </ul>
  );
};

export default NavItems;
