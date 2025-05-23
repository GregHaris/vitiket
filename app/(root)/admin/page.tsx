import { SearchParamProps } from '@/types';
import ManageCategories from '@shared/ManageCategories';
import ManageTypes from '@shared/ManageTypes';

import { SearchUsers } from './SearchUsers';
import SetUsersRoles from './setUsersRoles';

export default async function AdminDashboard({
  searchParams,
}: SearchParamProps) {
  const resolvedSearchParams = await searchParams;

  return (
    <div className="p-6 bg-gray-100 wrapper">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-4xl font-bold text-center mb-4">Admin Dashboard</h1>
        <p className="mb-10 text-center">
          This is the protected admin dashboard restricted to users with the
          `admin` role.
        </p>
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4 text-center">
            Set Users Role
          </h2>
          <SearchUsers />
        </div>
        <div className="mb-6">
          <SetUsersRoles searchParams={resolvedSearchParams} />
        </div>
        <div className="mb-6">
          <ManageTypes />
        </div>
        <div className="mb-6">
          <ManageCategories />
        </div>
      </div>
    </div>
  );
}
