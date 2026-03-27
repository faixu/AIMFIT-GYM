import { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { collection, addDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { Trash2, Plus, CreditCard } from 'lucide-react';

export default function AdminPricing() {
  const [plans, setPlans] = useState<any[]>([]);
  const [newPlan, setNewPlan] = useState({ name: '', price: '', period: 'month', features: '', popular: false });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'pricing'), (snapshot) => {
      setPlans(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'pricing');
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
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'pricing');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this plan?')) return;
    try {
      await deleteDoc(doc(db, 'pricing', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `pricing/${id}`);
    }
  };

  return (
    <div className="space-y-12">
      <div className="glass-card p-8 rounded-2xl">
        <h3 className="text-xl mb-6 flex items-center gap-2">
          <Plus size={20} className="text-brand-accent" />
          Add New Pricing Plan
        </h3>
        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input 
            type="text" 
            placeholder="Plan Name" 
            value={newPlan.name}
            onChange={e => setNewPlan({...newPlan, name: e.target.value})}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-brand-accent outline-none"
            required
          />
          <input 
            type="text" 
            placeholder="Price (e.g. 2000)" 
            value={newPlan.price}
            onChange={e => setNewPlan({...newPlan, price: e.target.value})}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-brand-accent outline-none"
            required
          />
          <input 
            type="text" 
            placeholder="Period (e.g. month)" 
            value={newPlan.period}
            onChange={e => setNewPlan({...newPlan, period: e.target.value})}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-brand-accent outline-none"
          />
          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="popular"
              checked={newPlan.popular}
              onChange={e => setNewPlan({...newPlan, popular: e.target.checked})}
              className="w-5 h-5 accent-brand-accent"
            />
            <label htmlFor="popular" className="text-sm text-gray-400">Mark as Most Popular</label>
          </div>
          <textarea 
            placeholder="Features (one per line)" 
            value={newPlan.features}
            onChange={e => setNewPlan({...newPlan, features: e.target.value})}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-brand-accent outline-none md:col-span-2 h-32"
            required
          />
          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary md:col-span-2 py-4 disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Add Plan'}
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map(p => (
          <div key={p.id} className={`glass-card p-6 rounded-xl relative border-2 ${p.popular ? 'border-brand-accent' : 'border-white/10'}`}>
            <h4 className="text-xl mb-2">{p.name}</h4>
            <p className="text-2xl font-black mb-4">₹{p.price}<span className="text-sm text-gray-500 font-normal">/{p.period}</span></p>
            <ul className="space-y-2 mb-6">
              {p.features.map((f: string, i: number) => (
                <li key={i} className="text-xs text-gray-400">• {f}</li>
              ))}
            </ul>
            <button 
              onClick={() => handleDelete(p.id)}
              className="absolute top-2 right-2 p-2 bg-red-600 rounded-lg"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
