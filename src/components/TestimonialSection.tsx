import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

type Testimonial = {
  name: string;
  role: string;
  image: string;
  quote: string;
};

const testimonials: Testimonial[] = [
  {
    name: "Sarah Chen",
    role: "Emergency Coordinator",
    image: "https://randomuser.me/api/portraits/women/1.jpg",
    quote:
      "DisasterAlert's real-time map visualization saved critical hours during the recent floods. The platform is invaluable!",
  },
  {
    name: "Marcus Johnson",
    role: "Disaster Response Lead",
    image: "https://randomuser.me/api/portraits/men/6.jpg",
    quote:
      "I coordinated relief efforts faster with DisasterAlert. The live alerts and safety tips are game-changing.",
  },
  {
    name: "Aisha Patel",
    role: "Crisis Management Specialist",
    image: "https://randomuser.me/api/portraits/women/7.jpg",
    quote:
      "DisasterAlert's interface is intuitive and powerful. Tracking multiple disasters has never been this seamless.",
  },
  {
    name: "David Kim",
    role: "Emergency Volunteer",
    image: "https://randomuser.me/api/portraits/men/8.jpg",
    quote:
      "DisasterAlert helped our team respond to earthquakes quickly. The real-time data platform is perfect for first responders.",
  },
  {
    name: "Elena Rodriguez",
    role: "Senior Safety Officer",
    image: "https://randomuser.me/api/portraits/women/4.jpg",
    quote:
      "DisasterAlert redefines disaster awareness. The location-based alerts save us precious time every single day.",
  },
  {
    name: "James Wright",
    role: "Public Safety Coordinator",
    image: "https://randomuser.me/api/portraits/men/2.jpg",
    quote:
      "I love how DisasterAlert streamlines disaster tracking. It's my go-to for monitoring natural hazards globally.",
  },
  {
    name: "Priya Sharma",
    role: "Disaster Preparedness Director",
    image: "https://randomuser.me/api/portraits/women/5.jpg",
    quote:
      "DisasterAlert's platform is both simple and comprehensive. Our team monitors events worldwide with full confidence.",
  },
  {
    name: "Michael Torres",
    role: "Emergency Response Manager",
    image: "https://randomuser.me/api/portraits/men/9.jpg",
    quote:
      "DisasterAlert accelerated our disaster response. The platform's accuracy and real-time updates are outstanding.",
  },
  {
    name: "Lisa Anderson",
    role: "Community Safety Lead",
    image: "https://randomuser.me/api/portraits/women/10.jpg",
    quote:
      "DisasterAlert is clean, responsive, and makes monitoring natural disasters fast and incredibly efficient.",
  },
  {
    name: "Carlos Mendez",
    role: "Risk Assessment Analyst",
    image: "https://randomuser.me/api/portraits/men/11.jpg",
    quote:
      "DisasterAlert's platform is well-structured and easy to use. We assess disaster risks faster than ever before.",
  },
  {
    name: "Nina Okonkwo",
    role: "Humanitarian Aid Worker",
    image: "https://randomuser.me/api/portraits/women/12.jpg",
    quote:
      "DisasterAlert is the perfect solution for tracking and responding to disasters. Highly recommended for any relief team.",
  },
  {
    name: "Thomas Zhang",
    role: "Crisis Communications Officer",
    image: "https://randomuser.me/api/portraits/men/13.jpg",
    quote:
      "DisasterAlert makes disaster awareness accessible to everyone. The platform empowers our entire response team.",
  },
];

const chunkArray = (
  array: Testimonial[],
  chunkSize: number
): Testimonial[][] => {
  const result: Testimonial[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    result.push(array.slice(i, i + chunkSize));
  }
  return result;
};

const testimonialChunks = chunkArray(
  testimonials,
  Math.ceil(testimonials.length / 3)
);

export default function TestimonialSection() {
  return (
    <section>
      <div className="py-16 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <h2 className="text-title text-6xl text-foreground ">
              Trusted by Response Teams
            </h2>
            <p className="text-body mt-6">
              DisasterAlert helps you stay informed and respond to natural disasters faster, with real-time alerts and mapping.
            </p>
          </div>
          <div className="mt-8 grid gap-3 [--color-card:var(--color-muted)] sm:grid-cols-2 md:mt-12 lg:grid-cols-3 dark:[--color-muted:var(--color-zinc-900)]">
            {testimonialChunks.map((chunk, chunkIndex) => (
              <div
                key={chunkIndex}
                className="space-y-3 *:border-none *:shadow-none"
              >
                {chunk.map(({ name, role, quote, image }, index) => (
                  <Card
                    className="rounded-none outline outline-dotted divide-dotted bg-stone-100"
                    key={index}
                  >
                    <CardContent className="grid grid-cols-[auto_1fr] gap-3 pt-6">
                      <Avatar className="size-9">
                        <AvatarImage
                          alt={name}
                          src={image}
                          loading="lazy"
                          width="120"
                          height="120"
                        />
                        <AvatarFallback>ST</AvatarFallback>
                      </Avatar>

                      <div>
                        <h3 className="font-medium">{name}</h3>

                        <span className="text-muted-foreground block text-sm tracking-wide">
                          {role}
                        </span>

                        <blockquote className="mt-3">
                          <p className="text-gray-700 dark:text-gray-300">
                            {quote}
                          </p>
                        </blockquote>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}