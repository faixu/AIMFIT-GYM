import { useState, useEffect } from 'react';
import { db, collection, onSnapshot, query, orderBy, updateDoc, doc, handleFirestoreError, OperationType } from '../../lib/firebase';
import { User, Shield, ShieldAlert, Search, Mail, Calendar, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  email: string;
  role: 'admin' | 'user';
  createdAt?: string;
  displayName?: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('email', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as UserProfile[];
      setUsers(usersData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'users');
    });

    return () => unsubscribe();
  }, []);

  const toggleRole = async (user: UserProfile) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    try {
      await updateDoc(doc(db, 'users', user.id), {
        role: newRole
      });
      toast.success(`User role updated to ${newRole}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.id}`);
    }
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-brand-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Search users by email or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:border-brand-accent outline-none transition-all"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/5">
            <User className="mx-auto text-gray-600 mb-4" size={48} />
            <p className="text-gray-400">No users found matching your search.</p>
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div 
              key={user.id}
              className="glass-card p-6 rounded-2xl border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6 hover:border-white/10 transition-all"
            >
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  user.role === 'admin' ? 'bg-brand-accent/10 text-brand-accent' : 'bg-white/5 text-gray-400'
                }`}>
                  {user.role === 'admin' ? <Shield size={24} /> : <User size={24} />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg">{user.displayName || 'Unnamed User'}</h3>
                    {user.role === 'admin' && (
                      <span className="text-[10px] font-black uppercase tracking-widest bg-brand-accent/20 text-brand-accent px-2 py-0.5 rounded">Admin</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-1">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Mail size={12} />
                      {user.email}
                    </div>
                    {user.createdAt && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Calendar size={12} />
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => toggleRole(user)}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                    user.role === 'admin' 
                      ? 'bg-white/5 text-gray-400 hover:bg-white/10' 
                      : 'bg-brand-accent text-white hover:bg-brand-accent/90 shadow-lg shadow-brand-accent/20'
                  }`}
                >
                  {user.role === 'admin' ? (
                    <>
                      <ShieldAlert size={16} />
                      Revoke Admin
                    </>
                  ) : (
                    <>
                      <Shield size={16} />
                      Make Admin
                    </>
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
