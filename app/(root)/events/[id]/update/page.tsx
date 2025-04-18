import { getEventById } from "@/lib/actions/event.actions";
import EventForm from "@/app/(root)/events/[id]/_components/_components/EventForm";
import getUserId from "@/utils/userId";

type UpdateEventProps = {
  params: Promise<{ id: string }>;
};

const UpdateEvent = async (props: UpdateEventProps) => {
  const params = await props.params;

  const { id } = params;

  const userId = await getUserId();

  const event = await getEventById(id);

  return (
    <>
      {" "}
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
