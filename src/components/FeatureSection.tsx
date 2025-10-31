import { MapPin, Bell, Shield } from "lucide-react";
import React from "react";

import { Badge } from "@/components/ui/badge";

const DATA = [
  {
    title: "Real-Time Map Visualization",
    description:
      "Track active disasters globally with live markers on Google Maps—earthquake, flood, wildfire, and storm data at your fingertips.",
    icon: "MapPin",
    image:
      "https://cdn.cosmos.so/410de9a7-1213-433a-93da-043b0e2e2a7b?format=jpeg",
  },
  {
    title: "Personalized Alert System",
    description:
      "Subscribe to location-based notifications and receive instant SMS, push, or email alerts for disasters near you.",
    icon: "Bell",
    image:
      "https://cdn.cosmos.so/c32afa87-08ab-4e83-b768-7c1c7877e889?format=jpeg",
  },
  {
    title: "AI-Powered Safety Tips",
    description:
      "Get immediate, actionable safety guidance tailored to each disaster type—helping you stay prepared and protected.",
    icon: "Shield",
    image:
      "https://cdn.cosmos.so/410de9a7-1213-433a-93da-043b0e2e2a7b?format=jpeg",
  },
];
const FeatureSection = () => {
  return (
    <section className="py-32 max-w-7xl mx-auto ">
      <div className="border-y">
        <div className="container flex flex-col gap-6 border-x py-4 max-lg:border-x lg:py-8 px-7">
          <h2 className="text-3xl leading-tight tracking-tight  font-extralight md:text-4xl lg:text-6xl">
            Stay informed with DisasterAlert
          </h2>
          <p className="text-muted-foreground max-w-[600px] tracking-[-0.32px]">
            Monitor natural disasters worldwide and receive personalized alerts—all through DisasterAlert's real-time visualization platform.
          </p>
        </div>
      </div>

      <div className="lg:px-0! container border-x">
        <div className="items-center">
          <div className="grid flex-1 max-lg:divide-y max-lg:border-x lg:grid-cols-3 lg:divide-x">
            {DATA.map((item, index) => (
              <div
                key={index}
                className="relative isolate pt-5 text-start lg:pt-20"
              >
                <h3 className="mt-2 px-4 text-lg  tracking-tight lg:px-8">
                  {item.title}
                </h3>
                <p className="text-muted-foreground pb-6 pt-2 lg:px-8">
                  {item.description}
                </p>
                <div className="border-t">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="bg-muted  dark:invert"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="h-8 w-full border-y md:h-12 lg:h-[112px]">
        <div className="container h-full w-full border-x"></div>
      </div>
    </section>
  );
};

export { FeatureSection };