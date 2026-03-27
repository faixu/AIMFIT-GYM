import { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { Save, Settings as SettingsIcon, Globe, Phone, Mail, MapPin, MessageSquare } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    heroTitle: 'PUSH YOUR LIMITS. ACHIEVE YOUR GOALS.',
    heroSubtitle: 'The most results-driven gym in India. Professional trainers, state-of-the-art equipment, and a community that pushes you to be your best.',
    contactPhone: '+91 98765 43210',
    contactEmail: 'info@aimfitgym.com',
    contactAddress: '123 Fitness Street, Gym Nagar, Mumbai, Maharashtra 400001',
    whatsappNumber: '919876543210',
    instagramUrl: 'https://instagram.com/aimfitgym',
    facebookUrl: 'https://facebook.com/aimfitgym'
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'site'), (doc) => {
      if (doc.exists()) {
        setSettings(prev => ({ ...prev, ...doc.data() }));
      }
    }, (error) => {
      console.error('Error fetching settings:', error);
    });
    return () => unsubscribe();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'site'), {
        ...settings,
        updatedAt: serverTimestamp()
      });
      toast.success('Settings saved successfully!');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'settings/site');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-10 rounded-3xl border-brand-accent/20"
      >
        <h3 className="text-2xl font-black mb-10 flex items-center gap-3 uppercase tracking-tight">
          <div className="w-10 h-10 bg-brand-accent/10 rounded-xl flex items-center justify-center">
            <SettingsIcon size={24} className="text-brand-accent" />
          </div>
          Site Settings
        </h3>

        <form onSubmit={handleSave} className="space-y-10">
          {/* Hero Section */}
          <div className="space-y-6">
            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-brand-accent flex items-center gap-2">
              <Globe size={16} />
              Hero Section
            </h4>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-2 tracking-widest">Hero Title</label>
                <input 
                  type="text" 
                  value={settings.heroTitle}
                  onChange={e => setSettings({...settings, heroTitle: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-brand-accent outline-none transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-2 tracking-widest">Hero Subtitle</label>
                <textarea 
                  value={settings.heroSubtitle}
                  onChange={e => setSettings({...settings, heroSubtitle: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-brand-accent outline-none transition-all min-h-[100px]"
                  required
                />
              </div>
            </div>
          </div>

          <div className="h-px bg-white/5"></div>

          {/* Contact Information */}
          <div className="space-y-6">
            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-brand-accent flex items-center gap-2">
              <Phone size={16} />
              Contact Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-2 tracking-widest">Phone Number</label>
                <div className="relative">
                  <Phone size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input 
                    type="text" 
                    value={settings.contactPhone}
                    onChange={e => setSettings({...settings, contactPhone: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-4 focus:border-brand-accent outline-none transition-all"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-2 tracking-widest">Email Address</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input 
                    type="email" 
                    value={settings.contactEmail}
                    onChange={e => setSettings({...settings, contactEmail: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-4 focus:border-brand-accent outline-none transition-all"
                    required
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase text-gray-500 mb-2 tracking-widest">Physical Address</label>
                <div className="relative">
                  <MapPin size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input 
                    type="text" 
                    value={settings.contactAddress}
                    onChange={e => setSettings({...settings, contactAddress: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-4 focus:border-brand-accent outline-none transition-all"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="h-px bg-white/5"></div>

          {/* Social Media */}
          <div className="space-y-6">
            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-brand-accent flex items-center gap-2">
              <MessageSquare size={16} />
              Social & WhatsApp
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-2 tracking-widest">WhatsApp (with country code)</label>
                <input 
                  type="text" 
                  value={settings.whatsappNumber}
                  onChange={e => setSettings({...settings, whatsappNumber: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-brand-accent outline-none transition-all"
                  placeholder="e.g. 919876543210"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-2 tracking-widest">Instagram URL</label>
                <input 
                  type="url" 
                  value={settings.instagramUrl}
                  onChange={e => setSettings({...settings, instagramUrl: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-brand-accent outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={saving}
            className="btn-primary w-full py-5 text-lg flex items-center justify-center gap-3 shadow-xl shadow-brand-accent/20"
          >
            <Save size={20} />
            {saving ? 'Saving Settings...' : 'Save All Settings'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
