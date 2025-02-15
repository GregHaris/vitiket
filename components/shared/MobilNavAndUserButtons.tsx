import {SignedIn, UserButton } from '@clerk/nextjs';

import MobileNav from './MobileNav';

export default function MobileNavAndUserButton() {
  return (
    <div className="flex w-32 justify-end gap-3 mr-4">
      <SignedIn>
        <UserButton />
        <MobileNav />
      </SignedIn>
    </div>
  );
}
