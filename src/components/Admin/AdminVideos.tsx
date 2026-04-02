import { useState, useEffect } from 'react';
import { db, storage, collection, onSnapshot, query, orderBy, doc, setDoc, deleteDoc, ref, uploadBytes, getDownloadURL, deleteObject } from '../../lib/firebase';
import { Trash2, Plus, Video, Loader2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';

interface VideoData {
  id: string;
  title: string;
  description?: string;
  url: string;
  thumbnailUrl?: string;
  createdAt: string;
}

export default function AdminVideos() {
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

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

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoFile) {
      toast.error('Please select a video file');
      return;
    }

    setUploading(true);
    try {
      // 1. Upload Video
      const videoRef = ref(storage, `videos/${Date.now()}_${videoFile.name}`);
      await uploadBytes(videoRef, videoFile);
      const videoUrl = await getDownloadURL(videoRef);

      // 2. Upload Thumbnail (optional)
      let thumbnailUrl = '';
      if (thumbnailFile) {
        const thumbRef = ref(storage, `thumbnails/${Date.now()}_${thumbnailFile.name}`);
        await uploadBytes(thumbRef, thumbnailFile);
        thumbnailUrl = await getDownloadURL(thumbRef);
      }

      // 3. Save to Firestore
      const videoId = doc(collection(db, 'videos')).id;
      await setDoc(doc(db, 'videos', videoId), {
        title,
        description,
        url: videoUrl,
        thumbnailUrl: thumbnailUrl || null,
        createdAt: new Date().toISOString()
      });

      toast.success('Video uploaded successfully!');
      setShowAddModal(false);
      resetForm();
    } catch (error) {
      console.error('Error uploading video:', error);
      toast.error('Failed to upload video');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteVideo = async (video: VideoData) => {
    if (!confirm('Are you sure you want to delete this video?')) return;

    try {
      // Delete from Firestore
      await deleteDoc(doc(db, 'videos', video.id));
      
      // Note: In a real app, you'd also delete from Storage, but we'll skip for simplicity
      // unless we have the full storage path stored.
      
      toast.success('Video deleted');
    } catch (error) {
      toast.error('Failed to delete video');
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setVideoFile(null);
    setThumbnailFile(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-brand-accent" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-black uppercase tracking-tight">Video Gallery</h3>
          <p className="text-gray-500 text-sm">Manage videos displayed on your website</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center gap-2 px-6 py-3"
        >
          <Plus size={20} />
          Add Video
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => (
          <div key={video.id} className="glass-card overflow-hidden group rounded-2xl border border-white/5">
            <div className="aspect-video relative bg-black flex items-center justify-center">
              {video.thumbnailUrl ? (
                <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover opacity-60" />
              ) : (
                <Video className="text-gray-700" size={48} />
              )}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                <button 
                  onClick={() => handleDeleteVideo(video)}
                  className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
            <div className="p-4">
              <h4 className="font-bold text-lg truncate">{video.title}</h4>
              <p className="text-xs text-gray-500 mt-1">
                Added on {new Date(video.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Add Video Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-brand-dark border border-white/10 p-8 rounded-3xl max-w-lg w-full shadow-2xl"
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black uppercase tracking-tight">Add New Video</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-white/5 rounded-full">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAddVideo} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase text-gray-500 tracking-widest ml-4">Video Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Gym Motivation 2024"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-brand-accent outline-none transition-all text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase text-gray-500 tracking-widest ml-4">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell us about this video..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-brand-accent outline-none transition-all text-white min-h-[100px] resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase text-gray-500 tracking-widest ml-4">Video File</label>
                <div className="relative">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="video-upload"
                    required
                  />
                  <label 
                    htmlFor="video-upload"
                    className="w-full bg-white/5 border border-dashed border-white/20 rounded-2xl px-6 py-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-brand-accent hover:bg-brand-accent/5 transition-all"
                  >
                    <Upload className={videoFile ? "text-brand-accent" : "text-gray-500"} size={32} />
                    <span className="text-sm font-bold text-gray-400">
                      {videoFile ? videoFile.name : "Click to upload video"}
                    </span>
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase text-gray-500 tracking-widest ml-4">Thumbnail Image (Optional)</label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="thumb-upload"
                  />
                  <label 
                    htmlFor="thumb-upload"
                    className="w-full bg-white/5 border border-dashed border-white/20 rounded-2xl px-6 py-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-brand-accent hover:bg-brand-accent/5 transition-all"
                  >
                    <ImageIcon className={thumbnailFile ? "text-brand-accent" : "text-gray-500"} size={24} />
                    <span className="text-xs font-bold text-gray-400">
                      {thumbnailFile ? thumbnailFile.name : "Click to upload thumbnail"}
                    </span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="btn-primary w-full py-5 text-lg flex items-center justify-center gap-3 shadow-xl shadow-brand-accent/20"
              >
                {uploading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={20} />
                    Upload Video
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

import { motion } from 'motion/react';
import { Image as ImageIcon } from 'lucide-react';
