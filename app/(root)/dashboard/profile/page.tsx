"use server";

import { getOrganizedEventsCount } from "@/lib/actions/event.actions";
import { getUserById } from "@/lib/actions/user.actions";
import getUserId from "@/utils/userId";

export default async function ProfilePage() {
  const userId = await getUserId();
  const user = await getUserById(userId);
  const organizedEventsCount = await getOrganizedEventsCount(userId);

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
          <p>
            <strong>Organized Events:</strong> {organizedEventsCount}
          </p>
        </div>
        <div className="mt-6">
          <p className="text-sm text-muted-foreground">
            To manage your profile details (e.g., update your name or email),
            click and use the <span className="font-semibold">User Image</span>{" "}
            in the top-right corner of the header.
          </p>
        </div>
      </section>
    </>
  );
}
