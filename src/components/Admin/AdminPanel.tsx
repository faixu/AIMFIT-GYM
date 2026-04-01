import { useState } from 'react';
import { auth } from '../../lib/firebase';
import { useAdmin } from '../../hooks/useAdmin';
import AdminLogin from './AdminLogin';
import AdminGallery from './AdminGallery';
import AdminTrainers from './AdminTrainers';
import AdminPricing from './AdminPricing';
import AdminShop from './AdminShop';
import AdminSettings from './AdminSettings';
import AdminOrders from './AdminOrders';
import AdminUsers from './AdminUsers';
import AdminVideos from './AdminVideos';
import { LayoutDashboard, Image as ImageIcon, Users, CreditCard, LogOut, Home, Settings as SettingsIcon, ShoppingBag, ClipboardList, ShieldCheck, Film } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminPanel() {
  const { user, isAdmin, loading } = useAdmin();
  const [activeTab, setActiveTab] = useState('gallery');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-dark">
        <div className="w-12 h-12 border-4 border-brand-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <AdminLogin />;
  }

  const tabs = [
    { id: 'gallery', label: 'Gallery', icon: ImageIcon },
    { id: 'videos', label: 'Videos', icon: Film },
    { id: 'trainers', label: 'Trainers', icon: Users },
    { id: 'shop', label: 'Shop', icon: ShoppingBag },
    { id: 'orders', label: 'Orders', icon: ClipboardList },
    { id: 'users', label: 'Users', icon: ShieldCheck },
    { id: 'pricing', label: 'Pricing', icon: CreditCard },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen bg-brand-dark text-white flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-brand-gray border-r border-white/10 p-6 flex flex-col">
        <div className="mb-12">
          <h1 className="text-2xl font-black italic">
            AIM<span className="text-brand-accent">FIT</span>
          </h1>
          <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Admin Dashboard</p>
        </div>

        <nav className="flex-1 space-y-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all ${
                activeTab === tab.id ? 'bg-brand-accent text-white' : 'text-gray-400 hover:bg-white/5'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-8 space-y-2">
          <Link to="/" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-wider text-gray-400 hover:bg-white/5 transition-all">
            <Home size={18} />
            View Site
          </Link>
          <button 
            onClick={() => auth.signOut()}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-wider text-red-500 hover:bg-red-500/10 transition-all"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 md:p-12 overflow-y-auto">
        <header className="mb-12 flex justify-between items-center">
          <h2 className="text-3xl font-black uppercase tracking-tight">
            Manage <span className="text-brand-accent">{activeTab}</span>
          </h2>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold">{user.displayName}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
            <img src={user.photoURL || ''} alt="" className="w-10 h-10 rounded-full border-2 border-brand-accent" />
          </div>
        </header>

        <div className="max-w-6xl">
          {activeTab === 'gallery' && <AdminGallery />}
          {activeTab === 'videos' && <AdminVideos />}
          {activeTab === 'trainers' && <AdminTrainers />}
          {activeTab === 'shop' && <AdminShop />}
          {activeTab === 'orders' && <AdminOrders />}
          {activeTab === 'users' && <AdminUsers />}
          {activeTab === 'pricing' && <AdminPricing />}
          {activeTab === 'settings' && <AdminSettings />}
        </div>
      </main>
    </div>
  );
}
