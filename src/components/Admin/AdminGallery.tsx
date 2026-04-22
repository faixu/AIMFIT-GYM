import { useState, useEffect, useRef } from 'react';
import { db, storage, ref, uploadBytesResumable, getDownloadURL, deleteObject, handleFirestoreError, OperationType } from '../../lib/firebase';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { Trash2, Plus, Image as ImageIcon, Upload, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import ConfirmationModal from './ConfirmationModal';

export default function AdminGallery() {
  const [images, setImages] = useState<any[]>([]);
  const [newImage, setNewImage] = useState({ title: '', category: 'Training', image: '' });
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string | null; imageUrl: string | null }>({ isOpen: false, id: null, imageUrl: null });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const q = collection(db, 'gallery');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort in memory to handle serverTimestamp pending states (null values)
      data.sort((a: any, b: any) => {
        const timeA = a.createdAt?.toMillis?.() || Date.now();
        const timeB = b.createdAt?.toMillis?.() || Date.now();
        return timeB - timeA;
      });
      setImages(data);
    }, (error) => {
      console.error('Error fetching gallery:', error);
    });
    return () => unsubscribe();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('Image size must be less than 10MB');
        return;
      }
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !newImage.title) {
      toast.error('Please select an image and provide a title');
      return;
    }
    setLoading(true);
    const storageRef = ref(storage, `gallery/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed', 
      (snapshot) => {
        const p = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(p);
      }, 
      (error) => {
        console.error("Upload error:", error);
        toast.error("Upload failed");
        setLoading(false);
      }, 
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          await addDoc(collection(db, 'gallery'), {
            title: newImage.title,
            category: newImage.category,
            image: downloadURL,
            createdAt: serverTimestamp()
          });
          setNewImage({ title: '', category: 'Training', image: '' });
          setPreview(null);
          setFile(null);
          if (fileInputRef.current) fileInputRef.current.value = '';
          toast.success('Image uploaded successfully!');
        } catch (error) {
          handleFirestoreError(error, OperationType.CREATE, 'gallery');
        } finally {
          setLoading(false);
        }
      }
    );
  };

  const handleDelete = async () => {
    if (!deleteModal.id) return;
    try {
      // Delete from Firestore
      await deleteDoc(doc(db, 'gallery', deleteModal.id));
      
      // Delete from Storage if it's a storage URL
      if (deleteModal.imageUrl && deleteModal.imageUrl.includes('firebasestorage.googleapis.com')) {
        const imageRef = ref(storage, deleteModal.imageUrl);
        await deleteObject(imageRef);
      }
      
      setDeleteModal({ isOpen: false, id: null, imageUrl: null });
      toast.success("Image deleted successfully");
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `gallery/${deleteModal.id}`);
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
              disabled={loading || !file}
              className="btn-primary w-full py-5 text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-brand-accent/20 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Uploading ({Math.round(progress)}%)
                </>
              ) : 'Upload to Gallery'}
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
                  <p className="text-[10px] text-gray-600 mt-2 uppercase">Max 10MB (JPG, PNG)</p>
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
                  setFile(null);
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
                onClick={() => setDeleteModal({ isOpen: true, id: img.id, imageUrl: img.image })}
                className="absolute top-4 right-4 w-10 h-10 bg-red-600 text-white rounded-xl flex items-center justify-center transition-all hover:scale-110 shadow-xl z-20"
              >
                <Trash2 size={18} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <ConfirmationModal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null, imageUrl: null })}
        onConfirm={handleDelete}
        title="Delete Image"
        message="Are you sure you want to delete this image? This action cannot be undone."
      />
    </div>
  );
}
