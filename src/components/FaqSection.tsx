export default function FAQs() {
  return (
    <section className="scroll-py-16 py-16 md:scroll-py-32 md:py-32">
      <div className="mx-auto max-w-5xl px-6">
        <div className="grid gap-y-12 px-2 lg:[grid-template-columns:1fr_auto]">
          <div className="text-center lg:text-left">
            <h2 className="mb-4 text-3xl  md:text-6xl">
              Frequently <br className="hidden lg:block" /> Asked{" "}
              <br className="hidden lg:block" />
              Questions
            </h2>
            <p>Everything you need to know about DisasterAlert</p>
          </div>

          <div className="divide-y divide-dashed sm:mx-auto sm:max-w-lg lg:mx-0">
            <div className="pb-6">
              <h3 className="font-medium text-lg">
                How does DisasterAlert work?
              </h3>
              <p className="text-muted-foreground mt-4">
                DisasterAlert uses real-time data from GetAmbee API to visualize natural disasters on an interactive Google Map. Events are updated every 30-60 seconds.
              </p>

              <ol className="list-outside list-decimal space-y-2 pl-4">
                <li className="text-muted-foreground mt-4">
                  Our backend fetches live disaster data including earthquakes, floods, wildfires, and storms from trusted sources.
                </li>
                <li className="text-muted-foreground mt-4">
                  Data is processed and displayed on the map with color-coded severity markers for quick assessment.
                </li>
                <li className="text-muted-foreground mt-4">
                  You can subscribe to location-based alerts and receive push notifications for events in your area.
                </li>
              </ol>
            </div>
            <div className="py-6">
              <h3 className="font-medium text-lg">
                Is DisasterAlert free to use?
              </h3>
              <p className="text-muted-foreground mt-4">
                Yes, DisasterAlert is completely free. You can view the map, explore events, and set up basic alerts without any cost or subscription.
              </p>
            </div>
            <div className="py-6">
              <h3 className="font-medium text-lg">What disaster types are covered?</h3>
              <p className="text-muted-foreground my-4">
                DisasterAlert tracks multiple natural disaster types in real-time to keep you informed and prepared for various emergencies.
              </p>
              <ul className="list-outside list-disc space-y-2 pl-4">
                <li className="text-muted-foreground">
                  Earthquakes with magnitude data, floods with affected areas, wildfires with spread patterns, and tropical cyclones.
                </li>
                <li className="text-muted-foreground">
                  Each event includes severity levels, confidence ratings, and AI-powered safety recommendations for your protection.
                </li>
              </ul>
            </div>
            <div className="py-6">
              <h3 className="font-medium text-lg">
                How do I set up location alerts?
              </h3>
              <p className="text-muted-foreground mt-4">
                Sign up for a free account, navigate to Settings, and add your locations of interest. You&apos;ll receive instant notifications via push, SMS, or email.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}