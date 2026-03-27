import { useState, useEffect, useRef } from 'react';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { Trash2, Plus, Image as ImageIcon, Upload, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminGallery() {
  const [images, setImages] = useState<any[]>([]);
  const [newImage, setNewImage] = useState({ title: '', category: 'Training', image: '' });
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const q = query(collection(db, 'gallery'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setImages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'gallery');
    });
    return () => unsubscribe();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB limit for Firestore
        alert('Image size must be less than 1MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPreview(base64String);
        setNewImage({ ...newImage, image: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImage.image) {
      alert('Please select an image');
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, 'gallery'), {
        ...newImage,
        createdAt: serverTimestamp()
      });
      setNewImage({ title: '', category: 'Training', image: '' });
      setPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'gallery');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;
    try {
      await deleteDoc(doc(db, 'gallery', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `gallery/${id}`);
    }
  };

  return (
    <div className="space-y-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 rounded-3xl border-brand-accent/20"
      >
        <h3 className="text-2xl font-black mb-8 flex items-center gap-3 uppercase tracking-tight">
          <div className="w-10 h-10 bg-brand-accent/10 rounded-xl flex items-center justify-center">
            <Plus size={24} className="text-brand-accent" />
          </div>
          Add New Image
        </h3>
        
        <form onSubmit={handleAdd} className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-2 tracking-widest">Image Title</label>
              <input 
                type="text" 
                placeholder="e.g. Morning Workout" 
                value={newImage.title}
                onChange={e => setNewImage({...newImage, title: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-brand-accent outline-none transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-2 tracking-widest">Category</label>
              <select 
                value={newImage.category}
                onChange={e => setNewImage({...newImage, category: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-brand-accent outline-none transition-all appearance-none"
              >
                <option value="Transformations" className="bg-brand-dark">Transformations</option>
                <option value="Training" className="bg-brand-dark">Training</option>
                <option value="Community" className="bg-brand-dark">Community</option>
              </select>
            </div>
            <button 
              type="submit" 
              disabled={loading || !newImage.image}
              className="btn-primary w-full py-5 text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-brand-accent/20"
            >
              {loading ? 'Uploading...' : 'Upload to Gallery'}
            </button>
          </div>

          <div className="relative">
            <label className="block text-xs font-bold uppercase text-gray-500 mb-2 tracking-widest">Image Upload</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`aspect-video rounded-3xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center overflow-hidden ${
                preview ? 'border-brand-accent bg-brand-accent/5' : 'border-white/10 hover:border-brand-accent/50 hover:bg-white/5'
              }`}
            >
              {preview ? (
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <>
                  <Upload size={48} className="text-gray-600 mb-4" />
                  <p className="text-sm text-gray-400 font-bold uppercase tracking-wider">Click to Select Image</p>
                  <p className="text-[10px] text-gray-600 mt-2 uppercase">Max 1MB (JPG, PNG)</p>
                </>
              )}
            </div>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            {preview && (
              <button 
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setPreview(null);
                  setNewImage({...newImage, image: ''});
                }}
                className="absolute top-10 right-2 w-8 h-8 bg-brand-accent rounded-full flex items-center justify-center text-white shadow-lg"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </form>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        <AnimatePresence>
          {images.map((img, i) => (
            <motion.div 
              key={img.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card rounded-3xl overflow-hidden group relative border-white/5 hover:border-brand-accent/30 transition-all"
            >
              <div className="aspect-square relative overflow-hidden">
                <img src={img.image} alt={img.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-transparent to-transparent opacity-60"></div>
              </div>
              <div className="p-6">
                <p className="font-black text-sm uppercase truncate tracking-tight mb-1">{img.title}</p>
                <p className="text-[10px] text-brand-accent font-black uppercase tracking-[0.2em]">{img.category}</p>
              </div>
              <button 
                onClick={() => handleDelete(img.id)}
                className="absolute top-4 right-4 w-10 h-10 bg-red-600 text-white rounded-xl flex items-center justify-center transition-all hover:scale-110 shadow-xl z-10"
              >
                <Trash2 size={18} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
