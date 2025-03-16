import { getUserById } from '@/lib/actions/user.actions';
import EventForm from '@shared/EventForm';
import EventFormHeading from '@shared/EventFormHeading';
import getUserId from '@/utils/userId';

const CreateEvent = async () => {
  const userId = await getUserId();
  const user = await getUserById(userId);

  return (
    <>
      <section className="bg-primary-50 bg-dotted-pattern bg-cover bg-center py-5 md:py-10">
        <EventFormHeading />
      </section>
      <div className="wrapper my-8">
        <EventForm
          userId={userId}
          subaccountCode={user.subaccountCode}
          stripeId={user.stripeId} 
          type="Create"
        />
      </div>
    </>
  );
};

export default CreateEvent;
