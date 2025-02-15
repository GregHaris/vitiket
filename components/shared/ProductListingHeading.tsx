'use client';

import { useUser } from '@clerk/nextjs';

const ProductListingHeading = () => {
  const { isLoaded, user } = useUser();

  if (!isLoaded) {
    return <div> </div>;
  }

  const userName = user?.firstName || 'User';

  return (
    <div className="wrapper text-left">
      <h3 className=" h3-bold">Hey {userName}!</h3>
      <p className="p-regular-16 py-4">
        Ready to add your product? It only takes a few minutes
      </p>
    </div>
  );
};

export default ProductListingHeading;
