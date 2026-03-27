import { motion } from "motion/react";
import { Star } from "lucide-react";
import { useState, useEffect } from "react";
import { db } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

const testimonials = [
  {
    name: "Rahul Sharma",
    role: "Member since 2023",
    content: "The trainers at AimFit actually care about your progress. I've lost 12kg in 4 months with their guidance.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1974&auto=format&fit=crop"
  },
  {
    name: "Priya Patel",
    role: "Personal Training Client",
    content: "Best gym in the area! The environment is energetic and the equipment is top-notch. Highly recommended.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1974&auto=format&fit=crop"
  },
  {
    name: "Ankit Verma",
    role: "Bodybuilder",
    content: "If you're serious about muscle gain, this is the place. The community here is incredibly supportive.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1974&auto=format&fit=crop"
  }
];

export default function SocialProof() {
  const [settings, setSettings] = useState({
    socialProofTitle: 'Real Results, Real People',
    socialProofSubtitle: 'Don\'t just take our word for it. Hear from our members who transformed their lives at AimFit.'
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'site'), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setSettings({
          socialProofTitle: data.socialProofTitle || 'Real Results, Real People',
          socialProofSubtitle: data.socialProofSubtitle || 'Don\'t just take our word for it. Hear from our members who transformed their lives at AimFit.'
        });
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <section className="py-24 bg-brand-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl mb-4">
            {settings.socialProofTitle.split(',').map((part, i) => (
              <span key={i}>
                {i > 0 && <span className="text-brand-accent">, {part}</span>}
                {i === 0 && part}
              </span>
            ))}
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto italic">{settings.socialProofSubtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="glass-card p-8 rounded-2xl relative"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} size={16} fill="#ff0000" className="text-brand-accent" />
                ))}
              </div>
              <p className="text-gray-300 mb-8 italic">"{t.content}"</p>
              <div className="flex items-center gap-4">
                <img src={t.image} alt={t.name} className="w-12 h-12 rounded-full object-cover border-2 border-brand-accent" referrerPolicy="no-referrer" />
                <div>
                  <p className="font-bold text-sm uppercase">{t.name}</p>
                  <p className="text-xs text-gray-500">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <p className="text-4xl font-black text-brand-accent mb-2">98%</p>
            <p className="text-xs uppercase tracking-widest text-gray-400">Success Rate</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-black text-brand-accent mb-2">4.9/5</p>
            <p className="text-xs uppercase tracking-widest text-gray-400">Google Rating</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-black text-brand-accent mb-2">1000+</p>
            <p className="text-xs uppercase tracking-widest text-gray-400">Transformations</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-black text-brand-accent mb-2">24/7</p>
            <p className="text-xs uppercase tracking-widest text-gray-400">Support</p>
          </div>
        </div>
      </div>
    </section>
  );
}
