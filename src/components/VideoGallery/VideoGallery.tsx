import React, { useState, useEffect } from 'react';
import { db, storage, collection, query, orderBy, onSnapshot, deleteDoc, doc, ref, deleteObject } from '../../lib/firebase';
import { useAdmin } from '../../hooks/useAdmin';
import { Play, Trash2, Plus, LogIn, LogOut, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import VideoUpload from './VideoUpload';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import Navbar from '../Navbar';
import Footer from '../Footer';
import { auth } from '../../lib/firebase';
import { signOut } from 'firebase/auth';

interface Video {
  id: string;
  title: string;
  description?: string;
  url: string;
  thumbnailUrl?: string;
  createdAt: any;
  authorUid: string;
}

const VideoGallery: React.FC = () => {
  const { isAdmin, user, loading: adminLoading } = useAdmin();
  const [videos, setVideos] = useState<Video[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'videos'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const videoList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Video[];
      setVideos(videoList);
    }, (error) => {
      console.error("Error fetching videos:", error);
      toast.error("Failed to load videos");
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    if (localStorage.getItem('admin_auth')) {
      localStorage.removeItem('admin_auth');
      window.location.reload();
    } else {
      await signOut(auth);
    }
  };

  const handleDelete = async (video: Video) => {
    if (!window.confirm("Are you sure you want to delete this video?")) return;

    try {
      // Delete from Firestore
      await deleteDoc(doc(db, 'videos', video.id));
      
      // Delete from Storage (if it's a storage URL)
      if (video.url.includes('firebasestorage.googleapis.com')) {
        const videoRef = ref(storage, video.url);
        await deleteObject(videoRef);
      }
      
      toast.success("Video deleted successfully");
    } catch (error) {
      console.error("Error deleting video:", error);
      toast.error("Failed to delete video");
    }
  };

  if (adminLoading) return null;

  return (
    <div className="min-h-screen bg-brand-dark text-white">
      <Navbar />
      
      <main className="pt-32 pb-24 px-6 md:p-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
            <div>
              <h1 className="text-4xl md:text-6xl mb-2 font-black uppercase italic">Video <span className="text-brand-accent">Gallery</span></h1>
              <p className="text-gray-400">Watch our latest gym highlights and tutorials</p>
            </div>
            
            <div className="flex items-center gap-4">
              {isAdmin ? (
                <>
                  <button 
                    onClick={() => setShowUpload(true)}
                    className="btn-primary flex items-center gap-2 px-6 py-3"
                  >
                    <Plus size={20} /> Upload Video
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="bg-white/5 hover:bg-white/10 border border-white/10 p-3 rounded-xl transition-all"
                    title="Logout"
                  >
                    <LogOut size={20} />
                  </button>
                </>
              ) : (
                <Link 
                  to="/admin"
                  className="btn-primary flex items-center gap-2 px-6 py-3"
                >
                  <Shield size={20} /> Admin Access
                </Link>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {videos.map((video) => (
              <motion.div 
                key={video.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-2xl overflow-hidden group relative"
              >
                <div className="aspect-video bg-black relative cursor-pointer" onClick={() => setSelectedVideo(video)}>
                  {video.thumbnailUrl ? (
                    <img 
                      src={video.thumbnailUrl} 
                      alt={video.title} 
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-brand-gray">
                      <Play size={48} className="text-brand-accent opacity-50" />
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                    <div className="w-16 h-16 rounded-full bg-brand-accent flex items-center justify-center">
                      <Play size={32} fill="white" />
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold">{video.title}</h3>
                    {isAdmin && (
                      <button 
                        onClick={() => handleDelete(video)}
                        className="text-gray-500 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                  {video.description && <p className="text-gray-400 text-sm line-clamp-2">{video.description}</p>}
                </div>
              </motion.div>
            ))}
          </div>

          {videos.length === 0 && (
            <div className="text-center py-24 glass-card rounded-3xl">
              <p className="text-gray-500 text-xl italic">No videos uploaded yet.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Video Player Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
            onClick={() => setSelectedVideo(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <video 
                src={selectedVideo.url} 
                controls 
                autoPlay 
                className="w-full h-full"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUpload && (
          <VideoUpload onClose={() => setShowUpload(false)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default VideoGallery;
