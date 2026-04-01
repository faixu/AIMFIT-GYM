import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, X, Video as VideoIcon } from 'lucide-react';
import { db, onSnapshot, collection, query, orderBy } from '../lib/firebase';

interface VideoData {
  id: string;
  title: string;
  url: string;
  thumbnailUrl?: string;
  createdAt: string;
}

export default function VideoGallery() {
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null);
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

  if (loading) return null;
  if (videos.length === 0) return null;

  return (
    <section id="videos" className="py-24 bg-brand-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl mb-4 uppercase font-black italic">
            Video <span className="text-brand-accent">Gallery</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Experience the energy and atmosphere of AimFit through our video collection.
          </p>
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
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                  <h3 className="text-xl font-black uppercase tracking-tight text-white">{video.title}</h3>
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
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
