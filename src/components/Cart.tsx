import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingBag, Trash2, Plus, Minus, QrCode, CheckCircle2, AlertCircle, User as UserIcon, LogIn, ArrowRight, CreditCard, MapPin, Smartphone } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { db, auth } from '../lib/firebase';
import { doc, onSnapshot, collection, addDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import AuthDrawer from './AuthDrawer';
import { toast } from 'sonner';
import GooglePayButton from '@google-pay/button-react';

export default function Cart({ 
  isOpen, 
  onClose, 
  initialStep = 'cart',
  initialOrderId = null
}: { 
  isOpen: boolean; 
  onClose: () => void;
  initialStep?: 'cart' | 'payment-method' | 'checkout-upi' | 'checkout-card' | 'checkout-googlepay' | 'checkout-cod' | 'delivery-address' | 'success' | 'auth-prompt';
  initialOrderId?: string | null;
}) {
  const { cart, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
  const [step, setStep] = useState(initialStep);
  const [upiQrCode, setUpiQrCode] = useState<string | null>(null);
  const [isAuthDrawerOpen, setIsAuthDrawerOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(initialOrderId);
  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    zip: '',
    phone: ''
  });

  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });

  useEffect(() => {
    if (initialStep !== 'cart') {
      setStep(initialStep);
    }
  }, [initialStep]);

  useEffect(() => {
    if (initialOrderId) {
      setOrderId(initialOrderId);
    }
  }, [initialOrderId]);

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
    
    setStep('payment-method');
  };

  const handlePaymentComplete = async (method: 'upi' | 'cod' | 'card' | 'google-pay') => {
    if (!auth.currentUser) return;
    
    setIsProcessing(true);
    try {
      // Save order to Firestore
      const docRef = await addDoc(collection(db, 'orders'), {
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email,
        userName: auth.currentUser.displayName || 'Customer',
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        })),
        totalAmount: totalPrice,
        paymentMethod: method,
        status: method === 'cod' ? 'pending' : 'paid',
        createdAt: serverTimestamp()
      });

      setOrderId(docRef.id);
      setStep('success');
    } catch (error) {
      console.error('Error saving order:', error);
      toast.error('Failed to process order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId) return;
    setIsProcessing(true);
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        deliveryAddress: address,
        updatedAt: serverTimestamp()
      });
      toast.success('Address saved! Order finalized.');
      clearCart();
      onClose();
      setStep('cart');
    } catch (error) {
      console.error('Error saving address:', error);
      toast.error('Failed to save address');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAuthSuccess = () => {
    setIsAuthDrawerOpen(false);
    setStep('payment-method');
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

              {step === 'payment-method' && (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-8 p-4">
                  <div className="w-24 h-24 bg-brand-accent/10 rounded-full flex items-center justify-center text-brand-accent">
                    <CreditCard size={48} />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-2xl font-black uppercase tracking-tight italic">Select Payment</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      Choose how you'd like to pay for your order.
                    </p>
                  </div>
                  
                  <div className="w-full space-y-4">
                    <button 
                      onClick={() => setStep('checkout-googlepay')}
                      className="w-full flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-3xl hover:border-brand-accent transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-brand-accent/10 rounded-2xl flex items-center justify-center text-brand-accent">
                          <Smartphone size={24} />
                        </div>
                        <div className="text-left">
                          <p className="font-bold uppercase tracking-tight">Google Pay</p>
                          <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Fast & Secure</p>
                        </div>
                      </div>
                      <ArrowRight size={20} className="text-gray-600 group-hover:text-brand-accent transition-colors" />
                    </button>

                    <button 
                      onClick={() => setStep('checkout-card')}
                      className="w-full flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-3xl hover:border-brand-accent transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-brand-accent/10 rounded-2xl flex items-center justify-center text-brand-accent">
                          <CreditCard size={24} />
                        </div>
                        <div className="text-left">
                          <p className="font-bold uppercase tracking-tight">Card Payment</p>
                          <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Credit / Debit Card</p>
                        </div>
                      </div>
                      <ArrowRight size={20} className="text-gray-600 group-hover:text-brand-accent transition-colors" />
                    </button>

                    <button 
                      onClick={() => setStep('checkout-upi')}
                      className="w-full flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-3xl hover:border-brand-accent transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-brand-accent/10 rounded-2xl flex items-center justify-center text-brand-accent">
                          <QrCode size={24} />
                        </div>
                        <div className="text-left">
                          <p className="font-bold uppercase tracking-tight">UPI Payment</p>
                          <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Scan & Pay</p>
                        </div>
                      </div>
                      <ArrowRight size={20} className="text-gray-600 group-hover:text-brand-accent transition-colors" />
                    </button>

                    <button 
                      onClick={() => setStep('checkout-cod')}
                      className="w-full flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-3xl hover:border-brand-accent transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-brand-accent">
                          <ShoppingBag size={24} />
                        </div>
                        <div className="text-left">
                          <p className="font-bold uppercase tracking-tight">Cash on Delivery</p>
                          <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Pay at doorstep</p>
                        </div>
                      </div>
                      <ArrowRight size={20} className="text-gray-600 group-hover:text-brand-accent transition-colors" />
                    </button>

                    <button 
                      onClick={() => setStep('cart')}
                      className="block w-full text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] hover:text-brand-accent transition-colors pt-4"
                    >
                      Back to Cart
                    </button>
                  </div>
                </div>
              )}

              {step === 'checkout-googlepay' && (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-8 p-4">
                  <div className="w-24 h-24 bg-brand-accent/10 rounded-full flex items-center justify-center text-brand-accent">
                    <Smartphone size={48} />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-2xl font-black uppercase tracking-tight italic">Google Pay</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      Complete your payment of <span className="text-brand-accent font-black">₹{totalPrice}</span> using Google Pay.
                    </p>
                  </div>

                  <div className="w-full flex justify-center">
                    <GooglePayButton
                      environment="TEST"
                      buttonColor="black"
                      buttonType="buy"
                      paymentRequest={{
                        apiVersion: 2,
                        apiVersionMinor: 0,
                        allowedPaymentMethods: [
                          {
                            type: 'CARD',
                            parameters: {
                              allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
                              allowedCardNetworks: ['MASTERCARD', 'VISA'],
                            },
                            tokenizationSpecification: {
                              type: 'PAYMENT_GATEWAY',
                              parameters: {
                                gateway: 'example',
                                gatewayMerchantId: 'exampleGatewayMerchantId',
                              },
                            },
                          },
                        ],
                        merchantInfo: {
                          merchantId: '12345678901234567890',
                          merchantName: 'AimFit Store',
                        },
                        transactionInfo: {
                          totalPriceStatus: 'FINAL',
                          totalPriceLabel: 'Total',
                          totalPrice: totalPrice.toString(),
                          currencyCode: 'INR',
                          countryCode: 'IN',
                        },
                      }}
                      onLoadPaymentData={paymentRequest => {
                        console.log('load payment data', paymentRequest);
                        handlePaymentComplete('google-pay');
                      }}
                      onError={error => {
                        console.error('Google Pay error', error);
                        toast.error('Google Pay failed');
                      }}
                      className="w-full max-w-[240px]"
                    />
                  </div>

                  <button 
                    onClick={() => setStep('payment-method')}
                    className="text-gray-500 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors"
                  >
                    Change Payment Method
                  </button>
                </div>
              )}

              {step === 'checkout-card' && (
                <div className="space-y-8">
                  <div className="text-center space-y-2">
                    <h3 className="text-2xl font-black uppercase tracking-tight italic">Card Details</h3>
                    <p className="text-sm text-gray-400">Enter your card information to pay <span className="text-brand-accent font-black">₹{totalPrice}</span></p>
                  </div>

                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      handlePaymentComplete('card');
                    }}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black uppercase text-gray-500 tracking-widest ml-4">Card Number</label>
                      <input
                        type="text"
                        placeholder="0000 0000 0000 0000"
                        value={cardDetails.number}
                        onChange={(e) => setCardDetails({...cardDetails, number: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-brand-accent outline-none transition-all text-white"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-[10px] font-black uppercase text-gray-500 tracking-widest ml-4">Expiry</label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          value={cardDetails.expiry}
                          onChange={(e) => setCardDetails({...cardDetails, expiry: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-brand-accent outline-none transition-all text-white"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[10px] font-black uppercase text-gray-500 tracking-widest ml-4">CVV</label>
                        <input
                          type="password"
                          placeholder="***"
                          value={cardDetails.cvv}
                          onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-brand-accent outline-none transition-all text-white"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black uppercase text-gray-500 tracking-widest ml-4">Cardholder Name</label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={cardDetails.name}
                        onChange={(e) => setCardDetails({...cardDetails, name: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-brand-accent outline-none transition-all text-white"
                        required
                      />
                    </div>

                    <button 
                      type="submit"
                      disabled={isProcessing}
                      className="btn-primary w-full py-5 text-lg shadow-xl shadow-brand-accent/20 flex items-center justify-center gap-3"
                    >
                      {isProcessing ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Processing...
                        </>
                      ) : (
                        `Pay ₹${totalPrice}`
                      )}
                    </button>
                  </form>

                  <button 
                    onClick={() => setStep('payment-method')}
                    className="block w-full text-center text-gray-500 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors"
                  >
                    Change Payment Method
                  </button>
                </div>
              )}

              {step === 'checkout-upi' && (
                <div className="space-y-8 text-center">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black uppercase tracking-tight italic">Scan & Pay</h3>
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
                      onClick={() => handlePaymentComplete('upi')}
                      disabled={!upiQrCode || isProcessing}
                      className="btn-primary w-full py-5 text-lg shadow-xl shadow-brand-accent/20 disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                      {isProcessing ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Processing...
                        </>
                      ) : (
                        'I Have Paid'
                      )}
                    </button>
                    <button 
                      onClick={() => setStep('payment-method')}
                      className="text-gray-500 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors"
                    >
                      Change Payment Method
                    </button>
                  </div>
                </div>
              )}

              {step === 'checkout-cod' && (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-8 p-4">
                  <div className="w-24 h-24 bg-brand-accent/10 rounded-full flex items-center justify-center text-brand-accent">
                    <ShoppingBag size={48} />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-2xl font-black uppercase tracking-tight italic">Confirm COD</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      You've selected Cash on Delivery. You will pay <span className="text-brand-accent font-black">₹{totalPrice}</span> when your order is delivered.
                    </p>
                  </div>
                  
                  <div className="w-full space-y-4">
                    <button 
                      onClick={() => handlePaymentComplete('cod')}
                      disabled={isProcessing}
                      className="btn-primary w-full py-5 flex items-center justify-center gap-3"
                    >
                      {isProcessing ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Confirming...
                        </>
                      ) : (
                        'Confirm Order'
                      )}
                    </button>
                    <button 
                      onClick={() => setStep('payment-method')}
                      className="block w-full text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] hover:text-brand-accent transition-colors"
                    >
                      Change Payment Method
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
                    <h3 className="text-3xl font-black uppercase tracking-tight">Order Successful!</h3>
                    <p className="text-gray-400">Thank you for your purchase. Now, please provide your delivery address.</p>
                  </div>
                  <button 
                    onClick={() => setStep('delivery-address')}
                    className="btn-primary w-full py-4 flex items-center justify-center gap-3"
                  >
                    Add Delivery Address
                    <ArrowRight size={20} />
                  </button>
                </div>
              )}

              {step === 'delivery-address' && (
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <div className="w-16 h-16 bg-brand-accent/10 rounded-full flex items-center justify-center text-brand-accent mx-auto">
                      <MapPin size={32} />
                    </div>
                    <h3 className="text-2xl font-black uppercase tracking-tight italic">Delivery Address</h3>
                    <p className="text-gray-400 text-xs">Where should we send your fitness fuel?</p>
                  </div>

                  <form onSubmit={handleAddressSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-2">Street Address</label>
                      <input 
                        type="text"
                        required
                        value={address.street}
                        onChange={(e) => setAddress({...address, street: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-brand-accent outline-none text-white text-sm"
                        placeholder="123 Gym Street"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-2">City</label>
                        <input 
                          type="text"
                          required
                          value={address.city}
                          onChange={(e) => setAddress({...address, city: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-brand-accent outline-none text-white text-sm"
                          placeholder="Mumbai"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-2">State</label>
                        <input 
                          type="text"
                          required
                          value={address.state}
                          onChange={(e) => setAddress({...address, state: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-brand-accent outline-none text-white text-sm"
                          placeholder="Maharashtra"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-2">ZIP Code</label>
                        <input 
                          type="text"
                          required
                          value={address.zip}
                          onChange={(e) => setAddress({...address, zip: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-brand-accent outline-none text-white text-sm"
                          placeholder="400001"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-2">Phone</label>
                        <input 
                          type="tel"
                          required
                          value={address.phone}
                          onChange={(e) => setAddress({...address, phone: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-brand-accent outline-none text-white text-sm"
                          placeholder="+91 9876543210"
                        />
                      </div>
                    </div>

                    <button 
                      type="submit"
                      disabled={isProcessing}
                      className="btn-primary w-full py-5 mt-4 flex items-center justify-center gap-3"
                    >
                      {isProcessing ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Saving...
                        </>
                      ) : (
                        'Finalize Order'
                      )}
                    </button>
                  </form>
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
