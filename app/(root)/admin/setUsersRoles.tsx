import { redirect } from 'next/navigation';
import { checkRole } from '@/utils/roles';
import { clerkClient } from '@clerk/nextjs/server';
import { removeRole, setRole } from './_actions';
import { Button } from '@/components/ui/button';

export default async function SetUsersRoles({
  searchParams,
}: {
  searchParams: { search?: string };
}) {
  if (!checkRole('admin')) {
    redirect('/');
  }

  const query = searchParams.search;

  const client = await clerkClient();

  const users = query ? (await client.users.getUserList({ query })).data : [];

  return (
    <div className="space-y-4">
      {users.map((user) => {
        return (
          <div key={user.id} className="p-4 bg-gray-50 rounded-lg shadow-sm">
            <div className="p-semibold-18 mb-2">
              {user.firstName} {user.lastName}
            </div>
            <div className="text-gray-600">
              {' '}
              <span className="p-bold-16">Email: </span>
              {
                user.emailAddresses.find(
                  (email) => email.id === user.primaryEmailAddressId
                )?.emailAddress
              }
            </div>
            <div className="text-gray-600 mb-2">
              {' '}
              <span className="p-bold-16">Role: </span>
              {user.publicMetadata.role as string}
            </div>
            <div className="flex gap-2">
              <form action={setRole} className="inline">
                <input type="hidden" value={user.id} name="id" />
                <input type="hidden" value="admin" name="role" />
                <Button type="submit" className="button">
                  Make Admin
                </Button>
              </form>
              <form action={removeRole} className="inline">
                <input type="hidden" value={user.id} name="id" />
                <Button
                  type="submit"
                  className="button"
                  variant={'destructive'}
                >
                  Remove Role
                </Button>
              </form>
            </div>
          </div>
        );
      })}
    </div>
  );
}
