import { useState, useEffect } from 'react';
import { motion } from "motion/react";
import { ChevronRight, Play } from "lucide-react";
import { db } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export default function Hero() {
  const [settings, setSettings] = useState({
    heroTitle: 'TRANSFORM YOUR BODY AT AIMFIT',
    heroSubtitle: 'Achieve your dream physique with professional guidance, elite equipment, and a community that pushes you.'
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'site'), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setSettings({
          heroTitle: data.heroTitle || 'TRANSFORM YOUR BODY AT AIMFIT',
          heroSubtitle: data.heroSubtitle || 'Achieve your dream physique with professional guidance, elite equipment, and a community that pushes you.'
        });
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop" 
          alt="Gym Background" 
          className="w-full h-full object-cover opacity-40"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/60 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-brand-dark via-transparent to-transparent"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block py-1 px-3 bg-brand-accent text-white text-xs font-bold uppercase tracking-widest mb-6">
              Best Gym in India
            </span>
            <h1 className="text-6xl md:text-8xl font-black leading-[0.9] mb-6 uppercase">
              {settings.heroTitle}
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-xl font-medium">
              {settings.heroSubtitle}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#pricing" className="btn-primary flex items-center justify-center gap-2 group">
                Join Now <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </a>
              <a href="#contact" className="btn-secondary flex items-center justify-center gap-2">
                Book Free Trial <Play size={18} fill="currentColor" />
              </a>
            </div>

            <div className="mt-12 flex items-center gap-8 border-t border-white/10 pt-8">
              <div>
                <p className="text-3xl font-bold font-display">500+</p>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Members</p>
              </div>
              <div className="w-px h-10 bg-white/10"></div>
              <div>
                <p className="text-3xl font-bold font-display">10+</p>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Trainers</p>
              </div>
              <div className="w-px h-10 bg-white/10"></div>
              <div>
                <p className="text-3xl font-bold font-display">15+</p>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Programs</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Decorative element */}
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-brand-accent/10 rounded-full blur-3xl"></div>
    </section>
  );
}
