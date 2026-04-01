import React, { useState, useEffect } from 'react';
import { db, storage, collection, query, orderBy, onSnapshot, deleteDoc, doc, ref, deleteObject } from '../../lib/firebase';
import { Play, Trash2, Plus, Film, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import VideoUpload from '../VideoGallery/VideoUpload';
import { toast } from 'sonner';

interface Video {
  id: string;
  title: string;
  description?: string;
  url: string;
  thumbnailUrl?: string;
  createdAt: any;
  authorUid: string;
}

const AdminVideos: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'videos'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const videoList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Video[];
      setVideos(videoList);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching videos:", error);
      toast.error("Failed to load videos");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="animate-spin text-brand-accent" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <Film className="text-brand-accent" /> Video Management
          </h3>
          <p className="text-gray-400 text-sm">Upload and manage your gym videos</p>
        </div>
        <button 
          onClick={() => setShowUpload(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} /> Add New Video
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => (
          <motion.div 
            key={video.id}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-2xl overflow-hidden group"
          >
            <div className="aspect-video bg-black relative">
              {video.thumbnailUrl ? (
                <img 
                  src={video.thumbnailUrl} 
                  alt={video.title} 
                  className="w-full h-full object-cover opacity-80"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-brand-gray">
                  <Play size={32} className="text-brand-accent opacity-50" />
                </div>
              )}
              <div className="absolute top-4 right-4 flex gap-2">
                <button 
                  onClick={() => handleDelete(video)}
                  className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                  title="Delete Video"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            
            <div className="p-5">
              <h4 className="font-bold text-lg mb-1 truncate">{video.title}</h4>
              {video.description && <p className="text-gray-400 text-xs line-clamp-2">{video.description}</p>}
              <div className="mt-4 flex items-center justify-between text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                <span>{video.createdAt?.toDate().toLocaleDateString()}</span>
                <a 
                  href={video.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-brand-accent hover:underline"
                >
                  View File
                </a>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {videos.length === 0 && (
        <div className="text-center py-24 glass-card rounded-3xl border-dashed border-2 border-white/5">
          <Film size={48} className="mx-auto text-gray-600 mb-4" />
          <p className="text-gray-500">No videos found. Start by uploading one!</p>
        </div>
      )}

      <AnimatePresence>
        {showUpload && (
          <VideoUpload onClose={() => setShowUpload(false)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminVideos;
