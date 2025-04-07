"use server";

import { Button } from "@ui/button";
import { getUserById } from "@/lib/actions/user.actions";
import getUserId from "@/utils/userId";

export default async function ProfilePage() {
  const userId = await getUserId();
  const user = await getUserById(userId);

  return (
    <>
      <section className="bg-primary-50 py-5 md:py-10">
        <h3 className="h3-bold wrapper">Profile</h3>
      </section>

      <section className="wrapper my-8">
        <div className="bg-white p-5 rounded-lg shadow-md flex flex-col gap-5">
          <p>
            <strong>First Name:</strong> {user.firstName || "N/A"}
          </p>
          <p>
            <strong>Last Name:</strong> {user.lastName || "N/A"}
          </p>
          <p>
            <strong>Username:</strong> {user.username || "N/A"}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <Button asChild size="lg" className="button self-start">
            <a href="/dashboard/profile/edit">Edit Profile</a>
          </Button>
        </div>
      </section>
    </>
  );
}
