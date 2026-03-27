import { motion } from "motion/react";
import { CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import { db } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export default function About() {
  const [settings, setSettings] = useState({
    aboutTitle: 'Built for Discipline, Driven by Results',
    aboutSubtitle: 'Our Story',
    aboutDescription: 'At AimFit Gym, we believe fitness is not just about looking good; it\'s about building a stronger, more disciplined version of yourself. Our mission is to provide world-class training facilities that are affordable for everyone.',
    aboutYears: '10+'
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'site'), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setSettings({
          aboutTitle: data.aboutTitle || 'Built for Discipline, Driven by Results',
          aboutSubtitle: data.aboutSubtitle || 'Our Story',
          aboutDescription: data.aboutDescription || 'At AimFit Gym, we believe fitness is not just about looking good; it\'s about building a stronger, more disciplined version of yourself. Our mission is to provide world-class training facilities that are affordable for everyone.',
          aboutYears: data.aboutYears || '10+'
        });
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <section id="about" className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-square rounded-2xl overflow-hidden border-2 border-brand-accent/20">
              <img 
                src="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=1975&auto=format&fit=crop" 
                alt="Gym Interior" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 glass-card p-6 rounded-xl hidden md:block">
              <p className="text-4xl font-black text-brand-accent">{settings.aboutYears}</p>
              <p className="text-xs uppercase font-bold">Years of Excellence</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-brand-accent font-bold uppercase tracking-widest text-sm mb-4 block">{settings.aboutSubtitle}</span>
            <h2 className="text-4xl md:text-5xl mb-8 leading-tight">
              {settings.aboutTitle.split(',').map((part, i) => (
                <span key={i}>
                  {i > 0 && <span className="text-brand-accent">, {part}</span>}
                  {i === 0 && part}
                </span>
              ))}
            </h2>
            <p className="text-gray-400 mb-8 text-lg leading-relaxed">
              {settings.aboutDescription}
            </p>
            
            <ul className="space-y-4 mb-10">
              {[
                "Certified & Experienced Trainers",
                "Clean & Sanitized Environment",
                "Latest International Equipment",
                "Personalized Nutrition Guidance",
                "Supportive Fitness Community"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-200">
                  <CheckCircle2 className="text-brand-accent" size={20} />
                  <span className="font-medium">{item}</span>
                </li>
              ))}
            </ul>

            <a href="#contact" className="btn-primary">Learn More About Us</a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
