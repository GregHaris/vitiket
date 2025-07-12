import { checkRole } from "@/utils/roles";
import Link from "next/link";

const DisplayAdmin = async () => {
  if (!(await checkRole("admin"))) return null;

  return (
    <div className="hover:bg-grey-50 rounded-md ">
      <Link href="/admin" className="nav-links p-medium-16">
        Admin
      </Link>
    </div>
  );
};

export default DisplayAdmin;
