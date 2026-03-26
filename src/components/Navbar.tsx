import { motion } from "motion/react";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-brand-dark/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex-shrink-0">
            <a href="#" className="flex items-center gap-2">
              <span className="text-2xl font-display font-black tracking-tighter italic">
                AIM<span className="text-brand-accent">FIT</span>
              </span>
            </a>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <a href="#about" className="hover:text-brand-accent transition-colors uppercase text-sm font-semibold">About</a>
              <a href="#services" className="hover:text-brand-accent transition-colors uppercase text-sm font-semibold">Services</a>
              <a href="#gallery" className="hover:text-brand-accent transition-colors uppercase text-sm font-semibold">Gallery</a>
              <a href="#pricing" className="hover:text-brand-accent transition-colors uppercase text-sm font-semibold">Pricing</a>
              <a href="#trainers" className="hover:text-brand-accent transition-colors uppercase text-sm font-semibold">Trainers</a>
              <a href="#contact" className="btn-primary !py-2 !px-6">Join Now</a>
            </div>
          </div>
          
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-brand-accent focus:outline-none"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-brand-dark border-b border-white/10"
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <a href="#about" onClick={() => setIsOpen(false)} className="block px-3 py-4 text-base font-medium hover:bg-white/5 uppercase">About</a>
            <a href="#services" onClick={() => setIsOpen(false)} className="block px-3 py-4 text-base font-medium hover:bg-white/5 uppercase">Services</a>
            <a href="#gallery" onClick={() => setIsOpen(false)} className="block px-3 py-4 text-base font-medium hover:bg-white/5 uppercase">Gallery</a>
            <a href="#pricing" onClick={() => setIsOpen(false)} className="block px-3 py-4 text-base font-medium hover:bg-white/5 uppercase">Pricing</a>
            <a href="#trainers" onClick={() => setIsOpen(false)} className="block px-3 py-4 text-base font-medium hover:bg-white/5 uppercase">Trainers</a>
            <a href="#contact" onClick={() => setIsOpen(false)} className="block px-3 py-4 text-base font-bold text-brand-accent uppercase">Join Now</a>
          </div>
        </motion.div>
      )}
    </nav>
  );
}
