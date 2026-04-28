import Hero from "@/components/home/Hero";
import HowItWorks from "@/components/home/HowItWorks";
import Features from "@/components/home/Features";
import Showcase from "@/components/home/Showcase";
import Pricing from "@/components/home/Pricing";
import CTA from "@/components/home/CTA";
import Footer from "@/components/home/Footer";
import WhoWeAre from "@/components/home/WhoWeAre";

export default function HomePage() {
  return (
    <>
      <main>
        <Hero />
        <HowItWorks />
        <Features />
        <Showcase />
        <WhoWeAre />
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
