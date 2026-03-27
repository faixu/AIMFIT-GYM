import { useState, useEffect } from "react";
import { Instagram, Facebook, Youtube, Twitter } from "lucide-react";
import { Link } from "react-router-dom";
import { db } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export default function Footer() {
  const [settings, setSettings] = useState({
    instagramUrl: 'https://instagram.com/aimfitgym',
    facebookUrl: 'https://facebook.com/aimfitgym'
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'site'), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setSettings({
          instagramUrl: data.instagramUrl || 'https://instagram.com/aimfitgym',
          facebookUrl: data.facebookUrl || 'https://facebook.com/aimfitgym'
        });
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <footer className="bg-brand-dark border-t border-white/10 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <a href="#" className="flex items-center gap-2 mb-6">
              <span className="text-3xl font-display font-black tracking-tighter italic">
                AIM<span className="text-brand-accent">FIT</span>
              </span>
            </a>
            <p className="text-gray-400 mb-8 leading-relaxed">
              The ultimate fitness destination in India. We combine elite training with an affordable approach to help you achieve real results.
            </p>
            <div className="flex gap-4">
              <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-accent transition-colors">
                <Instagram size={20} />
              </a>
              <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-accent transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-accent transition-colors">
                <Youtube size={20} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-accent transition-colors">
                <Twitter size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-bold uppercase mb-6 tracking-wider">Quick Links</h4>
            <ul className="space-y-4 text-gray-400">
              <li><a href="#about" className="hover:text-brand-accent transition-colors">About Us</a></li>
              <li><a href="#services" className="hover:text-brand-accent transition-colors">Our Services</a></li>
              <li><a href="#pricing" className="hover:text-brand-accent transition-colors">Membership Plans</a></li>
              <li><a href="#trainers" className="hover:text-brand-accent transition-colors">Our Trainers</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-bold uppercase mb-6 tracking-wider">Programs</h4>
            <ul className="space-y-4 text-gray-400">
              <li><a href="#" className="hover:text-brand-accent transition-colors">Body Building</a></li>
              <li><a href="#" className="hover:text-brand-accent transition-colors">Weight Loss</a></li>
              <li><a href="#" className="hover:text-brand-accent transition-colors">Functional Training</a></li>
              <li><a href="#" className="hover:text-brand-accent transition-colors">Yoga & Flexibility</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-bold uppercase mb-6 tracking-wider">Newsletter</h4>
            <p className="text-gray-400 mb-6 text-sm">Get fitness tips and special offers directly in your inbox.</p>
            <form className="flex gap-2">
              <input 
                type="email" 
                placeholder="Email Address" 
                className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-brand-accent w-full"
              />
              <button className="bg-brand-accent p-2 rounded-lg hover:bg-red-700 transition-colors">
                &rarr;
              </button>
            </form>
          </div>
        </div>
        
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-500 text-xs uppercase tracking-widest">
          <p>© 2026 AimFit Gym. All Rights Reserved.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
