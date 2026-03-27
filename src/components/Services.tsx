import { motion } from "motion/react";
import { Dumbbell, Zap, Users, Target, HeartPulse } from "lucide-react";
import { useState, useEffect } from "react";
import { db } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

const services = [
  {
    title: "Strength Training",
    description: "Build raw power and muscle with our extensive free weights and machine section.",
    icon: Dumbbell,
    color: "bg-red-500/10"
  },
  {
    title: "Weight Loss",
    description: "Burn fat efficiently with customized cardio and high-intensity interval training.",
    icon: Zap,
    color: "bg-orange-500/10"
  },
  {
    title: "Personal Training",
    description: "Get 1-on-1 attention from experts to fast-track your fitness goals.",
    icon: Users,
    color: "bg-blue-500/10"
  },
  {
    title: "Muscle Building",
    description: "Hypertrophy focused programs designed to maximize your muscle growth.",
    icon: Target,
    color: "bg-green-500/10"
  },
  {
    title: "Beginner Guidance",
    description: "New to the gym? We provide the support you need to start your journey safely.",
    icon: HeartPulse,
    color: "bg-purple-500/10"
  }
];

export default function Services() {
  const [settings, setSettings] = useState({
    servicesTitle: 'Our Expertise',
    servicesSubtitle: 'We offer specialized programs tailored to your specific needs, whether you\'re a pro athlete or a complete beginner.'
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'site'), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setSettings({
          servicesTitle: data.servicesTitle || 'Our Expertise',
          servicesSubtitle: data.servicesSubtitle || 'We offer specialized programs tailored to your specific needs, whether you\'re a pro athlete or a complete beginner.'
        });
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <section id="services" className="py-24 bg-brand-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl mb-4">
            {settings.servicesTitle.split(' ').map((word, i, arr) => (
              <span key={i}>
                {i === arr.length - 1 ? <span className="text-brand-accent">{word}</span> : word + ' '}
              </span>
            ))}
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">{settings.servicesSubtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -10 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-8 rounded-2xl group transition-all duration-300 hover:border-brand-accent/50"
            >
              <div className={`w-14 h-14 ${s.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <s.icon className="text-brand-accent" size={28} />
              </div>
              <h3 className="text-xl mb-4">{s.title}</h3>
              <p className="text-gray-400 mb-8 leading-relaxed">{s.description}</p>
              <a href="#contact" className="text-brand-accent font-bold uppercase text-xs tracking-widest flex items-center gap-2 hover:gap-3 transition-all">
                Start Now <span>&rarr;</span>
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
