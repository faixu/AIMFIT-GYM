import { useState, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { db } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export default function WhatsAppButton() {
  const [whatsappNumber, setWhatsappNumber] = useState('919622427566');
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'site'), (doc) => {
      if (doc.exists()) {
        setWhatsappNumber(doc.data().whatsappNumber || '919622427566');
      }
    });

    // Show message bubble after 3 seconds
    const timer = setTimeout(() => {
      setShowMessage(true);
    }, 3000);

    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      <AnimatePresence>
        {showMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="bg-white text-brand-dark p-4 rounded-2xl rounded-br-none shadow-2xl max-w-[200px] relative group"
          >
            <button 
              onClick={() => setShowMessage(false)}
              className="absolute -top-2 -right-2 w-6 h-6 bg-brand-accent text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
            >
              <X size={14} />
            </button>
            <p className="text-sm font-bold leading-tight">
              Hey! 👋 Need help with your fitness journey?
            </p>
            <div className="absolute -bottom-2 right-0 w-4 h-4 bg-white transform rotate-45"></div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.a
        href={`https://wa.me/${whatsappNumber}`}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="w-16 h-16 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-2xl hover:shadow-[#25D366]/40 transition-shadow relative"
      >
        <MessageCircle size={32} fill="currentColor" />
        <span className="absolute -top-1 -left-1 w-4 h-4 bg-brand-accent rounded-full border-2 border-white animate-pulse"></span>
        <span className="absolute -top-2 -left-2 bg-brand-accent text-white text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tighter">
          Online
        </span>
      </motion.a>
    </div>
  );
}
