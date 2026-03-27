import React, { useState, useEffect } from 'react';
import { auth, db, googleProvider, signInWithPopup, signOut, onAuthStateChanged, User, collection, doc, setDoc, onSnapshot, Timestamp } from '../firebase';
import { ContentSection } from '../types';
import { LogIn, LogOut, Save, Plus, Trash2, Image as ImageIcon, Layout, Type, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const ADMIN_EMAIL = "faisal.hassan.0996@gmail.com";

const AdminPortal: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [sections, setSections] = useState<ContentSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSection, setEditingSection] = useState<Partial<ContentSection> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user && user.email === ADMIN_EMAIL) {
      const unsubscribe = onSnapshot(collection(db, 'siteContent'), (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ContentSection));
        setSections(data);
      }, (err) => {
        console.error("Firestore Error:", err);
        setError("Failed to fetch content. Check security rules.");
      });
      return () => unsubscribe();
    }
  }, [user]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error("Login Error:", err);
      setError("Login failed.");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSection || !editingSection.id || !editingSection.title || !editingSection.subtitle) return;

    try {
      const sectionRef = doc(db, 'siteContent', editingSection.id);
      await setDoc(sectionRef, {
        title: editingSection.title,
        subtitle: editingSection.subtitle,
        imageUrl: editingSection.imageUrl || "",
        updatedAt: Timestamp.now()
      }, { merge: true });
      setEditingSection(null);
      setError(null);
    } catch (err) {
      console.error("Save Error:", err);
      setError("Failed to save content. You might not have permission.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 font-sans">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-zinc-900"></div>
      </div>
    );
  }

  if (!user || user.email !== ADMIN_EMAIL) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 font-sans p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-zinc-100 text-center"
        >
          <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Layout className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 mb-2">Admin Portal</h1>
          <p className="text-zinc-500 mb-8">Please sign in with your authorized admin account to manage the website content.</p>
          <button 
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-3 bg-zinc-900 text-white py-4 rounded-2xl font-semibold hover:bg-zinc-800 transition-all active:scale-95"
          >
            <LogIn className="w-5 h-5" />
            Sign in with Google
          </button>
          {error && <p className="mt-4 text-red-500 text-sm">{error}</p>}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center">
              <Layout className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-zinc-900">CMS Dashboard</h1>
              <p className="text-xs text-zinc-500">Managing: {user.email}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition-colors px-4 py-2 rounded-xl hover:bg-zinc-100"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Content List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-zinc-900">Website Sections</h2>
              <button 
                onClick={() => setEditingSection({ id: `section-${Date.now()}`, title: '', subtitle: '', imageUrl: '' })}
                className="flex items-center gap-2 bg-zinc-900 text-white px-6 py-3 rounded-2xl font-semibold hover:bg-zinc-800 transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                Add Section
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {sections.map((section) => (
                <motion.div 
                  layout
                  key={section.id}
                  className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-zinc-100 rounded-2xl flex items-center justify-center text-zinc-400 group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-zinc-900">{section.title}</h3>
                      <p className="text-sm text-zinc-500 truncate max-w-xs">{section.subtitle}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setEditingSection(section)}
                      className="p-3 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition-all"
                    >
                      <Type className="w-5 h-5" />
                    </button>
                    <button className="p-3 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              ))}
              {sections.length === 0 && (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-zinc-300">
                  <p className="text-zinc-400">No sections found. Start by adding one.</p>
                </div>
              )}
            </div>
          </div>

          {/* Editor Sidebar */}
          <div className="lg:col-span-1">
            <AnimatePresence mode="wait">
              {editingSection ? (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-xl sticky top-32"
                >
                  <h2 className="text-xl font-bold text-zinc-900 mb-6 flex items-center gap-2">
                    <Type className="w-5 h-5" />
                    Editor
                  </h2>
                  <form onSubmit={handleSave} className="space-y-6">
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Section ID</label>
                      <input 
                        type="text" 
                        value={editingSection.id} 
                        disabled 
                        className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl text-zinc-400 cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Title</label>
                      <input 
                        type="text" 
                        value={editingSection.title || ''} 
                        onChange={(e) => setEditingSection({ ...editingSection, title: e.target.value })}
                        className="w-full border border-zinc-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-zinc-900 outline-none transition-all"
                        placeholder="Hero Title"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Subtitle / Content</label>
                      <textarea 
                        rows={4}
                        value={editingSection.subtitle || ''} 
                        onChange={(e) => setEditingSection({ ...editingSection, subtitle: e.target.value })}
                        className="w-full border border-zinc-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-zinc-900 outline-none transition-all resize-none"
                        placeholder="Enter section description..."
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Image URL (Optional)</label>
                      <div className="relative">
                        <input 
                          type="text" 
                          value={editingSection.imageUrl || ''} 
                          onChange={(e) => setEditingSection({ ...editingSection, imageUrl: e.target.value })}
                          className="w-full border border-zinc-200 pl-11 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-zinc-900 outline-none transition-all"
                          placeholder="https://..."
                        />
                        <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                      </div>
                    </div>
                    <div className="flex gap-3 pt-4">
                      <button 
                        type="button"
                        onClick={() => setEditingSection(null)}
                        className="flex-1 px-6 py-4 rounded-2xl font-semibold text-zinc-500 hover:bg-zinc-100 transition-all"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        className="flex-1 flex items-center justify-center gap-2 bg-zinc-900 text-white px-6 py-4 rounded-2xl font-semibold hover:bg-zinc-800 transition-all active:scale-95"
                      >
                        <Save className="w-4 h-4" />
                        Save
                      </button>
                    </div>
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                  </form>
                </motion.div>
              ) : (
                <div className="bg-zinc-100 p-12 rounded-3xl border border-dashed border-zinc-300 text-center sticky top-32">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <Type className="text-zinc-400 w-6 h-6" />
                  </div>
                  <p className="text-zinc-500 text-sm">Select a section to edit its content dynamically.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminPortal;
