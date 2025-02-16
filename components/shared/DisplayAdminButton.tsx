import { checkRole } from '@/utils/roles';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const DisplayAdmin = async () => {
  if (!(await checkRole('admin'))) return null;

  return (
    <div className="hover:bg-grey-50 rounded-md ">
      <Link href="/admin">
        <Button variant="ghost" className="p-medium-16 cursor-pointer">
          Admin
        </Button>
      </Link>
    </div>
  );
};

export default DisplayAdmin;
