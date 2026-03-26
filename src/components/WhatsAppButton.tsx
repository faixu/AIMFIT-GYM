import { MessageCircle } from "lucide-react";
import { motion } from "motion/react";

export default function WhatsAppButton() {
  return (
    <motion.a
      href="https://wa.me/919876543210"
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-2xl hover:shadow-[#25D366]/40 transition-shadow"
    >
      <MessageCircle size={32} fill="currentColor" />
      <span className="absolute -top-2 -left-2 bg-brand-accent text-white text-[10px] font-bold px-2 py-1 rounded-full animate-pulse">
        Online
      </span>
    </motion.a>
  );
}
