import { motion } from "motion/react";
import { ShieldCheck, Clock, Award, Sparkles } from "lucide-react";

const features = [
  {
    title: "Affordable Pricing",
    description: "Premium fitness shouldn't break the bank. We offer the best rates in the city.",
    icon: ShieldCheck
  },
  {
    title: "Flexible Hours",
    description: "Open early morning to late night to fit your busy schedule.",
    icon: Clock
  },
  {
    title: "Certified Trainers",
    description: "Our team consists of internationally certified fitness professionals.",
    icon: Award
  },
  {
    title: "Modern Equipment",
    description: "Train with the latest biomechanically correct machines and free weights.",
    icon: Sparkles
  }
];

export default function WhyChooseUs() {
  return (
    <section className="py-24 bg-brand-gray relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl mb-8">Why <span className="text-brand-accent">AimFit</span> Gym?</h2>
            <p className="text-gray-400 mb-12 text-lg">
              We provide an environment that fosters growth, discipline, and results. Here's what sets us apart from the rest.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {features.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="w-12 h-12 bg-brand-accent/10 rounded-lg flex items-center justify-center mb-4">
                    <f.icon className="text-brand-accent" size={24} />
                  </div>
                  <h3 className="text-lg mb-2">{f.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{f.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-square rounded-full border-2 border-brand-accent/20 flex items-center justify-center p-8">
              <div className="aspect-square w-full rounded-full overflow-hidden border-4 border-brand-accent">
                <img 
                  src="https://images.unsplash.com/photo-1593079831268-3381b0db4a77?q=80&w=2069&auto=format&fit=crop" 
                  alt="Gym Motivation" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
            
            {/* Floating badges */}
            <div className="absolute top-10 -left-10 glass-card p-4 rounded-xl animate-bounce">
              <p className="text-xs font-bold uppercase tracking-widest">Clean & Safe</p>
            </div>
            <div className="absolute bottom-20 -right-10 glass-card p-4 rounded-xl animate-pulse">
              <p className="text-xs font-bold uppercase tracking-widest">Result Focused</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
