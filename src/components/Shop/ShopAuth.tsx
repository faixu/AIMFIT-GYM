import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, User as UserIcon, ArrowRight, Github, Chrome, AlertCircle, CheckCircle2, ShoppingBag, ArrowLeft } from 'lucide-react';
import { auth, googleProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from '../../lib/firebase';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';

export default function ShopAuth({ initialMode = 'login' }: { initialMode?: 'login' | 'register' }) {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setIsLogin(initialMode === 'login');
  }, [initialMode]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success('Welcome back to AimFit!');
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        toast.success('Account created successfully!');
      }
      navigate('/shop');
    } catch (error: any) {
      console.error('Auth error:', error);
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
      navigate('/shop');
    } catch (error: any) {
      toast.error('Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-accent/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-accent/5 blur-[120px] rounded-full"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-10">
          <Link to="/shop" className="inline-flex items-center gap-2 text-gray-500 hover:text-brand-accent transition-colors mb-6 uppercase text-[10px] font-black tracking-[0.2em]">
            <ArrowLeft size={14} />
            Back to Shop
          </Link>
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-brand-accent/10 rounded-2xl flex items-center justify-center">
              <ShoppingBag size={32} className="text-brand-accent" />
            </div>
          </div>
          <h1 className="text-4xl font-black uppercase italic tracking-tight mb-2">
            {isLogin ? 'Welcome' : 'Join'} <span className="text-brand-accent">AimFit</span>
          </h1>
          <p className="text-gray-400 text-sm">
            {isLogin ? 'Sign in to continue your fitness journey' : 'Create an account to start shopping'}
          </p>
        </div>

        <div className="glass-card p-8 rounded-[2.5rem] border-white/5 shadow-2xl">
          <form onSubmit={handleAuth} className="space-y-6">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
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
                </motion.div>
              )}
            </AnimatePresence>

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

          <div className="mt-8 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest">
              <span className="bg-brand-dark px-4 text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4">
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="flex items-center justify-center gap-3 bg-white/5 border border-white/10 py-4 rounded-2xl hover:bg-white/10 transition-all group"
            >
              <Chrome size={20} className="text-gray-400 group-hover:text-white transition-colors" />
              <span className="text-sm font-bold">Google</span>
            </button>
          </div>

          <p className="mt-8 text-center text-sm text-gray-500">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-brand-accent font-black uppercase tracking-widest text-xs hover:underline ml-1"
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
