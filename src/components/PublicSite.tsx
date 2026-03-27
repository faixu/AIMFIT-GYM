import React, { useState, useEffect } from 'react';
import { db, collection, onSnapshot, query, orderBy } from '../firebase';
import { ContentSection } from '../types';
import { motion } from 'motion/react';
import { ArrowRight, Globe, Zap, Shield, Sparkles } from 'lucide-react';

const PublicSite: React.FC = () => {
  const [sections, setSections] = useState<ContentSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'siteContent'), orderBy('updatedAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ContentSection));
      setSections(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white font-sans">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-zinc-900"></div>
      </div>
    );
  }

  const hero = sections.find(s => s.id === 'hero') || { title: 'Dynamic CMS Website', subtitle: 'Manage your website content in real-time with an invisible admin portal.' };
  const features = sections.filter(s => s.id.startsWith('feature'));

  return (
    <div className="min-h-screen bg-white font-sans overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
              <Globe className="text-white w-4 h-4" />
            </div>
            <span className="font-bold text-xl tracking-tight text-zinc-900">DynamicSite</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors">Features</a>
            <a href="#" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors">About</a>
            <a href="#" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors">Pricing</a>
            <button className="bg-zinc-900 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-zinc-800 transition-all active:scale-95 shadow-lg shadow-zinc-200">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 relative">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-zinc-100 px-4 py-2 rounded-full text-zinc-600 text-xs font-bold uppercase tracking-widest mb-8"
          >
            <Sparkles className="w-3 h-3" />
            Powered by Firestore
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-black text-zinc-900 tracking-tighter leading-[0.9] mb-8"
          >
            {hero.title}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-zinc-500 max-w-2xl mx-auto mb-12"
          >
            {hero.subtitle}
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button className="w-full sm:w-auto bg-zinc-900 text-white px-10 py-5 rounded-2xl text-lg font-bold hover:bg-zinc-800 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-2xl shadow-zinc-300">
              Start Building
              <ArrowRight className="w-5 h-5" />
            </button>
            <button className="w-full sm:w-auto bg-white text-zinc-900 border-2 border-zinc-100 px-10 py-5 rounded-2xl text-lg font-bold hover:bg-zinc-50 transition-all active:scale-95">
              View Demo
            </button>
          </motion.div>
        </div>

        {/* Background Accents */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-zinc-100 rounded-full blur-[120px] opacity-50" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-zinc-100 rounded-full blur-[120px] opacity-50" />
        </div>
      </section>

      {/* Dynamic Sections */}
      <section className="py-24 px-6 bg-zinc-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <motion.div 
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-10 rounded-[40px] border border-zinc-100 shadow-sm hover:shadow-xl transition-all group"
              >
                <div className="w-14 h-14 bg-zinc-900 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  {idx === 0 ? <Zap className="text-white w-6 h-6" /> : idx === 1 ? <Shield className="text-white w-6 h-6" /> : <Sparkles className="text-white w-6 h-6" />}
                </div>
                <h3 className="text-2xl font-bold text-zinc-900 mb-4">{feature.title}</h3>
                <p className="text-zinc-500 leading-relaxed">{feature.subtitle}</p>
              </motion.div>
            ))}
            {features.length === 0 && (
              <div className="col-span-full text-center py-20 text-zinc-400 font-medium">
                Add features in the admin portal to see them here.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-zinc-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
              <Globe className="text-white w-4 h-4" />
            </div>
            <span className="font-bold text-xl tracking-tight text-zinc-900">DynamicSite</span>
          </div>
          <p className="text-zinc-400 text-sm">© 2026 DynamicSite CMS. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-zinc-400 hover:text-zinc-900 transition-colors"><Globe className="w-5 h-5" /></a>
            <a href="#" className="text-zinc-400 hover:text-zinc-900 transition-colors"><Zap className="w-5 h-5" /></a>
            <a href="#" className="text-zinc-400 hover:text-zinc-900 transition-colors"><Shield className="w-5 h-5" /></a>
            <a href="/admin-portal" className="opacity-0 hover:opacity-10 text-[8px] text-zinc-300 transition-all cursor-default">Admin</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicSite;
