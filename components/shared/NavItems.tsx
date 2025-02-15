'use client';

import { headerLinks } from '@/constants';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const NavItems = () => {
  const pathName = usePathname();

  return (
    <ul className="md:flex-between flex w-full flex-col gap-5 md:gap-3 items-start md:flex-row text-grey-600 ">
      {headerLinks.map((link) => {
        const isActive = pathName === link.route;
        return (
          <li
            key={link.route}
            className={`${
              isActive && 'text-primary-500'
            } flex-center p-medium-16 whitespace-nowrap hover:bg-grey-50 px-5 py-1 rounded-md`}
          >
            <Link href={link.route}>{link.label}</Link>
          </li>
        );
      })}
    </ul>
  );
};

export default NavItems;
