import HowItWorks from "../../components/landing/HowItWorks";
import Hero from "../../components/landing/Hero";
import WhyChoose from "../../components/landing/WhyChoose";
import StatsStrip from "../../components/landing/StatsStrip";
import Testimonials from "../../components/landing/Testimonials";
import Footer from "../../components/landing/Footer";
import Features from "../../components/landing/Features";
import CallToAction from "../../components/landing/CallToAction";


export default function Landing() {
  return (
    <div className="bg-background dark:bg-gray-950">
      <Hero />
      <WhyChoose />
      <HowItWorks />
      <Features />
      <StatsStrip />
      <Testimonials />
      <CallToAction />
      <Footer />

    </div>
  );
}
