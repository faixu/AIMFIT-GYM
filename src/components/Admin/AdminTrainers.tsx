import { useState, useEffect, useRef } from 'react';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { Trash2, Plus, User, Upload, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import ConfirmationModal from './ConfirmationModal';

export default function AdminTrainers() {
  const [trainers, setTrainers] = useState<any[]>([]);
  const [newTrainer, setNewTrainer] = useState({ name: '', specialty: '', bio: '', image: '' });
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'trainers'), (snapshot) => {
      setTrainers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

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
        setNewTrainer({ ...newTrainer, image: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrainer.image) {
      toast.error('Please select an image');
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, 'trainers'), newTrainer);
      setNewTrainer({ name: '', specialty: '', bio: '', image: '' });
      setPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      toast.success('Trainer added successfully!');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'trainers');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.id) return;
    try {
      await deleteDoc(doc(db, 'trainers', deleteModal.id));
      setDeleteModal({ isOpen: false, id: null });
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `trainers/${deleteModal.id}`);
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
          Add New Trainer
        </h3>
        
        <form onSubmit={handleAdd} className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-2 tracking-widest">Trainer Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Vikram Singh" 
                  value={newTrainer.name}
                  onChange={e => setNewTrainer({...newTrainer, name: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-brand-accent outline-none transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-2 tracking-widest">Specialty</label>
                <input 
                  type="text" 
                  placeholder="e.g. Bodybuilding" 
                  value={newTrainer.specialty}
                  onChange={e => setNewTrainer({...newTrainer, specialty: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-brand-accent outline-none transition-all"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-2 tracking-widest">Bio</label>
              <textarea 
                placeholder="Tell us about the trainer..." 
                value={newTrainer.bio}
                onChange={e => setNewTrainer({...newTrainer, bio: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-brand-accent outline-none transition-all h-32 resize-none"
                required
              />
            </div>
            <button 
              type="submit" 
              disabled={loading || !newTrainer.image}
              className="btn-primary w-full py-5 text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-brand-accent/20"
            >
              {loading ? 'Adding Trainer...' : 'Add Trainer'}
            </button>
          </div>

          <div className="relative">
            <label className="block text-xs font-bold uppercase text-gray-500 mb-2 tracking-widest">Trainer Image</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`aspect-[3/4] rounded-3xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center overflow-hidden ${
                preview ? 'border-brand-accent bg-brand-accent/5' : 'border-white/10 hover:border-brand-accent/50 hover:bg-white/5'
              }`}
            >
              {preview ? (
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <>
                  <Upload size={48} className="text-gray-600 mb-4" />
                  <p className="text-sm text-gray-400 font-bold uppercase tracking-wider">Select Trainer Photo</p>
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
                  setNewTrainer({...newTrainer, image: ''});
                }}
                className="absolute top-10 right-2 w-8 h-8 bg-brand-accent rounded-full flex items-center justify-center text-white shadow-lg"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </form>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <AnimatePresence>
          {trainers.map((t, i) => (
            <motion.div 
              key={t.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card rounded-3xl overflow-hidden group relative border-white/5 hover:border-brand-accent/30 transition-all"
            >
              <div className="aspect-[3/4] relative overflow-hidden">
                <img src={t.image} alt={t.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-transparent to-transparent opacity-60"></div>
              </div>
              <div className="p-6">
                <h4 className="text-xl font-black mb-1 uppercase tracking-tight">{t.name}</h4>
                <p className="text-brand-accent text-xs font-black uppercase tracking-[0.2em] mb-3">{t.specialty}</p>
                <p className="text-gray-400 text-sm line-clamp-3 leading-relaxed">{t.bio}</p>
              </div>
              <button 
                onClick={() => setDeleteModal({ isOpen: true, id: t.id })}
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
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        onConfirm={handleDelete}
        title="Delete Trainer"
        message="Are you sure you want to remove this trainer? This action cannot be undone."
      />
    </div>
  );
}
