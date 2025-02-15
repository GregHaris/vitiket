import { auth } from '@clerk/nextjs/server';
import EventForm from '@shared/EventForm';

const CreateEvent = async () => {
  const { sessionClaims } = await auth();

  // Type assertion to help TypeScript understand the structure
  const claims = sessionClaims as CustomJwtSessionClaims;

  // Access userId from the nested object
  const userId = claims?.userId?.userId as string;

  return (
    <>
      {' '}
      <section className="bg-primary-50 bg-dotted-pattern bg-cover bg-center py-5 md:py-10">
        <h3 className="wrapper h3-bold text-center sm:text-left">
          Create Event
        </h3>
      </section>
      <div className="wrapper my-8">
        <EventForm userId={userId} type="Create" />
      </div>
    </>
  );
};

export default CreateEvent;
