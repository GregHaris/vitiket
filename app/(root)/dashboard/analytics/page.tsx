"use server";

export default async function AnalyticsPage() {
  return (
    <>
      <section className="bg-primary-50 py-5 md:py-10">
        <h3 className="h3-bold wrapper">Analytics</h3>
      </section>

      <section className="wrapper my-8">
        <div className="flex-center wrapper min-h-[200px] w-full flex-col gap-3 rounded-[14px] bg-grey-50 py-28 text-center">
          <h3 className="p-bold-20 md:h5-bold">Analytics Coming Soon</h3>
          <p className="p-regular-14">
            Stay tuned for insights on your event performance!
          </p>
        </div>
      </section>
    </>
  );
}
