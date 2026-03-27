import { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { Trash2, Plus, User } from 'lucide-react';

export default function AdminTrainers() {
  const [trainers, setTrainers] = useState<any[]>([]);
  const [newTrainer, setNewTrainer] = useState({ name: '', specialty: '', bio: '', image: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'trainers'), (snapshot) => {
      setTrainers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'trainers');
    });
    return () => unsubscribe();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'trainers'), newTrainer);
      setNewTrainer({ name: '', specialty: '', bio: '', image: '' });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'trainers');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this trainer?')) return;
    try {
      await deleteDoc(doc(db, 'trainers', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `trainers/${id}`);
    }
  };

  return (
    <div className="space-y-12">
      <div className="glass-card p-8 rounded-2xl">
        <h3 className="text-xl mb-6 flex items-center gap-2">
          <Plus size={20} className="text-brand-accent" />
          Add New Trainer
        </h3>
        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input 
            type="text" 
            placeholder="Trainer Name" 
            value={newTrainer.name}
            onChange={e => setNewTrainer({...newTrainer, name: e.target.value})}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-brand-accent outline-none"
            required
          />
          <input 
            type="text" 
            placeholder="Specialty (e.g. Bodybuilding)" 
            value={newTrainer.specialty}
            onChange={e => setNewTrainer({...newTrainer, specialty: e.target.value})}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-brand-accent outline-none"
            required
          />
          <input 
            type="url" 
            placeholder="Image URL" 
            value={newTrainer.image}
            onChange={e => setNewTrainer({...newTrainer, image: e.target.value})}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-brand-accent outline-none md:col-span-2"
            required
          />
          <textarea 
            placeholder="Bio" 
            value={newTrainer.bio}
            onChange={e => setNewTrainer({...newTrainer, bio: e.target.value})}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-brand-accent outline-none md:col-span-2 h-32"
          />
          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary md:col-span-2 py-4 disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Add Trainer'}
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {trainers.map(t => (
          <div key={t.id} className="glass-card rounded-xl overflow-hidden group relative">
            <img src={t.image} alt={t.name} className="w-full aspect-[3/4] object-cover grayscale" />
            <div className="p-6">
              <h4 className="text-xl mb-1">{t.name}</h4>
              <p className="text-brand-accent text-xs font-bold uppercase tracking-widest mb-2">{t.specialty}</p>
              <p className="text-gray-400 text-sm line-clamp-2">{t.bio}</p>
            </div>
            <button 
              onClick={() => handleDelete(t.id)}
              className="absolute top-2 right-2 p-2 bg-red-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
