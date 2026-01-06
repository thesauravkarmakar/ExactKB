
import React, { useCallback, useState } from 'react';
import { Upload, Image as ImageIcon, ShieldCheck, CloudOff, UserMinus } from 'lucide-react';

interface DropzoneProps {
  onFilesSelected: (files: FileList) => void;
}

const Dropzone: React.FC<DropzoneProps> = ({ onFilesSelected }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelected(e.dataTransfer.files);
    }
  }, [onFilesSelected]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(e.target.files);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-10">
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`relative group cursor-pointer transition-all duration-500 ease-out border-2 border-dashed rounded-[40px] p-12 text-center flex flex-col items-center justify-center min-h-[340px] bg-white ${
          isDragging 
            ? 'border-blue-500 bg-blue-50/50 shadow-2xl scale-[1.01]' 
            : 'border-slate-200 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-200/50'
        }`}
      >
        <input
          type="file"
          multiple
          accept="image/*"
          title=""
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          onChange={handleFileInput}
        />
        
        <div className={`p-6 rounded-3xl mb-6 transition-all duration-500 ${isDragging ? 'bg-blue-600 text-white rotate-12 scale-110' : 'bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 group-hover:-translate-y-1'}`}>
          <Upload size={40} strokeWidth={2.5} />
        </div>

        <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">
          Drop your images here
        </h3>
        <p className="text-slate-500 mb-8 max-w-sm font-medium leading-relaxed">
          Select multiple images to compress them all to your exact target size instantly.
        </p>

        <div className="flex items-center gap-6 py-3 px-6 bg-slate-50 rounded-2xl text-xs font-black text-slate-400 tracking-widest uppercase">
          <div className="flex items-center gap-2">
            <ImageIcon size={14} />
            <span>JPEG</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-slate-200" />
          <span>PNG</span>
          <div className="w-1 h-1 rounded-full bg-slate-200" />
          <span>WEBP</span>
        </div>
      </div>

      {/* Trust & Privacy Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex flex-col items-center text-center p-6 bg-white/50 border border-slate-100 rounded-[32px] transition-all hover:bg-white hover:shadow-md group">
          <div className="mb-4 p-3 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:scale-110 transition-transform">
            <ShieldCheck size={24} />
          </div>
          <h4 className="font-bold text-slate-900 mb-1">No Tracking</h4>
          <p className="text-sm text-slate-500 font-medium">We don't use cookies or any analytics scripts.</p>
        </div>

        <div className="flex flex-col items-center text-center p-6 bg-white/50 border border-slate-100 rounded-[32px] transition-all hover:bg-white hover:shadow-md group">
          <div className="mb-4 p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:scale-110 transition-transform">
            <CloudOff size={24} />
          </div>
          <h4 className="font-bold text-slate-900 mb-1">Local Processing</h4>
          <p className="text-sm text-slate-500 font-medium">Your photos never leave your computer. Ever.</p>
        </div>

        <div className="flex flex-col items-center text-center p-6 bg-white/50 border border-slate-100 rounded-[32px] transition-all hover:bg-white hover:shadow-md group">
          <div className="mb-4 p-3 bg-purple-50 text-purple-600 rounded-2xl group-hover:scale-110 transition-transform">
            <UserMinus size={24} />
          </div>
          <h4 className="font-bold text-slate-900 mb-1">Zero Sign-up</h4>
          <p className="text-sm text-slate-500 font-medium">No accounts, no emails, no friction. Just compress.</p>
        </div>
      </div>
    </div>
  );
};

export default Dropzone;
