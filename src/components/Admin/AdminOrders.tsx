import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../../lib/firebase';
import { collection, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { ShoppingBag, User, Calendar, CreditCard, ChevronDown, ChevronUp, Trash2, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const toggleOrder = (id: string) => {
    setExpandedOrder(expandedOrder === id ? null : id);
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, 'orders', id), { status });
      toast.success(`Order marked as ${status}`);
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const deleteOrder = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this order record?')) return;
    try {
      await deleteDoc(doc(db, 'orders', id));
      toast.success('Order record deleted');
    } catch (error) {
      toast.error('Failed to delete order record');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-10 h-10 border-4 border-brand-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-black uppercase italic">Customer <span className="text-brand-accent">Orders</span></h2>
          <p className="text-gray-400 text-sm">Manage and track all supplement purchases</p>
        </div>
        <div className="bg-white/5 px-4 py-2 rounded-full border border-white/10">
          <span className="text-xs font-black uppercase tracking-widest text-brand-accent">{orders.length} Total Orders</span>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 glass-card rounded-3xl border-white/5">
          <ShoppingBag size={48} className="mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">No orders found yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div 
              key={order.id} 
              className={`glass-card rounded-3xl border-white/5 overflow-hidden transition-all ${expandedOrder === order.id ? 'ring-1 ring-brand-accent/30' : ''}`}
            >
              <div 
                onClick={() => toggleOrder(order.id)}
                className="p-6 flex flex-wrap items-center justify-between gap-4 cursor-pointer hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-brand-accent/10 rounded-2xl flex items-center justify-center text-brand-accent">
                    <ShoppingBag size={24} />
                  </div>
                  <div>
                    <h3 className="font-black uppercase tracking-tight text-lg">Order #{order.id.slice(-6).toUpperCase()}</h3>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><User size={12} /> {order.userName}</span>
                      <span className="flex items-center gap-1"><Calendar size={12} /> {order.createdAt?.toDate().toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-brand-accent font-black text-xl">₹{order.totalAmount}</p>
                    <div className="flex items-center gap-2 justify-end">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                        order.paymentMethod === 'cod' ? 'bg-blue-500/10 text-blue-500' : 'bg-purple-500/10 text-purple-500'
                      }`}>
                        {order.paymentMethod || 'upi'}
                      </span>
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                        order.status === 'paid' || order.status === 'completed' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                  {expandedOrder === order.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </div>

              <AnimatePresence>
                {expandedOrder === order.id && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-white/5"
                  >
                    <div className="p-8 space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Customer Info */}
                        <div className="space-y-4">
                          <h4 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">Customer Details</h4>
                          <div className="bg-white/5 rounded-2xl p-4 space-y-2">
                            <p className="text-sm font-bold">{order.userName}</p>
                            <p className="text-xs text-gray-400">{order.userEmail}</p>
                            <p className="text-[10px] text-gray-600 font-mono">UID: {order.userId}</p>
                          </div>
                        </div>

                        {/* Order Actions */}
                        <div className="space-y-4">
                          <h4 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">Actions</h4>
                          <div className="flex flex-wrap gap-3">
                            {order.status !== 'completed' && (
                              <button 
                                onClick={(e) => { e.stopPropagation(); updateStatus(order.id, 'completed'); }}
                                className="flex items-center gap-2 bg-green-500/10 text-green-500 border border-green-500/20 px-4 py-2 rounded-xl text-xs font-bold hover:bg-green-500 hover:text-white transition-all"
                              >
                                <CheckCircle size={14} /> Mark Completed
                              </button>
                            )}
                            {order.status !== 'pending' && (
                              <button 
                                onClick={(e) => { e.stopPropagation(); updateStatus(order.id, 'pending'); }}
                                className="flex items-center gap-2 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-4 py-2 rounded-xl text-xs font-bold hover:bg-yellow-500 hover:text-white transition-all"
                              >
                                <Clock size={14} /> Mark Pending
                              </button>
                            )}
                            <button 
                              onClick={(e) => { e.stopPropagation(); deleteOrder(order.id); }}
                              className="flex items-center gap-2 bg-red-500/10 text-red-500 border border-red-500/20 px-4 py-2 rounded-xl text-xs font-bold hover:bg-red-500 hover:text-white transition-all"
                            >
                              <Trash2 size={14} /> Delete Record
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Items List */}
                      <div className="space-y-4">
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">Purchased Items</h4>
                        <div className="space-y-3">
                          {order.items.map((item: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/5">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white/5 rounded-xl overflow-hidden p-1">
                                  <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                                </div>
                                <div>
                                  <p className="text-sm font-bold uppercase tracking-tight">{item.name}</p>
                                  <p className="text-xs text-gray-500">Quantity: {item.quantity}</p>
                                </div>
                              </div>
                              <p className="text-brand-accent font-black">₹{item.price * item.quantity}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
