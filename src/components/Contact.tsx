import { motion } from "motion/react";
import { Phone, Mail, MapPin, Clock, Send } from "lucide-react";
import { useState, type FormEvent } from "react";

export default function Contact() {
  const [formState, setFormState] = useState({
    name: "",
    phone: "",
    goal: "Weight Loss"
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    alert("Thank you! Our team will contact you shortly.");
    setFormState({ name: "", phone: "", goal: "Weight Loss" });
  };

  return (
    <section id="contact" className="py-24 bg-brand-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl mb-8">Get in <span className="text-brand-accent">Touch</span></h2>
            <p className="text-gray-400 mb-12 text-lg">
              Have questions? Want to book a free trial? Fill out the form or reach out to us directly.
            </p>
            
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-brand-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone className="text-brand-accent" size={24} />
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-500 font-bold mb-1">Phone</p>
                  <p className="text-xl font-bold">+91 98765 43210</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-brand-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="text-brand-accent" size={24} />
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-500 font-bold mb-1">Email</p>
                  <p className="text-xl font-bold">hello@aimfitgym.com</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-brand-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="text-brand-accent" size={24} />
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-500 font-bold mb-1">Location</p>
                  <p className="text-xl font-bold">123 Fitness Lane, Sector 45, Gurgaon, India</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-brand-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="text-brand-accent" size={24} />
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-500 font-bold mb-1">Opening Hours</p>
                  <p className="text-lg font-bold">Mon - Sat: 5:00 AM - 11:00 PM</p>
                  <p className="text-lg font-bold">Sun: 7:00 AM - 1:00 PM</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-card p-8 md:p-12 rounded-3xl"
          >
            <h3 className="text-2xl mb-8 uppercase tracking-tight">Claim Your Free Trial</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={formState.name}
                  onChange={(e) => setFormState({...formState, name: e.target.value})}
                  placeholder="Enter your name"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-6 focus:outline-none focus:border-brand-accent transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Phone Number</label>
                <input 
                  type="tel" 
                  required
                  value={formState.phone}
                  onChange={(e) => setFormState({...formState, phone: e.target.value})}
                  placeholder="Enter your phone number"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-6 focus:outline-none focus:border-brand-accent transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Fitness Goal</label>
                <select 
                  value={formState.goal}
                  onChange={(e) => setFormState({...formState, goal: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-6 focus:outline-none focus:border-brand-accent transition-colors appearance-none"
                >
                  <option className="bg-brand-dark">Weight Loss</option>
                  <option className="bg-brand-dark">Muscle Gain</option>
                  <option className="bg-brand-dark">General Fitness</option>
                  <option className="bg-brand-dark">Personal Training</option>
                </select>
              </div>
              
              <button type="submit" className="w-full btn-primary flex items-center justify-center gap-2 py-5">
                Get Started Now <Send size={18} />
              </button>
              
              <p className="text-center text-xs text-gray-500">
                By submitting, you agree to our terms and privacy policy.
              </p>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
