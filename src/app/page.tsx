import FAQs from "@/components/FaqSection";
import { FeatureSection } from "@/components/FeatureSection";
import { FeatureSectionTwo } from "@/components/FeatureSectionTwo";
import FooterSection from "@/components/FooterSection";
import { HeroSection } from "@/components/HeroSection";
import { Logos } from "@/components/Logos";
import TestimonialSection from "@/components/TestimonialSection";

export default function Home() {
  return (
    <div className="bg-background">
      <HeroSection />
      <Logos />
      <FeatureSection />
      <FeatureSectionTwo />
      <TestimonialSection />
      <FAQs />
      <FooterSection />
    </div>
  );
}