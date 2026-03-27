import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingBag, Trash2, Plus, Minus, QrCode, CheckCircle2, AlertCircle, User as UserIcon, LogIn } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { db, auth } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import AuthDrawer from './AuthDrawer';

export default function Cart({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { cart, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
  const [step, setStep] = useState<'cart' | 'checkout' | 'success' | 'auth-prompt'>('cart');
  const [upiQrCode, setUpiQrCode] = useState<string | null>(null);
  const [isAuthDrawerOpen, setIsAuthDrawerOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'site'), (doc) => {
      if (doc.exists()) {
        setUpiQrCode(doc.data().upiQrCode || null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    
    if (!auth.currentUser) {
      setStep('auth-prompt');
      return;
    }
    
    setStep('checkout');
  };

  const handleAuthSuccess = () => {
    setIsAuthDrawerOpen(false);
    setStep('checkout');
  };

  const handlePaymentComplete = () => {
    setStep('success');
    setTimeout(() => {
      clearCart();
      onClose();
      setStep('cart');
    }, 3000);
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
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]"
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-brand-dark border-l border-white/10 z-[70] flex flex-col shadow-2xl"
          >
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShoppingBag className="text-brand-accent" />
                <h2 className="text-xl font-black uppercase tracking-tight">Your Cart</h2>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {step === 'cart' && (
                <>
                  {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                      <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-gray-600">
                        <ShoppingBag size={40} />
                      </div>
                      <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Your cart is empty</p>
                      <button 
                        onClick={onClose}
                        className="text-brand-accent font-black uppercase tracking-widest text-xs hover:underline"
                      >
                        Start Shopping
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {cart.map((item) => (
                        <motion.div 
                          key={item.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex gap-4 group"
                        >
                          <div className="w-20 h-20 bg-white/5 rounded-2xl overflow-hidden p-2 flex-shrink-0">
                            <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-sm uppercase tracking-tight truncate">{item.name}</h3>
                            <p className="text-brand-accent font-black text-sm mb-2">₹{item.price}</p>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center bg-white/5 rounded-lg px-2 py-1">
                                <button 
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className="p-1 hover:text-brand-accent transition-colors"
                                >
                                  <Minus size={14} />
                                </button>
                                <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                                <button 
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="p-1 hover:text-brand-accent transition-colors"
                                >
                                  <Plus size={14} />
                                </button>
                              </div>
                              <button 
                                onClick={() => removeFromCart(item.id)}
                                className="text-gray-500 hover:text-red-500 transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {step === 'auth-prompt' && (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-8 p-4">
                  <div className="w-24 h-24 bg-brand-accent/10 rounded-full flex items-center justify-center text-brand-accent">
                    <UserIcon size={48} />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-2xl font-black uppercase tracking-tight italic">Account Required</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      Please log in or create an account to complete your purchase and track your orders.
                    </p>
                  </div>
                  
                  <div className="w-full space-y-4">
                    <button 
                      onClick={() => {
                        setAuthMode('login');
                        setIsAuthDrawerOpen(true);
                      }}
                      className="btn-primary w-full py-5 flex items-center justify-center gap-3"
                    >
                      <LogIn size={20} />
                      Log In to Continue
                    </button>
                    <button 
                      onClick={() => {
                        setAuthMode('register');
                        setIsAuthDrawerOpen(true);
                      }}
                      className="w-full py-4 text-gray-400 hover:text-white font-bold uppercase tracking-widest text-xs transition-colors"
                    >
                      New here? Create Account
                    </button>
                    <button 
                      onClick={() => setStep('cart')}
                      className="block w-full text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] hover:text-brand-accent transition-colors"
                    >
                      Back to Cart
                    </button>
                  </div>
                </div>
              )}

              {step === 'checkout' && (
                <div className="space-y-8 text-center">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black uppercase tracking-tight">Scan & Pay</h3>
                    <p className="text-sm text-gray-400">Scan the UPI QR code below to complete your payment of <span className="text-brand-accent font-black">₹{totalPrice}</span></p>
                  </div>

                  {upiQrCode ? (
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-white p-6 rounded-3xl shadow-2xl max-w-[280px] mx-auto"
                    >
                      <img src={upiQrCode} alt="UPI QR Code" className="w-full h-full object-contain" />
                    </motion.div>
                  ) : (
                    <div className="bg-white/5 border-2 border-dashed border-white/10 rounded-3xl p-12 flex flex-col items-center justify-center text-gray-500">
                      <AlertCircle size={48} className="mb-4" />
                      <p className="text-sm font-bold uppercase tracking-widest">Payment method not set</p>
                      <p className="text-xs mt-2">Please contact the admin to set up the UPI scanner.</p>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="bg-brand-accent/10 border border-brand-accent/20 rounded-2xl p-4 text-left">
                      <p className="text-[10px] uppercase font-black text-brand-accent mb-1 tracking-widest">Instructions</p>
                      <p className="text-xs text-gray-300 leading-relaxed">
                        1. Open any UPI app (GPay, PhonePe, Paytm)<br/>
                        2. Scan the QR code above<br/>
                        3. Enter the amount: ₹{totalPrice}<br/>
                        4. Once paid, click the button below
                      </p>
                    </div>
                    <button 
                      onClick={handlePaymentComplete}
                      disabled={!upiQrCode}
                      className="btn-primary w-full py-5 text-lg shadow-xl shadow-brand-accent/20 disabled:opacity-50"
                    >
                      I Have Paid
                    </button>
                    <button 
                      onClick={() => setStep('cart')}
                      className="text-gray-500 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors"
                    >
                      Back to Cart
                    </button>
                  </div>
                </div>
              )}

              {step === 'success' && (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center text-green-500"
                  >
                    <CheckCircle2 size={64} />
                  </motion.div>
                  <div className="space-y-2">
                    <h3 className="text-3xl font-black uppercase tracking-tight">Order Placed!</h3>
                    <p className="text-gray-400">Thank you for your purchase. Your order is being processed.</p>
                  </div>
                </div>
              )}
            </div>

            {step === 'cart' && cart.length > 0 && (
              <div className="p-6 border-t border-white/10 bg-white/5 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-bold uppercase tracking-widest text-xs">Total Amount</span>
                  <span className="text-2xl font-black text-brand-accent">₹{totalPrice}</span>
                </div>
                <button 
                  onClick={handleCheckout}
                  className="btn-primary w-full py-5 text-lg flex items-center justify-center gap-3 shadow-xl shadow-brand-accent/20"
                >
                  Checkout Now
                </button>
              </div>
            )}
          </motion.div>
          
          <AuthDrawer 
            isOpen={isAuthDrawerOpen} 
            onClose={() => setIsAuthDrawerOpen(false)} 
            initialMode={authMode} 
            onSuccess={handleAuthSuccess}
          />
        </>
      )}
    </AnimatePresence>
  );
}
