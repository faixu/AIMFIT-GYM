import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { Maximize2, X } from "lucide-react";

const categories = ["All", "Transformations", "Training", "Community"];

const galleryImages = [
  {
    id: 1,
    category: "Training",
    title: "Heavy Squats",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: 2,
    category: "Transformations",
    title: "12 Week Progress",
    image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: 3,
    category: "Training",
    title: "Deadlift Day",
    image: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?q=80&w=1974&auto=format&fit=crop"
  },
  {
    id: 4,
    category: "Community",
    title: "Group Session",
    image: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=1975&auto=format&fit=crop"
  },
  {
    id: 5,
    category: "Transformations",
    title: "Muscle Gain",
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: 6,
    category: "Training",
    title: "Bicep Curls",
    image: "https://images.unsplash.com/photo-1581009146145-b5ef03a7403f?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: 7,
    category: "Community",
    title: "Post Workout",
    image: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=2069&auto=format&fit=crop"
  },
  {
    id: 8,
    category: "Training",
    title: "Shoulder Press",
    image: "https://images.unsplash.com/photo-1541534401786-2077ee43cd57?q=80&w=2070&auto=format&fit=crop"
  }
];

export default function Gallery() {
  const [filter, setFilter] = useState("All");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const filteredImages = filter === "All" 
    ? galleryImages 
    : galleryImages.filter(img => img.category === filter);

  return (
    <section id="gallery" className="py-24 bg-brand-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl mb-4">Our <span className="text-brand-accent italic">Gallery</span></h2>
          <p className="text-gray-400 max-w-2xl mx-auto">Witness the hard work, dedication, and transformations of our AimFit family.</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-6 py-2 rounded-full text-sm font-bold uppercase tracking-widest transition-all ${
                filter === cat 
                  ? "bg-brand-accent text-white shadow-lg shadow-brand-accent/20" 
                  : "bg-white/5 text-gray-400 hover:bg-white/10"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Image Grid */}
        <motion.div 
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredImages.map((img) => (
              <motion.div
                key={img.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="group relative aspect-square overflow-hidden rounded-2xl cursor-pointer"
                onClick={() => setSelectedImage(img.image)}
              >
                <img 
                  src={img.image} 
                  alt={img.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-brand-dark/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4 text-center">
                  <Maximize2 className="text-brand-accent mb-2" size={24} />
                  <p className="text-white font-bold uppercase tracking-tighter text-lg">{img.title}</p>
                  <p className="text-brand-accent text-xs font-bold uppercase tracking-widest">{img.category}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Lightbox */}
        <AnimatePresence>
          {selectedImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-brand-dark/95 flex items-center justify-center p-4 md:p-12"
              onClick={() => setSelectedImage(null)}
            >
              <button 
                className="absolute top-8 right-8 text-white hover:text-brand-accent transition-colors"
                onClick={() => setSelectedImage(null)}
              >
                <X size={40} />
              </button>
              <motion.img
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                src={selectedImage}
                alt="Enlarged view"
                className="max-w-full max-h-full rounded-xl shadow-2xl"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
