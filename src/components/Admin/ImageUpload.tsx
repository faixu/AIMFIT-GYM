import React, { useState, useRef } from 'react';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { X, Upload, CheckCircle2, Loader2, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

interface ImageUploadProps {
  onClose: () => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onClose }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Training');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [base64Image, setBase64Image] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB limit for Firestore
        toast.error('Image size must be less than 1MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPreview(base64String);
        setBase64Image(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!base64Image || !title) {
      toast.error('Please select an image and provide a title');
      return;
    }
    
    setLoading(true);
    try {
      await addDoc(collection(db, 'gallery'), {
        title,
        category,
        image: base64Image,
        createdAt: serverTimestamp()
      });
      toast.success('Image uploaded successfully!');
      onClose();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'gallery');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-brand-dark w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl border border-white/10"
      >
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-2xl font-black flex items-center gap-2 uppercase tracking-tight">
            <ImageIcon className="text-brand-accent" /> Add to Gallery
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleUpload} className="p-8 space-y-6">
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
                <p className="text-[10px] text-gray-600 mt-2 uppercase tracking-widest">Max 1MB (JPG, PNG)</p>
              </>
            )}
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-2 tracking-widest">Image Title</label>
              <input 
                type="text" 
                placeholder="e.g. Training Session" 
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-brand-accent outline-none transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-2 tracking-widest">Category</label>
              <select 
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-brand-accent outline-none transition-all appearance-none"
              >
                <option value="Transformations" className="bg-brand-dark">Transformations</option>
                <option value="Training" className="bg-brand-dark">Training</option>
                <option value="Community" className="bg-brand-dark">Community</option>
              </select>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading || !base64Image || !title}
            className="w-full btn-primary py-5 text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-brand-accent/20 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Uploading...
              </>
            ) : (
              <>
                <Upload size={20} />
                Upload to Gallery
              </>
            )}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default ImageUpload;
