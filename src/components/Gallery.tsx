import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { Maximize2, X, Plus, Trash2 } from "lucide-react";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { collection, onSnapshot, query, orderBy, deleteDoc, doc } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { storage } from "../lib/firebase";
import { useAdmin } from "../hooks/useAdmin";
import ImageUpload from "./Admin/ImageUpload";
import { toast } from "sonner";

const categories = ["All", "Transformations", "Training", "Community"];

export default function Gallery() {
  const { isAdmin } = useAdmin();
  const [filter, setFilter] = useState("All");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [images, setImages] = useState<any[]>([]);
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'gallery'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setImages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.error('Error fetching gallery:', error);
      try {
        handleFirestoreError(error, OperationType.GET, 'gallery');
      } catch (e) {
        // Error already logged by handleFirestoreError
      }
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: string, imageUrl: string) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this image?")) return;
    try {
      // Delete from Firestore
      await deleteDoc(doc(db, 'gallery', id));
      
      // Delete from Storage if it's a storage URL
      if (imageUrl.includes('firebasestorage.googleapis.com')) {
        const imageRef = ref(storage, imageUrl);
        await deleteObject(imageRef);
      }
      
      toast.success("Image deleted successfully");
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `gallery/${id}`);
    }
  };

  const filteredImages = filter === "All" 
    ? images 
    : images.filter(img => img.category === filter);

  return (
    <section id="gallery" className="py-24 bg-brand-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 relative">
          <h2 className="text-4xl md:text-5xl mb-4">Our <span className="text-brand-accent italic">Gallery</span></h2>
          <p className="text-gray-400 max-w-2xl mx-auto">Witness the hard work, dedication, and transformations of our AimFit family.</p>
          
          {isAdmin && (
            <div className="mt-8 flex justify-center">
              <button 
                onClick={() => setShowUpload(true)}
                className="btn-primary flex items-center gap-2 px-6 py-3"
              >
                <Plus size={20} /> Add Image
              </button>
            </div>
          )}
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
                  
                  {isAdmin && (
                    <button 
                      onClick={(e) => handleDelete(e, img.id, img.image)}
                      className="absolute top-4 right-4 w-10 h-10 bg-red-600 text-white rounded-xl flex items-center justify-center hover:scale-110 transition-transform shadow-xl"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
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

        {/* Upload Modal */}
        <AnimatePresence>
          {showUpload && (
            <ImageUpload onClose={() => setShowUpload(false)} />
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
