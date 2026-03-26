import { motion } from "motion/react";
import { MessageSquare } from "lucide-react";

export default function CTA() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=2069&auto=format&fit=crop" 
          alt="CTA Background" 
          className="w-full h-full object-cover opacity-20"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-brand-accent/20 mix-blend-overlay"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-5xl md:text-7xl mb-8 leading-none">Ready to <span className="text-brand-accent italic">Transform</span> Your Life?</h2>
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Join AimFit Gym today and start your journey towards a healthier, stronger you. Limited slots available for this month!
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <a href="#contact" className="btn-primary !py-5 !px-12 text-lg w-full sm:w-auto">
              Join Now
            </a>
            <a 
              href="https://wa.me/919876543210" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-white font-bold uppercase tracking-widest hover:text-brand-accent transition-colors"
            >
              <MessageSquare size={24} className="text-brand-accent" />
              WhatsApp Us
            </a>
          </div>
          
          <p className="mt-8 text-brand-accent font-bold animate-pulse uppercase tracking-widest text-sm">
            🔥 15 Slots Left for Free Trial!
          </p>
        </motion.div>
      </div>
    </section>
  );
}
