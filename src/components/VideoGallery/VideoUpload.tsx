import React, { useState, useRef } from 'react';
import { db, storage, auth, ref, uploadBytesResumable, getDownloadURL, collection, addDoc, serverTimestamp } from '../../lib/firebase';
import { X, Upload, Film, CheckCircle2, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

interface VideoUploadProps {
  onClose: () => void;
}

const VideoUpload: React.FC<VideoUploadProps> = ({ onClose }) => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 100 * 1024 * 1024) { // 100MB limit
        toast.error("File is too large. Max 100MB.");
        return;
      }
      if (!selectedFile.type.startsWith('video/')) {
        toast.error("Please select a video file.");
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title) return;

    setUploading(true);
    const storageRef = ref(storage, `videos/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed', 
      (snapshot) => {
        const p = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(p);
      }, 
      (error) => {
        console.error("Upload error:", error);
        toast.error("Upload failed");
        setUploading(false);
      }, 
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        
        try {
          await addDoc(collection(db, 'videos'), {
            title,
            description,
            url: downloadURL,
            createdAt: serverTimestamp(),
            authorUid: auth.currentUser?.uid
          });
          
          toast.success("Video uploaded successfully!");
          onClose();
        } catch (error) {
          console.error("Firestore error:", error);
          toast.error("Failed to save video metadata");
        } finally {
          setUploading(false);
        }
      }
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-brand-gray w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl border border-white/10"
      >
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Film className="text-brand-accent" /> Upload New Video
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleUpload} className="p-8 space-y-6">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`aspect-video rounded-3xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center overflow-hidden ${
              file ? 'border-brand-accent bg-brand-accent/5' : 'border-white/10 hover:border-brand-accent/50 hover:bg-white/5'
            }`}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="video/*" 
              className="hidden" 
            />
            {file ? (
              <div className="flex flex-col items-center justify-center gap-3">
                <CheckCircle2 size={48} className="text-brand-accent" />
                <div className="text-center">
                  <p className="text-sm font-bold uppercase tracking-wider text-brand-accent">{file.name}</p>
                  <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
              </div>
            ) : (
              <>
                <Upload size={48} className="text-gray-600 mb-4" />
                <p className="text-sm text-gray-400 font-bold uppercase tracking-wider">Click to Select Video</p>
                <p className="text-[10px] text-gray-600 mt-2 uppercase tracking-widest">Max 100MB (MP4, WebM)</p>
              </>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Video Title</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a catchy title"
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-accent transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Description (Optional)</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this video about?"
                rows={3}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-accent transition-colors resize-none"
              />
            </div>
          </div>

          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-400">
                <span>Uploading...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full h-2 bg-black rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-brand-accent"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          <button 
            type="submit" 
            disabled={!file || !title || uploading}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <Loader2 className="animate-spin" size={20} /> Uploading...
              </>
            ) : (
              <>
                <Upload size={20} /> Start Upload
              </>
            )}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default VideoUpload;
