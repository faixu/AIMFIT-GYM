import { useState, useEffect, useRef } from 'react';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, updateDoc } from 'firebase/firestore';
import { Trash2, Plus, Package, Upload, X, Edit2, Check, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import ConfirmationModal from './ConfirmationModal';

export default function AdminShop() {
  const [supplements, setSupplements] = useState<any[]>([]);
  const [newSupplement, setNewSupplement] = useState({ 
    name: '', 
    price: '', 
    description: '', 
    image: '', 
    category: 'Protein',
    inStock: true 
  });
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null });
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const q = query(collection(db, 'supplements'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setSupplements(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        toast.error('Image size must be less than 1MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPreview(base64String);
        setNewSupplement({ ...newSupplement, image: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupplement.image) {
      toast.error('Please select an image');
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, 'supplements'), {
        ...newSupplement,
        price: parseFloat(newSupplement.price),
        createdAt: new Date().toISOString()
      });
      setNewSupplement({ name: '', price: '', description: '', image: '', category: 'Protein', inStock: true });
      setPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      toast.success('Supplement added successfully!');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'supplements');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.id) return;
    try {
      await deleteDoc(doc(db, 'supplements', deleteModal.id));
      setDeleteModal({ isOpen: false, id: null });
      toast.success('Supplement deleted');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `supplements/${deleteModal.id}`);
    }
  };

  const toggleStock = async (id: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'supplements', id), { inStock: !currentStatus });
      toast.success(`Supplement marked as ${!currentStatus ? 'In Stock' : 'Out of Stock'}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `supplements/${id}`);
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
          Add New Supplement
        </h3>
        
        <form onSubmit={handleAdd} className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-2 tracking-widest">Product Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Whey Protein" 
                  value={newSupplement.name}
                  onChange={e => setNewSupplement({...newSupplement, name: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-brand-accent outline-none transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-2 tracking-widest">Price (₹)</label>
                <input 
                  type="number" 
                  placeholder="e.g. 2499" 
                  value={newSupplement.price}
                  onChange={e => setNewSupplement({...newSupplement, price: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-brand-accent outline-none transition-all"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-2 tracking-widest">Category</label>
                <select 
                  value={newSupplement.category}
                  onChange={e => setNewSupplement({...newSupplement, category: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-brand-accent outline-none transition-all appearance-none"
                >
                  <option value="Protein">Protein</option>
                  <option value="Pre-workout">Pre-workout</option>
                  <option value="Creatine">Creatine</option>
                  <option value="Vitamins">Vitamins</option>
                  <option value="Accessories">Accessories</option>
                </select>
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-3 cursor-pointer group w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4">
                  <input 
                    type="checkbox" 
                    checked={newSupplement.inStock}
                    onChange={e => setNewSupplement({...newSupplement, inStock: e.target.checked})}
                    className="w-5 h-5 accent-brand-accent"
                  />
                  <span className="text-sm font-bold uppercase tracking-widest text-gray-300">In Stock</span>
                </label>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-2 tracking-widest">Description</label>
              <textarea 
                placeholder="Product details, benefits, etc..." 
                value={newSupplement.description}
                onChange={e => setNewSupplement({...newSupplement, description: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-brand-accent outline-none transition-all h-32 resize-none"
                required
              />
            </div>
            <button 
              type="submit" 
              disabled={loading || !newSupplement.image}
              className="btn-primary w-full py-5 text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-brand-accent/20"
            >
              {loading ? 'Adding Product...' : 'Add Product'}
            </button>
          </div>

          <div className="relative">
            <label className="block text-xs font-bold uppercase text-gray-500 mb-2 tracking-widest">Product Image</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`aspect-square rounded-3xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center overflow-hidden ${
                preview ? 'border-brand-accent bg-brand-accent/5' : 'border-white/10 hover:border-brand-accent/50 hover:bg-white/5'
              }`}
            >
              {preview ? (
                <img src={preview} alt="Preview" className="w-full h-full object-contain p-4" />
              ) : (
                <>
                  <Upload size={48} className="text-gray-600 mb-4" />
                  <p className="text-sm text-gray-400 font-bold uppercase tracking-wider">Select Product Photo</p>
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
                  setNewSupplement({...newSupplement, image: ''});
                }}
                className="absolute top-10 right-2 w-8 h-8 bg-brand-accent rounded-full flex items-center justify-center text-white shadow-lg"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </form>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence>
          {supplements.map((s, i) => (
            <motion.div 
              key={s.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card rounded-3xl overflow-hidden group relative border-white/5 hover:border-brand-accent/30 transition-all"
            >
              <div className="aspect-square relative overflow-hidden bg-white/5 p-8">
                <img src={s.image} alt={s.name} className="w-full h-full object-contain transition-all duration-500 group-hover:scale-110" />
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    s.inStock ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                  }`}>
                    {s.inStock ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-xl font-black uppercase tracking-tight">{s.name}</h4>
                  <p className="text-brand-accent font-black text-lg">₹{s.price}</p>
                </div>
                <p className="text-gray-500 text-xs font-black uppercase tracking-[0.2em] mb-4">{s.category}</p>
                <p className="text-gray-400 text-sm line-clamp-2 leading-relaxed mb-6">{s.description}</p>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => toggleStock(s.id, s.inStock)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                      s.inStock ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' : 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                    }`}
                  >
                    {s.inStock ? <XCircle size={16} /> : <Check size={16} />}
                    {s.inStock ? 'Mark Out' : 'Mark In'}
                  </button>
                  <button 
                    onClick={() => setDeleteModal({ isOpen: true, id: s.id })}
                    className="w-12 h-12 bg-white/5 text-gray-400 hover:bg-red-500/10 hover:text-red-500 rounded-xl flex items-center justify-center transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <ConfirmationModal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        onConfirm={handleDelete}
        title="Delete Supplement"
        message="Are you sure you want to remove this product? This action cannot be undone."
      />
    </div>
  );
}
