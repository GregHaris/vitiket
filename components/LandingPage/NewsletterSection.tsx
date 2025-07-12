import { Button } from "@ui/button";
import { Input } from "@ui/input";

const NewsletterSection = () => {
  return (
    <div className="py-20 px-2">
      <div className="container mx-auto px-4 lg:px-6 flex flex-col items-center">
        <h2 className="text-neutral-black h2-bold mb-4">
          Subscribe to our newsletter
        </h2>
        <p className="mb-8 text-gray-700">
          Join now for exclusive event insights, industry trends and platform
          updates delivered weekly.
        </p>

        <div className="flex flex-col items-center gap-3 w-full">
          <Input
            type="email"
            placeholder="Enter your email address"
            className="h-12 px-4 border-gray-300 focus:ring-black focus-visible:ring-transparent outline-none shadow-none bg-neutral-white md:w-xl w-full focus-visible:ring-offset-0"
          />
          <Button className="black-btn w-fit">Get started</Button>
        </div>
      </div>
    </div>
  );
};

export default NewsletterSection;
