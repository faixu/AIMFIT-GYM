import { useState, useEffect, useRef } from 'react';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { Save, Settings as SettingsIcon, Globe, Phone, Mail, MapPin, MessageSquare, QrCode, Upload, X, Info, Dumbbell, ShieldCheck, Star, Smartphone } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    heroTitle: 'PUSH YOUR LIMITS. ACHIEVE YOUR GOALS.',
    heroSubtitle: 'The most results-driven gym in India. Professional trainers, state-of-the-art equipment, and a community that pushes you to be your best.',
    aboutTitle: 'Built for Discipline, Driven by Results',
    aboutSubtitle: 'Our Story',
    aboutDescription: 'At AimFit Gym, we believe fitness is not just about looking good; it\'s about building a stronger, more disciplined version of yourself. Our mission is to provide world-class training facilities that are affordable for everyone.',
    aboutYears: '10+',
    servicesTitle: 'Our Expertise',
    servicesSubtitle: 'We offer specialized programs tailored to your specific needs, whether you\'re a pro athlete or a complete beginner.',
    whyChooseTitle: 'Why AimFit Gym?',
    whyChooseSubtitle: 'We provide an environment that fosters growth, discipline, and results. Here\'s what sets us apart from the rest.',
    socialProofTitle: 'Real Results, Real People',
    socialProofSubtitle: 'Don\'t just take our word for it. Hear from our members who transformed their lives at AimFit.',
    contactPhone: '+91 96224 27566',
    contactEmail: 'info@aimfitgym.com',
    contactAddress: '123 Fitness Street, Gym Nagar, Mumbai, Maharashtra 400001',
    whatsappNumber: '919622427566',
    instagramUrl: 'https://instagram.com/aimfitgym',
    facebookUrl: 'https://facebook.com/aimfitgym',
    upiQrCode: '',
    gpayNumber: '+91 96224 27566',
    gpayUpiId: '9622427566@okbizaxis'
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        toast.error('Image size must be less than 1MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings({ ...settings, upiQrCode: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

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

          {/* About Section */}
          <div className="space-y-6">
            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-brand-accent flex items-center gap-2">
              <Info size={16} />
              About Section
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase text-gray-500 mb-2 tracking-widest">About Title</label>
                <input 
                  type="text" 
                  value={settings.aboutTitle}
                  onChange={e => setSettings({...settings, aboutTitle: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-brand-accent outline-none transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-2 tracking-widest">About Subtitle</label>
                <input 
                  type="text" 
                  value={settings.aboutSubtitle}
                  onChange={e => setSettings({...settings, aboutSubtitle: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-brand-accent outline-none transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-2 tracking-widest">Years of Excellence</label>
                <input 
                  type="text" 
                  value={settings.aboutYears}
                  onChange={e => setSettings({...settings, aboutYears: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-brand-accent outline-none transition-all"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase text-gray-500 mb-2 tracking-widest">About Description</label>
                <textarea 
                  value={settings.aboutDescription}
                  onChange={e => setSettings({...settings, aboutDescription: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-brand-accent outline-none transition-all min-h-[100px]"
                  required
                />
              </div>
            </div>
          </div>

          <div className="h-px bg-white/5"></div>

          {/* Services Section */}
          <div className="space-y-6">
            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-brand-accent flex items-center gap-2">
              <Dumbbell size={16} />
              Services Section
            </h4>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-2 tracking-widest">Services Title</label>
                <input 
                  type="text" 
                  value={settings.servicesTitle}
                  onChange={e => setSettings({...settings, servicesTitle: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-brand-accent outline-none transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-2 tracking-widest">Services Subtitle</label>
                <textarea 
                  value={settings.servicesSubtitle}
                  onChange={e => setSettings({...settings, servicesSubtitle: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-brand-accent outline-none transition-all min-h-[80px]"
                  required
                />
              </div>
            </div>
          </div>

          <div className="h-px bg-white/5"></div>

          {/* Why Choose Us Section */}
          <div className="space-y-6">
            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-brand-accent flex items-center gap-2">
              <ShieldCheck size={16} />
              Why Choose Us Section
            </h4>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-2 tracking-widest">Why Choose Us Title</label>
                <input 
                  type="text" 
                  value={settings.whyChooseTitle}
                  onChange={e => setSettings({...settings, whyChooseTitle: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-brand-accent outline-none transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-2 tracking-widest">Why Choose Us Subtitle</label>
                <textarea 
                  value={settings.whyChooseSubtitle}
                  onChange={e => setSettings({...settings, whyChooseSubtitle: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-brand-accent outline-none transition-all min-h-[80px]"
                  required
                />
              </div>
            </div>
          </div>

          <div className="h-px bg-white/5"></div>

          {/* Social Proof Section */}
          <div className="space-y-6">
            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-brand-accent flex items-center gap-2">
              <Star size={16} />
              Social Proof Section
            </h4>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-2 tracking-widest">Social Proof Title</label>
                <input 
                  type="text" 
                  value={settings.socialProofTitle}
                  onChange={e => setSettings({...settings, socialProofTitle: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-brand-accent outline-none transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-2 tracking-widest">Social Proof Subtitle</label>
                <textarea 
                  value={settings.socialProofSubtitle}
                  onChange={e => setSettings({...settings, socialProofSubtitle: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-brand-accent outline-none transition-all min-h-[80px]"
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
                  placeholder="e.g. 919622427566"
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

          <div className="h-px bg-white/5"></div>

          {/* Payment Settings */}
          <div className="space-y-6">
            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-brand-accent flex items-center gap-2">
              <QrCode size={16} />
              Payment Settings
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-2 tracking-widest">Google Pay Number</label>
                <div className="relative">
                  <Smartphone size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input 
                    type="text" 
                    value={settings.gpayNumber}
                    onChange={e => setSettings({...settings, gpayNumber: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-4 focus:border-brand-accent outline-none transition-all"
                    placeholder="+91 96224 27566"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-2 tracking-widest">Google Pay UPI ID</label>
                <div className="relative">
                  <QrCode size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input 
                    type="text" 
                    value={settings.gpayUpiId}
                    onChange={e => setSettings({...settings, gpayUpiId: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-4 focus:border-brand-accent outline-none transition-all"
                    placeholder="9622427566@okbizaxis"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-2 tracking-widest">UPI QR Code Scanner</label>
                <p className="text-sm text-gray-400 mb-4">Upload your UPI QR code image. This will be shown to customers during checkout.</p>
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-secondary w-full py-4 flex items-center justify-center gap-3"
                >
                  <Upload size={18} />
                  {settings.upiQrCode ? 'Change QR Code' : 'Upload QR Code'}
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>
              <div className="flex justify-center">
                {settings.upiQrCode ? (
                  <div className="relative group">
                    <div className="w-48 h-48 bg-white p-4 rounded-2xl shadow-2xl">
                      <img src={settings.upiQrCode} alt="UPI QR Code" className="w-full h-full object-contain" />
                    </div>
                    <button 
                      type="button"
                      onClick={() => setSettings({...settings, upiQrCode: ''})}
                      className="absolute -top-2 -right-2 w-8 h-8 bg-brand-accent rounded-full flex items-center justify-center text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="w-48 h-48 bg-white/5 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-gray-600">
                    <QrCode size={48} />
                    <span className="text-[10px] uppercase font-bold mt-2">No QR Code</span>
                  </div>
                )}
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
