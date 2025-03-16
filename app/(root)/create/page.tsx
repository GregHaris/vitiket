import EventForm from '@shared/EventForm';
import EventFormHeading from '@shared/EventFormHeading';
import getUserId from '@/utils/userId';

const CreateEvent = async () => {
  const userId = await getUserId();

  return (
    <>
      <section className="bg-primary-50 bg-dotted-pattern bg-cover bg-center py-5 md:py-10">
        <EventFormHeading />
      </section>
      <div className="wrapper my-8">
        <EventForm userId={userId} type="Create" />
      </div>
    </>
  );
};

export default CreateEvent;
