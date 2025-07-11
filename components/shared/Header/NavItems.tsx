"use client";

import { useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import Link from "next/link";

import { headerLinks } from "@/constants";
const NavItems = () => {
  const pathName = usePathname();
  const { isSignedIn } = useUser();

  return (
    <ul className="md:flex-between md:flex w-full md:gap-3 items-center md:flex-row text-grey-600 ">
      {headerLinks.map((link) => {
        if (link.route === "/dashboard" && !isSignedIn) {
          return null;
        }
        const isActive = pathName === link.route;
        return (
          <li
            key={link.route}
            className={`nav-links ${isActive && "text-primary-500"}`}
          >
            <Link href={link.route} className=" p-medium-16 cursor-pointer">
              {link.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
};

export default NavItems;
