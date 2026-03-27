import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "motion/react";
import { ShoppingCart, Search, Filter, ChevronRight, Package, Check, XCircle, ShoppingBag, User as UserIcon, LogOut } from "lucide-react";
import { db, auth, signOut, onAuthStateChanged, type User } from '../lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { useCart } from '../context/CartContext';
import Cart from './Cart';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';

const categories = ["All", "Protein", "Pre-workout", "Creatine", "Vitamins", "Accessories"];

export default function Shop() {
  const [supplements, setSupplements] = useState<any[]>([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  
  const { addToCart, totalItems } = useCart();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'supplements'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setSupplements(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  const handleBuyNow = (product: any) => {
    addToCart(product);
    setIsCartOpen(true);
  };

  const filteredProducts = supplements.filter(p => {
    const matchesFilter = filter === "All" || p.category === filter;
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                         p.description.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-brand-dark pt-32 pb-24">
      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      
      {/* Header Actions */}
      <div className="fixed top-8 right-8 z-50 flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 p-2 pl-4 rounded-full">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-black uppercase tracking-widest text-brand-accent">Welcome</p>
              <p className="text-xs font-bold truncate max-w-[100px]">{user.displayName || user.email}</p>
            </div>
            <button 
              onClick={handleLogout}
              className="w-10 h-10 bg-white/5 hover:bg-red-500/20 hover:text-red-500 rounded-full flex items-center justify-center transition-all"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <Link 
            to="/shop/auth"
            className="flex items-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 px-6 py-3 rounded-full hover:bg-brand-accent hover:border-brand-accent transition-all group"
          >
            <UserIcon size={18} className="text-brand-accent group-hover:text-white transition-colors" />
            <span className="text-xs font-black uppercase tracking-widest">Login</span>
          </Link>
        )}

        {/* Floating Cart Button */}
        <motion.button 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={() => setIsCartOpen(true)}
          className="w-16 h-16 bg-brand-accent rounded-full flex items-center justify-center text-white shadow-2xl shadow-brand-accent/40 group overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          <div className="relative">
            <ShoppingBag size={28} />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 w-6 h-6 bg-white text-brand-accent rounded-full text-[10px] font-black flex items-center justify-center shadow-lg">
                {totalItems}
              </span>
            )}
          </div>
        </motion.button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-brand-accent font-black uppercase tracking-widest text-sm mb-4 block"
          >
            AimFit Store
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black mb-6 uppercase italic leading-tight"
          >
            Fuel Your <span className="text-brand-accent">Ambition</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 max-w-2xl mx-auto text-lg"
          >
            Premium supplements and accessories to help you achieve your fitness goals faster.
          </motion.p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col lg:flex-row gap-8 mb-12 items-center justify-between">
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            <input 
              type="text" 
              placeholder="Search supplements..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 focus:border-brand-accent outline-none transition-all text-white"
            />
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
                  filter === cat 
                    ? "bg-brand-accent text-white shadow-lg shadow-brand-accent/20" 
                    : "bg-white/5 text-gray-400 hover:bg-white/10"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-12 h-12 border-4 border-brand-accent border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((p, i) => (
                <motion.div
                  key={p.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="glass-card rounded-3xl overflow-hidden group border-white/5 hover:border-brand-accent/30 transition-all flex flex-col"
                >
                  <div className="aspect-square relative overflow-hidden bg-white/5 p-8">
                    <img 
                      src={p.image} 
                      alt={p.name} 
                      className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                    {!p.inStock && (
                      <div className="absolute inset-0 bg-brand-dark/60 backdrop-blur-[2px] flex items-center justify-center p-4">
                        <span className="bg-red-500 text-white px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-xl">
                          Out of Stock
                        </span>
                      </div>
                    )}
                    <div className="absolute top-4 right-4">
                      <span className="bg-brand-dark/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-brand-accent border border-brand-accent/20">
                        {p.category}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-black uppercase tracking-tight">{p.name}</h3>
                      <p className="text-brand-accent font-black text-lg">₹{p.price}</p>
                    </div>
                    <p className="text-gray-400 text-sm line-clamp-2 leading-relaxed mb-6 flex-1">
                      {p.description}
                    </p>
                    
                    <div className="flex flex-col gap-3">
                      <button 
                        onClick={() => handleBuyNow(p)}
                        disabled={!p.inStock}
                        className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all ${
                          p.inStock 
                            ? "btn-primary shadow-lg shadow-brand-accent/20" 
                            : "bg-white/5 text-gray-600 cursor-not-allowed"
                        }`}
                      >
                        Buy Now
                      </button>
                      <button 
                        onClick={() => addToCart(p)}
                        disabled={!p.inStock}
                        className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all border border-white/10 hover:bg-white/5 ${
                          !p.inStock && "opacity-50 cursor-not-allowed"
                        }`}
                      >
                        <ShoppingCart size={18} />
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-24 glass-card rounded-3xl border-white/5">
            <Package size={64} className="mx-auto text-gray-600 mb-6" />
            <h3 className="text-2xl font-black uppercase mb-2">No products found</h3>
            <p className="text-gray-500">Try adjusting your search or filter to find what you're looking for.</p>
            <button 
              onClick={() => {setFilter("All"); setSearch("");}}
              className="mt-8 text-brand-accent font-bold uppercase tracking-widest text-sm hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: "Quality Assured", desc: "All our supplements are sourced from certified international brands." },
            { title: "Expert Advice", desc: "Consult our trainers to find the right supplement for your goals." },
            { title: "Fast Delivery", desc: "Get your supplements delivered to your doorstep within 24-48 hours." }
          ].map((item, i) => (
            <div key={i} className="glass-card p-8 rounded-3xl border-white/5 text-center">
              <h4 className="text-lg font-black uppercase mb-3 text-brand-accent">{item.title}</h4>
              <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
