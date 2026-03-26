import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import SocialProof from "./components/SocialProof";
import About from "./components/About";
import Services from "./components/Services";
import Gallery from "./components/Gallery";
import Pricing from "./components/Pricing";
import Trainers from "./components/Trainers";
import WhyChooseUs from "./components/WhyChooseUs";
import CTA from "./components/CTA";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import WhatsAppButton from "./components/WhatsAppButton";
import StickyJoinNow from "./components/StickyJoinNow";

export default function App() {
  return (
    <div className="min-h-screen bg-brand-dark text-white selection:bg-brand-accent selection:text-white">
      <Navbar />
      <main>
        <Hero />
        <SocialProof />
        <About />
        <Services />
        <Gallery />
        <WhyChooseUs />
        <Pricing />
        <Trainers />
        <CTA />
        <Contact />
      </main>
      <Footer />
      <WhatsAppButton />
      <StickyJoinNow />
    </div>
  );
}
