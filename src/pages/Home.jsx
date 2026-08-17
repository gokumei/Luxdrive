import Hero from '@/components/home/Hero';
import Intro from '@/components/home/Intro';
import FleetPreview from '@/components/home/FleetPreview';
import WhyChooseUs from '@/components/home/WhyChooseUs';
import Testimonials from '@/components/home/Testimonials';
import ContactCTA from '@/components/home/ContactCTA';
import ReviewForm from '@/components/home/ReviewForm';
import { useOutletContext } from 'react-router-dom';

export default function Home() {
  const { content } =
    /** @type {import("@/lib/useContent").SiteOutletContext} */ (useOutletContext());
  return (
    <>
      <Hero content={content} />
      <Intro content={content} />
      <FleetPreview />
      <WhyChooseUs />
      <Testimonials />
      <ContactCTA />
      <ReviewForm />
    </>
  );
}
