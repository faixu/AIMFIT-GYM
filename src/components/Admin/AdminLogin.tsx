import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, LogOut, User as UserIcon, Lock, ArrowRight, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const adminAuth = localStorage.getItem('admin_auth');
    if (adminAuth === 'true') {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (username === 'aimfitgym' && password === 'admin') {
      localStorage.setItem('admin_auth', 'true');
      setIsLoggedIn(true);
      window.location.reload(); // Reload to update useAdmin hook
    } else {
      setError('Invalid username or password');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_auth');
    setIsLoggedIn(false);
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-brand-dark p-4">
      <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-brand-accent transition-colors mb-8 uppercase text-[10px] font-black tracking-[0.2em]">
        <ArrowLeft size={14} />
        Back to Website
      </Link>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-12 rounded-3xl max-w-md w-full text-center"
      >
        <h1 className="text-3xl font-black mb-6 italic">
          AIM<span className="text-brand-accent">FIT</span> ADMIN
        </h1>
        
        {isLoggedIn ? (
          <div className="space-y-6">
            <div className="flex flex-col items-center gap-4 mb-6">
              <div className="w-20 h-20 bg-brand-accent/10 rounded-full flex items-center justify-center">
                <ShieldAlert size={40} className="text-brand-accent" />
              </div>
              <div>
                <p className="text-white font-bold text-lg">Admin Access Active</p>
                <p className="text-gray-400 text-sm mt-1">
                  You are currently logged in as <span className="text-brand-accent">aimfitgym</span>.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={handleLogout}
                className="btn-secondary w-full flex items-center justify-center gap-3 py-4"
              >
                <LogOut size={20} />
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-gray-400 mb-8">Please enter your admin credentials to manage the website.</p>
            
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
                <p className="text-brand-accent text-sm font-medium">{error}</p>
              </div>
            )}
            
            <form onSubmit={handleLogin} className="space-y-6 text-left">
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase text-gray-500 tracking-widest ml-4">Username</label>
                <div className="relative">
                  <UserIcon size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
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
                className="btn-primary w-full py-5 text-lg flex items-center justify-center gap-3 shadow-xl shadow-brand-accent/20 group"
              >
                Sign In
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}
