import { HowItWorksData } from "@/constants/howItWorksData";

export function HowItWorksSection() {
  return (
    <section className="py-20 bg-busy bg-cover bg-no-repeat bg-gray-900">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-neutral-white">
            How it works
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Three simple steps to discover and attend amazing tech events
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {HowItWorksData.map((step, index) => (
            <div key={index} className="text-center relative">
              <div className="relative mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-primary to-[#1e5a96] rounded-3xl flex items-center justify-center mx-auto shadow-xl">
                  <step.icon className="w-10 h-10 text-neutral-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gray-800 border-2 border-primary rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">
                    {step.step}
                  </span>
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-neutral-white">
                {step.title}
              </h3>
              <p className="text-gray-300 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
