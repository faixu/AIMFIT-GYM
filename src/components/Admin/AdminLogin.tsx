import { useState, useEffect } from 'react';
import { auth, onAuthStateChanged, type User, signInWithEmailAndPassword } from '../../lib/firebase';
import { motion } from 'motion/react';
import { LogIn, ShieldAlert, LogOut, Mail, Lock } from 'lucide-react';

export default function AdminLogin() {
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setChecking(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (checking) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-dark p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-12 rounded-3xl max-w-md w-full text-center"
      >
        <h1 className="text-3xl font-black mb-6 italic">
          AIM<span className="text-brand-accent">FIT</span> ADMIN
        </h1>
        
        {user ? (
          <div className="space-y-6">
            <div className="flex flex-col items-center gap-4 mb-6">
              <div className="w-20 h-20 bg-brand-accent/10 rounded-full flex items-center justify-center">
                <ShieldAlert size={40} className="text-brand-accent" />
              </div>
              <div>
                <p className="text-white font-bold text-lg">Access Denied</p>
                <p className="text-gray-400 text-sm mt-1">
                  The account <span className="text-brand-accent">{user.email}</span> does not have admin privileges.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => auth.signOut()}
                className="btn-secondary w-full flex items-center justify-center gap-3 py-4"
              >
                <LogOut size={20} />
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-gray-400 mb-8">Please sign in with your admin account to manage the website.</p>
            
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
                <p className="text-brand-accent text-sm font-medium">{error}</p>
              </div>
            )}
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Admin Email"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:border-brand-accent outline-none transition-all text-white"
                  required
                />
              </div>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:border-brand-accent outline-none transition-all text-white"
                  required
                />
              </div>
              
              <button 
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-3 py-4"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <LogIn size={20} />
                    Sign In
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}
