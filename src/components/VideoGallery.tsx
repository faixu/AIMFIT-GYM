import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, X, Video as VideoIcon, Plus, Trash2 } from 'lucide-react';
import { db, storage, onSnapshot, collection, query, orderBy, deleteDoc, doc, ref, deleteObject } from '../lib/firebase';
import { useAdmin } from '../hooks/useAdmin';
import VideoUpload from './VideoGallery/VideoUpload';
import { toast } from 'sonner';

interface VideoData {
  id: string;
  title: string;
  description?: string;
  url: string;
  thumbnailUrl?: string;
  createdAt: string;
}

export default function VideoGallery() {
  const { isAdmin } = useAdmin();
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'videos'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const videoList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as VideoData[];
      setVideos(videoList);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = async (e: React.MouseEvent, video: VideoData) => {
    e.stopPropagation();
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

  if (loading) return null;
  if (videos.length === 0) return null;

  return (
    <section id="videos" className="py-24 bg-brand-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 relative">
          <h2 className="text-4xl md:text-5xl mb-4 uppercase font-black italic">
            Video <span className="text-brand-accent">Gallery</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Experience the energy and atmosphere of AimFit through our video collection.
          </p>
          
          {isAdmin && (
            <div className="mt-8 flex justify-center">
              <button 
                onClick={() => setShowUpload(true)}
                className="btn-primary flex items-center gap-2 px-6 py-3"
              >
                <Plus size={20} /> Upload Video
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {videos.map((video) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="group relative aspect-video bg-black rounded-3xl overflow-hidden cursor-pointer shadow-2xl border border-white/5"
              onClick={() => setSelectedVideo(video)}
            >
              {video.thumbnailUrl ? (
                <img 
                  src={video.thumbnailUrl} 
                  alt={video.title} 
                  className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-brand-dark/50">
                  <VideoIcon className="text-gray-700" size={64} />
                </div>
              )}
              
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                <div className="w-16 h-16 bg-brand-accent rounded-full flex items-center justify-center shadow-xl shadow-brand-accent/40 group-hover:scale-110 transition-transform">
                  <Play className="text-white fill-white ml-1" size={24} />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="text-xl font-black uppercase tracking-tight text-white">{video.title}</h3>
                    {isAdmin && (
                      <button 
                        onClick={(e) => handleDelete(e, video)}
                        className="text-white/50 hover:text-brand-accent transition-colors p-1"
                        title="Delete Video"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                  {video.description && (
                    <p className="text-gray-300 text-xs line-clamp-2 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {video.description}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Video Lightbox */}
        <AnimatePresence>
          {selectedVideo && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-12"
              onClick={() => setSelectedVideo(null)}
            >
              <button 
                className="absolute top-8 right-8 text-white hover:text-brand-accent transition-colors z-[110]"
                onClick={() => setSelectedVideo(null)}
              >
                <X size={40} />
              </button>
              
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative w-full max-w-5xl aspect-video rounded-3xl overflow-hidden shadow-2xl bg-black border border-white/10"
                onClick={(e) => e.stopPropagation()}
              >
                <video 
                  src={selectedVideo.url} 
                  controls 
                  autoPlay 
                  className="w-full h-full"
                />
                
                {/* Info Overlay in Lightbox */}
                <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/90 to-transparent pointer-events-none">
                  <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white mb-2">
                    {selectedVideo.title}
                  </h3>
                  {selectedVideo.description && (
                    <p className="text-gray-300 text-sm md:text-base max-w-3xl leading-relaxed">
                      {selectedVideo.description}
                    </p>
                  )}
                </div>
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
    </section>
  );
}
