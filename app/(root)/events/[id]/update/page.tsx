import EventForm from '@shared/EventForm';
import { auth } from '@clerk/nextjs/server';
import { getEventById } from '@/lib/actions/event.actions';

type UpdateEventProps = {
  params: Promise<{ id: string }>;
};

const UpdateEvent = async (props: UpdateEventProps) => {
  const params = await props.params;

  const {
    id
  } = params;

  const { sessionClaims } = await auth();

  // Type assertion to help TypeScript understand the structure
  const claims = sessionClaims as CustomJwtSessionClaims;

  // Access userId from the nested object
  const userId = claims?.userId?.userId as string;

  const event = await getEventById(id);

  return (
    <>
      {' '}
      <section className="bg-primary-50 bg-dotted-pattern bg-cover bg-center py-5 md:py-10">
        <h3 className="wrapper h3-bold text-center sm:text-left">
          Update Event
        </h3>
      </section>
      <div className="wrapper my-8">
        <EventForm
          userId={userId}
          type="Update"
          event={event}
          eventId={event._id}
        />
      </div>
    </>
  );
};

export default UpdateEvent;
