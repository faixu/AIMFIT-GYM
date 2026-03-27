import { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { collection, addDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { Trash2, Plus, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import ConfirmationModal from './ConfirmationModal';

export default function AdminPricing() {
  const [plans, setPlans] = useState<any[]>([]);
  const [newPlan, setNewPlan] = useState({ name: '', price: '', period: 'month', features: '', popular: false });
  const [loading, setLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null });

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'pricing'), (snapshot) => {
      setPlans(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'pricing'), {
        ...newPlan,
        features: newPlan.features.split('\n').filter(f => f.trim() !== '')
      });
      setNewPlan({ name: '', price: '', period: 'month', features: '', popular: false });
      toast.success('Pricing plan added successfully!');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'pricing');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.id) return;
    try {
      await deleteDoc(doc(db, 'pricing', deleteModal.id));
      setDeleteModal({ isOpen: false, id: null });
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `pricing/${deleteModal.id}`);
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
          Add New Pricing Plan
        </h3>
        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-2 tracking-widest">Plan Name</label>
              <input 
                type="text" 
                placeholder="e.g. Premium Plan" 
                value={newPlan.name}
                onChange={e => setNewPlan({...newPlan, name: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-brand-accent outline-none transition-all"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-2 tracking-widest">Price (₹)</label>
                <input 
                  type="text" 
                  placeholder="2500" 
                  value={newPlan.price}
                  onChange={e => setNewPlan({...newPlan, price: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-brand-accent outline-none transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-2 tracking-widest">Period</label>
                <input 
                  type="text" 
                  placeholder="month" 
                  value={newPlan.period}
                  onChange={e => setNewPlan({...newPlan, period: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-brand-accent outline-none transition-all"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/10">
              <input 
                type="checkbox" 
                id="popular"
                checked={newPlan.popular}
                onChange={e => setNewPlan({...newPlan, popular: e.target.checked})}
                className="w-5 h-5 accent-brand-accent cursor-pointer"
              />
              <label htmlFor="popular" className="text-sm font-bold uppercase text-gray-400 cursor-pointer tracking-wider">Mark as Most Popular</label>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-2 tracking-widest">Features (One per line)</label>
              <textarea 
                placeholder="Full Gym Access&#10;Trainer Assistance&#10;Nutrition Plan" 
                value={newPlan.features}
                onChange={e => setNewPlan({...newPlan, features: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-brand-accent outline-none transition-all h-[156px] resize-none"
                required
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary w-full py-5 text-lg disabled:opacity-50 shadow-xl shadow-brand-accent/20"
            >
              {loading ? 'Creating Plan...' : 'Create Pricing Plan'}
            </button>
          </div>
        </form>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <AnimatePresence>
          {plans.map((p, i) => (
            <motion.div 
              key={p.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: i * 0.05 }}
              className={`glass-card p-8 rounded-3xl relative border-2 transition-all group ${p.popular ? 'border-brand-accent bg-brand-accent/5' : 'border-white/10 hover:border-brand-accent/30'}`}
            >
              {p.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-accent text-white text-[10px] font-black uppercase tracking-[0.2em] py-1 px-4 rounded-full shadow-lg">
                  Most Popular
                </div>
              )}
              
              <h4 className="text-2xl font-black mb-2 uppercase tracking-tight">{p.name}</h4>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-black">₹{p.price}</span>
                <span className="text-gray-500 text-sm">/{p.period}</span>
              </div>
              
              <ul className="space-y-3 mb-8">
                {p.features.map((f: string, j: number) => (
                  <li key={j} className="text-sm text-gray-400 flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-brand-accent rounded-full mt-1.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <button 
                onClick={() => setDeleteModal({ isOpen: true, id: p.id })}
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
        title="Delete Pricing Plan"
        message="Are you sure you want to delete this pricing plan? This action cannot be undone."
      />
    </div>
  );
}
