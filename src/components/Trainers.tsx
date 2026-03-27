import { motion } from "motion/react";
import { Instagram, Twitter } from "lucide-react";
import { useState, useEffect } from "react";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";

const staticTrainers = [
  {
    name: "Vikram Singh",
    specialty: "Bodybuilding Expert",
    bio: "10+ years experience in competitive bodybuilding and transformation.",
    image: "https://images.unsplash.com/photo-1567013127542-490d757e51fe?q=80&w=1974&auto=format&fit=crop"
  },
  {
    name: "Arjun Kapoor",
    specialty: "Strength & Conditioning",
    bio: "Certified specialist focused on functional strength and athletic performance.",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop"
  },
  {
    name: "Sanya Malhotra",
    specialty: "Weight Loss Specialist",
    bio: "Helped over 200+ clients achieve their weight loss goals through HIIT.",
    image: "https://images.unsplash.com/photo-1518310383802-640c2de311b2?q=80&w=2070&auto=format&fit=crop"
  }
];

export default function Trainers() {
  const [trainers, setTrainers] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'trainers'), (snapshot) => {
      if (!snapshot.empty) {
        setTrainers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } else {
        setTrainers(staticTrainers);
      }
    }, (error) => {
      console.error('Error fetching trainers:', error);
      try {
        handleFirestoreError(error, OperationType.GET, 'trainers');
      } catch (e) {}
      setTrainers(staticTrainers);
    });
    return () => unsubscribe();
  }, []);
  return (
    <section id="trainers" className="py-24 bg-brand-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl mb-4">Meet Your <span className="text-brand-accent">Mentors</span></h2>
          <p className="text-gray-400 max-w-2xl mx-auto">Our trainers are not just instructors; they are partners in your fitness journey.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {trainers.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group"
            >
              <div className="relative aspect-[3/4] overflow-hidden rounded-2xl mb-6">
                <img 
                  src={t.image} 
                  alt={t.name} 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-transparent to-transparent opacity-60"></div>
                
                <div className="absolute bottom-6 left-6 right-6 flex justify-center gap-4 translate-y-10 group-hover:translate-y-0 transition-transform duration-300">
                  <a href="#" className="w-10 h-10 bg-brand-accent rounded-full flex items-center justify-center hover:bg-white hover:text-brand-accent transition-colors">
                    <Instagram size={18} />
                  </a>
                  <a href="#" className="w-10 h-10 bg-brand-accent rounded-full flex items-center justify-center hover:bg-white hover:text-brand-accent transition-colors">
                    <Twitter size={18} />
                  </a>
                </div>
              </div>
              
              <h3 className="text-2xl mb-1">{t.name}</h3>
              <p className="text-brand-accent font-bold text-xs uppercase tracking-widest mb-3">{t.specialty}</p>
              <p className="text-gray-400 text-sm leading-relaxed">{t.bio}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
