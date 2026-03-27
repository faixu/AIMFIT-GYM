import { useState } from 'react';
import { auth, googleProvider, signInWithPopup } from '../../lib/firebase';
import { motion } from 'motion/react';
import { LogIn } from 'lucide-react';

export default function AdminLogin() {
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setError('Login failed. Please try again.');
      console.error(err);
    }
  };

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
        <p className="text-gray-400 mb-8">Please sign in with your admin account to manage the website.</p>
        
        {error && <p className="text-brand-accent mb-4 text-sm">{error}</p>}
        
        <button 
          onClick={handleLogin}
          className="btn-primary w-full flex items-center justify-center gap-3 py-4"
        >
          <LogIn size={20} />
          Sign in with Google
        </button>
      </motion.div>
    </div>
  );
}
