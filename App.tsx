
import React, { useState, useCallback } from 'react';
import { Target, RotateCcw, Download, Sparkles, ChevronRight, LayoutGrid } from 'lucide-react';
import { ImageFile, SizeUnit } from './types';
import Dropzone from './components/Dropzone';
import ResultCard from './components/ResultCard';
import { compressImage } from './services/compressionService';

const App: React.FC = () => {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [targetSize, setTargetSize] = useState<number>(1);
  const [unit, setUnit] = useState<SizeUnit>('MB');
  const [isProcessingAll, setIsProcessingAll] = useState(false);

  const getRecommendation = () => {
    if (images.length === 0) return "Ideal for fast web loading";
    const avgSize = images.reduce((acc, img) => acc + img.originalSize, 0) / images.length;
    if (avgSize > 2 * 1024 * 1024) return "Scaling dimensions as needed";
    return "Precision optimization active";
  };

  const handleFilesSelected = (files: FileList) => {
    const newImages: ImageFile[] = Array.from(files).map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      originalSize: file.size,
      originalPreview: URL.createObjectURL(file),
      status: 'idle',
    }));
    setImages((prev) => [...prev, ...newImages]);
  };

  const startCompression = useCallback(async () => {
    if (images.length === 0) return;
    setIsProcessingAll(true);
    const multiplier = unit === 'MB' ? 1024 * 1024 : 1024;
    const targetBytes = targetSize * multiplier;

    const updatedImages = await Promise.all(
      images.map(async (img) => {
        setImages(prev => prev.map(p => p.id === img.id ? { ...p, status: 'compressing' as const } : p));
        try {
          const result = await compressImage(img.file, targetBytes);
          return { ...img, status: 'completed' as const, result };
        } catch (error) {
          console.error('Compression error:', error);
          return { ...img, status: 'error' as const };
        }
      })
    );

    setImages(updatedImages);
    setIsProcessingAll(false);
  }, [images, targetSize, unit]);

  const handleDownload = (image: ImageFile) => {
    if (!image.result) return;
    const link = document.createElement('a');
    link.href = image.result.previewUrl;
    const ext = image.file.name.split('.').pop();
    const name = image.file.name.replace(/\.[^/.]+$/, "") + `_exact.${ext}`;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadAll = () => {
    images.forEach(img => {
      if (img.status === 'completed') handleDownload(img);
    });
  };

  const clearAll = () => {
    setImages([]);
  };

  const hasUnprocessed = images.some(img => img.status === 'idle');

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 md:py-20 animate-in fade-in duration-700">
      <header className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-8">
          <Sparkles size={14} />
          <span>EXACT SIZE COMPRESSION</span>
        </div>
        <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter mb-6">
          Exact<span className="text-blue-600">KB</span>
        </h1>
        <p className="text-xl text-slate-400 max-w-xl mx-auto leading-relaxed font-semibold">
          Set the size you want. <br/>We handle the rest automatically.
        </p>
      </header>

      <main className="space-y-12">
        {images.length === 0 ? (
          <Dropzone onFilesSelected={handleFilesSelected} />
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {/* Control Bar */}
            <div className="sticky top-6 z-50 bg-white/80 backdrop-blur-2xl border border-white rounded-[40px] p-4 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] flex flex-col md:flex-row items-center justify-between gap-8 mb-20">
              <div className="flex items-center gap-10 pl-6">
                <div className="flex flex-col">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Desired Size</label>
                  
                  {/* Interesting Input UI */}
                  <div className="flex items-center bg-slate-50 border border-slate-100/50 rounded-[24px] p-1.5 min-w-[200px] shadow-inner">
                    <div className="flex-1 flex items-center justify-center pl-4 pr-2">
                      <input
                        type="number"
                        value={targetSize}
                        onChange={(e) => setTargetSize(Number(e.target.value))}
                        className="w-full bg-transparent border-none text-2xl font-black text-slate-800 text-center size-input"
                      />
                    </div>
                    
                    <div className="relative flex bg-white rounded-[18px] p-1 shadow-sm border border-slate-200/50 overflow-hidden">
                      {/* Sliding active background */}
                      <div 
                        className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-blue-600 rounded-xl unit-active-bg shadow-lg shadow-blue-500/40`}
                        style={{ 
                          left: unit === 'KB' ? '4px' : 'calc(50% + 0px)',
                          transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)' 
                        }}
                      />
                      
                      <button 
                        onClick={() => setUnit('KB')}
                        className={`relative z-10 px-5 py-2 text-xs font-black rounded-xl transition-colors duration-300 w-16 ${unit === 'KB' ? 'text-white' : 'text-slate-400'}`}
                      >
                        KB
                      </button>
                      <button 
                        onClick={() => setUnit('MB')}
                        className={`relative z-10 px-5 py-2 text-xs font-black rounded-xl transition-colors duration-300 w-16 ${unit === 'MB' ? 'text-white' : 'text-slate-400'}`}
                      >
                        MB
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="hidden lg:block h-14 w-px bg-slate-100" />
                
                <div className="hidden lg:flex flex-col">
                  <label className="text-[11px] font-black text-slate-300 uppercase tracking-[0.2em] mb-3">Algorithm</label>
                  <p className="text-sm font-bold text-slate-400">
                    {getRecommendation()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6 w-full md:w-auto pr-3">
                <button
                  onClick={clearAll}
                  className="flex items-center justify-center gap-2 px-6 py-4 text-slate-400 hover:text-slate-900 font-bold transition-all text-sm group"
                >
                  <RotateCcw size={18} className="group-hover:-rotate-45 transition-transform" />
                  Clear
                </button>
                <button
                  onClick={startCompression}
                  disabled={isProcessingAll}
                  className="flex-1 md:flex-none flex items-center justify-center gap-4 px-12 py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-[24px] font-black shadow-[0_12px_24px_-8px_rgba(37,99,235,0.4)] transition-all active:scale-95 disabled:opacity-50 text-sm tracking-wide"
                >
                  <Target className={isProcessingAll ? "animate-spin" : ""} size={20} />
                  {isProcessingAll ? 'Optimizing...' : 'Recalculate'}
                </button>
              </div>
            </div>

            <div className="space-y-12">
              <div className="flex items-center justify-between mb-8 px-4">
                <h2 className="text-3xl font-black text-slate-900 flex items-center gap-4 tracking-tight">
                  <LayoutGrid size={28} className="text-blue-500" />
                  Your Gallery
                </h2>
                {images.length > 1 && !hasUnprocessed && (
                  <button 
                    onClick={handleDownloadAll}
                    className="text-xs font-black text-blue-600 hover:text-blue-800 flex items-center gap-3 group tracking-widest uppercase"
                  >
                    Download all assets
                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 gap-12">
                {images.map((img) => (
                  <ResultCard 
                    key={img.id} 
                    image={img} 
                    onDownload={handleDownload} 
                  />
                ))}
              </div>
            </div>

            {images.length > 1 && !hasUnprocessed && (
               <div className="mt-24 flex justify-center pb-24">
                  <button
                    onClick={handleDownloadAll}
                    className="group flex items-center gap-5 px-16 py-7 bg-slate-900 text-white rounded-[32px] font-black text-xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] hover:bg-black transition-all active:scale-[0.98] tracking-tight"
                  >
                    <Download size={28} className="group-hover:translate-y-1 transition-transform" />
                    Download All Compressed Assets
                  </button>
               </div>
            )}
          </div>
        )}
      </main>

      <footer className="mt-32 pb-16 text-center">
        <p className="text-slate-300 text-sm font-bold tracking-tight">© {new Date().getFullYear()} ExactKB. Your images never leave your browser.</p>
        <div className="mt-8 flex justify-center gap-10">
          <a href="#" className="text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest text-[10px] font-black">Privacy</a>
          <a href="#" className="text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest text-[10px] font-black">Methodology</a>
          <a href="#" className="text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest text-[10px] font-black">Open Source</a>
        </div>
      </footer>
    </div>
  );
};

export default App;
