import { motion } from "motion/react";
import { Check } from "lucide-react";
import { useState, useEffect } from "react";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";

const staticPlans = [
  {
    name: "Basic Plan",
    price: "2000",
    period: "month",
    features: [
      "Full Gym Access",
      "Standard Equipment",
      "Locker Room Access",
      "Free Orientation",
      "General Support"
    ],
    popular: false,
    cta: "Choose Plan"
  },
  {
    name: "Premium Plan",
    price: "2500",
    period: "month",
    features: [
      "Full Gym Access",
      "Trainer Assistance",
      "Personalized Guidance",
      "Nutrition Plan",
      "Progress Tracking",
      "Priority Support"
    ],
    popular: true,
    cta: "Choose Plan"
  },
  {
    name: "Quarterly Plan",
    price: "6000",
    period: "3 months",
    features: [
      "All Premium Features",
      "Discounted Rate",
      "Body Composition Analysis",
      "1 PT Session Free",
      "Supplement Advice"
    ],
    popular: false,
    cta: "Save Now"
  }
];

export default function Pricing() {
  const [plans, setPlans] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'pricing'), (snapshot) => {
      if (!snapshot.empty) {
        setPlans(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } else {
        setPlans(staticPlans);
      }
    }, (error) => {
      console.error('Error fetching pricing:', error);
      try {
        handleFirestoreError(error, OperationType.GET, 'pricing');
      } catch (e) {}
      setPlans(staticPlans);
    });
    return () => unsubscribe();
  }, []);
  return (
    <section id="pricing" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl mb-4">Simple <span className="text-brand-accent">Pricing</span></h2>
          <p className="text-gray-400 max-w-2xl mx-auto">No hidden fees. No long-term contracts. Just results-driven fitness at an affordable price.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {plans.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative p-8 rounded-3xl border-2 ${p.popular ? 'bg-brand-gray border-brand-accent scale-105 z-10' : 'bg-transparent border-white/10'} transition-all duration-300`}
            >
              {p.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-accent text-white text-[10px] font-black uppercase tracking-[0.2em] py-1 px-4 rounded-full">
                  Most Popular
                </div>
              )}
              
              <h3 className="text-2xl mb-2">{p.name}</h3>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-4xl font-black font-display">₹{p.price}</span>
                <span className="text-gray-500 text-sm">/{p.period}</span>
              </div>

              <ul className="space-y-4 mb-10">
                {p.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-3 text-sm text-gray-300">
                    <Check size={16} className="text-brand-accent flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <a 
                href="#contact" 
                className={`w-full block text-center py-4 rounded-xl font-bold uppercase tracking-widest text-sm transition-all ${p.popular ? 'bg-brand-accent text-white hover:bg-red-700' : 'bg-white/10 text-white hover:bg-white/20'}`}
              >
                {p.cta}
              </a>
            </motion.div>
          ))}
        </div>
        
        <p className="text-center mt-12 text-gray-500 text-sm italic">
          * Prices are inclusive of all taxes. Special student discounts available at the front desk.
        </p>
      </div>
    </section>
  );
}
