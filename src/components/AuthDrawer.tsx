import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User as UserIcon, ArrowRight, Chrome, ShoppingBag, LogOut, CheckCircle2 } from 'lucide-react';
import { auth, googleProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, signOut, onAuthStateChanged, type User } from '../lib/firebase';
import { toast } from 'sonner';

interface AuthDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  onSuccess?: () => void;
}

export default function AuthDrawer({ isOpen, onClose, initialMode = 'login', onSuccess }: AuthDrawerProps) {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setIsLogin(initialMode === 'login');
  }, [initialMode, isOpen]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success('Welcome back!');
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        toast.success('Account created!');
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success('Signed in with Google!');
      if (onSuccess) onSuccess();
      onClose();
    } catch (error: any) {
      toast.error('Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Signed out');
      onClose();
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[80]"
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-brand-dark border-l border-white/10 z-[90] flex flex-col shadow-2xl"
          >
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-accent/10 rounded-xl flex items-center justify-center">
                  <UserIcon className="text-brand-accent" size={20} />
                </div>
                <h2 className="text-xl font-black uppercase tracking-tight">
                  {user ? 'Your Profile' : (isLogin ? 'Sign In' : 'Create Account')}
                </h2>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
              {user ? (
                <div className="space-y-8 text-center py-10">
                  <div className="relative inline-block">
                    <div className="w-24 h-24 bg-brand-accent/10 rounded-full flex items-center justify-center text-brand-accent mx-auto">
                      <UserIcon size={48} />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 border-4 border-brand-dark rounded-full flex items-center justify-center">
                      <CheckCircle2 size={16} className="text-white" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black uppercase tracking-tight">{user.displayName || 'Fitness Enthusiast'}</h3>
                    <p className="text-gray-400 text-sm">{user.email}</p>
                  </div>

                  <div className="pt-10 space-y-4">
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-sm font-black uppercase tracking-widest border border-white/10 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 transition-all"
                    >
                      <LogOut size={18} />
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="text-center">
                    <p className="text-gray-400 text-sm">
                      {isLogin ? 'Welcome back to AimFit' : 'Join our fitness community today'}
                    </p>
                  </div>

                  <form onSubmit={handleAuth} className="space-y-6">
                    {!isLogin && (
                      <div className="space-y-2">
                        <label className="block text-[10px] font-black uppercase text-gray-500 tracking-widest ml-4">Full Name</label>
                        <div className="relative">
                          <UserIcon size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500" />
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="John Doe"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-4 focus:border-brand-accent outline-none transition-all text-white"
                            required={!isLogin}
                          />
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="block text-[10px] font-black uppercase text-gray-500 tracking-widest ml-4">Email Address</label>
                      <div className="relative">
                        <Mail size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@example.com"
                          className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-4 focus:border-brand-accent outline-none transition-all text-white"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[10px] font-black uppercase text-gray-500 tracking-widest ml-4">Password</label>
                      <div className="relative">
                        <Lock size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-4 focus:border-brand-accent outline-none transition-all text-white"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary w-full py-5 text-lg flex items-center justify-center gap-3 shadow-xl shadow-brand-accent/20 group"
                    >
                      {loading ? (
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <>
                          {isLogin ? 'Sign In' : 'Create Account'}
                          <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </form>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/5"></div>
                    </div>
                    <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest">
                      <span className="bg-brand-dark px-4 text-gray-500">Or continue with</span>
                    </div>
                  </div>

                  <button
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 bg-white/5 border border-white/10 py-4 rounded-2xl hover:bg-white/10 transition-all group"
                  >
                    <Chrome size={20} className="text-gray-400 group-hover:text-white transition-colors" />
                    <span className="text-sm font-bold">Google</span>
                  </button>

                  <p className="text-center text-sm text-gray-500">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                    <button
                      onClick={() => setIsLogin(!isLogin)}
                      className="text-brand-accent font-black uppercase tracking-widest text-xs hover:underline ml-1"
                    >
                      {isLogin ? 'Sign Up' : 'Sign In'}
                    </button>
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
