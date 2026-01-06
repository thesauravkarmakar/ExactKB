
import React, { useCallback, useState } from 'react';
import { Upload, Image as ImageIcon, ShieldCheck } from 'lucide-react';

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
    <div className="w-full max-w-2xl mx-auto">
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`relative group cursor-pointer transition-all duration-300 ease-out border-2 border-dashed rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[300px] bg-white ${
          isDragging 
            ? 'border-blue-500 bg-blue-50 shadow-xl scale-[1.02]' 
            : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
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
        
        <div className={`p-4 rounded-2xl mb-4 transition-colors duration-300 ${isDragging ? 'bg-blue-100 text-blue-600' : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100 group-hover:text-slate-500'}`}>
          <Upload size={32} />
        </div>

        <h3 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">
          Compress images to an exact size
        </h3>
        <p className="text-slate-500 mb-6 max-w-sm font-medium">
          Drag and drop images or click to browse.
        </p>

        <div className="flex items-center gap-6 text-sm text-slate-400 font-semibold">
          <div className="flex items-center gap-1.5">
            <ImageIcon size={16} />
            <span>PNG, JPG, WebP</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={16} />
            <span>100% Client-side</span>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center text-sm text-slate-400 font-medium">
        <p>No tracking. No storage. No sign-ups.</p>
      </div>
    </div>
  );
};

export default Dropzone;
