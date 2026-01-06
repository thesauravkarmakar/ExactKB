
import React, { useState, useCallback, useRef } from 'react';
import { Target, RotateCcw, Download, Sparkles, ChevronRight, LayoutGrid, Lock } from 'lucide-react';
import { ImageFile, SizeUnit } from './types';
import Dropzone from './components/Dropzone';
import ResultCard from './components/ResultCard';
import { compressImage } from './services/compressionService';

const App: React.FC = () => {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [globalTargetSize, setGlobalTargetSize] = useState<number>(500);
  const [globalUnit, setGlobalUnit] = useState<SizeUnit>('KB');
  const [isProcessingAll, setIsProcessingAll] = useState(false);
  const galleryRef = useRef<HTMLDivElement>(null);

  const handleFilesSelected = (files: FileList) => {
    const newImages: ImageFile[] = Array.from(files).map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      originalSize: file.size,
      originalPreview: URL.createObjectURL(file),
      status: 'idle',
      progress: 0,
      targetSize: globalTargetSize,
      unit: globalUnit,
    }));
    setImages((prev) => [...prev, ...newImages]);
  };

  const updateGlobalTarget = (value: number) => {
    setGlobalTargetSize(value);
    setImages(prev => prev.map(img => 
      ({ ...img, targetSize: value, status: 'idle' as const })
    ));
  };

  const updateGlobalUnit = (u: SizeUnit) => {
    setGlobalUnit(u);
    setImages(prev => prev.map(img => 
      ({ ...img, unit: u, status: 'idle' as const })
    ));
  };

  const updateImageTarget = (id: string, size: number, unit?: SizeUnit) => {
    setImages(prev => prev.map(img => 
      img.id === id ? { ...img, targetSize: size, status: 'idle' as const, ...(unit ? { unit } : {}) } : img
    ));
  };

  const recompressImageById = useCallback(async (id: string) => {
    const img = images.find(i => i.id === id);
    if (!img) return;

    setImages(prev => prev.map(p => p.id === id ? { ...p, status: 'compressing' as const, progress: 0 } : p));
    
    const multiplier = img.unit === 'MB' ? 1024 * 1024 : 1024;
    const targetBytes = img.targetSize * multiplier;

    try {
      const result = await compressImage(img.file, targetBytes, (p) => {
        setImages(prev => prev.map(item => item.id === id ? { ...item, progress: p } : item));
      });
      setImages(prev => prev.map(p => p.id === id ? { ...p, status: 'completed' as const, result, progress: 100 } : p));
    } catch (error) {
      console.error('Compression error:', error);
      setImages(prev => prev.map(p => p.id === id ? { ...p, status: 'error' as const } : p));
    }
  }, [images]);

  const startCompression = useCallback(async () => {
    if (images.length === 0) return;
    setIsProcessingAll(true);

    setTimeout(() => {
      galleryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);

    const updatedImages = await Promise.all(
      images.map(async (img) => {
        if (img.status !== 'idle') return img;

        setImages(prev => prev.map(p => p.id === img.id ? { ...p, status: 'compressing' as const, progress: 0 } : p));
        
        const multiplier = img.unit === 'MB' ? 1024 * 1024 : 1024;
        const targetBytes = img.targetSize * multiplier;

        try {
          const result = await compressImage(img.file, targetBytes, (p) => {
            setImages(prev => prev.map(item => item.id === img.id ? { ...item, progress: p } : item));
          });
          return { ...img, status: 'completed' as const, result, progress: 100 };
        } catch (error) {
          console.error('Compression error:', error);
          return { ...img, status: 'error' as const };
        }
      })
    );

    setImages(updatedImages);
    setIsProcessingAll(false);
  }, [images]);

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
    <div className="max-w-5xl mx-auto px-4 py-12 md:py-24 animate-in fade-in duration-700 min-h-screen flex flex-col">
      <header className="text-center mb-16">
        <h1 className="text-6xl md:text-7xl font-black text-slate-900 tracking-tight mb-6">
          Exact<span className="text-blue-600">KB</span>
        </h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed font-medium">
          Set the size you want. We handle the rest automatically.
        </p>
      </header>

      <main className="space-y-12 flex-grow">
        {images.length === 0 ? (
          <Dropzone onFilesSelected={handleFilesSelected} />
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="sticky top-6 z-50 bg-white/90 backdrop-blur-xl border border-slate-200 rounded-[32px] p-4 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 mb-16">
              <div className="flex items-center gap-8 pl-4">
                <div className="flex flex-col">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Global Target (Apply to all)</label>
                  <div className="flex items-center bg-slate-100 rounded-2xl p-1.5 pr-2 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                    <input
                      type="number"
                      value={globalTargetSize}
                      onChange={(e) => updateGlobalTarget(Number(e.target.value))}
                      className="w-20 bg-transparent border-none focus:outline-none text-center font-bold text-slate-900 text-xl py-1"
                    />
                    <div className="flex bg-white rounded-xl p-1 shadow-sm border border-slate-200/50">
                      <button 
                        onClick={() => updateGlobalUnit('KB')}
                        className={`px-4 py-1 text-xs font-black rounded-lg transition-all ${globalUnit === 'KB' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        KB
                      </button>
                      <button 
                        onClick={() => updateGlobalUnit('MB')}
                        className={`px-4 py-1 text-xs font-black rounded-lg transition-all ${globalUnit === 'MB' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        MB
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 w-full md:w-auto pr-2">
                <button
                  onClick={clearAll}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-4 text-slate-500 hover:text-slate-900 font-bold transition-colors text-sm"
                >
                  <RotateCcw size={18} />
                  Clear
                </button>
                <button
                  onClick={startCompression}
                  disabled={isProcessingAll || !hasUnprocessed}
                  className={`flex-1 md:flex-none flex items-center justify-center gap-3 px-10 py-4 text-white rounded-[20px] font-black shadow-xl transition-all active:scale-95 disabled:opacity-50 text-sm tracking-wide ${hasUnprocessed ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/30' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30'}`}
                >
                  {isProcessingAll ? (
                    <Target className="animate-spin" size={20} />
                  ) : (
                    <Target size={20} />
                  )}
                  {isProcessingAll ? 'Processing...' : hasUnprocessed ? 'Start All' : 'All Optimized'}
                </button>
              </div>
            </div>

            <div className="space-y-8" ref={galleryRef}>
              <div className="flex items-center justify-between mb-4 px-4 scroll-mt-28">
                <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                  <LayoutGrid size={24} className="text-blue-500" />
                  Your Gallery
                </h2>
                {images.length > 1 && !hasUnprocessed && (
                  <button 
                    onClick={handleDownloadAll}
                    className="text-sm font-black text-blue-600 hover:text-blue-700 flex items-center gap-2 group tracking-wide"
                  >
                    DOWNLOAD ALL ASSETS
                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 gap-8">
                {images.map((img) => (
                  <ResultCard 
                    key={img.id} 
                    image={img} 
                    onDownload={handleDownload}
                    onUpdateTarget={(size, unit) => updateImageTarget(img.id, size, unit)}
                    onRecompress={() => recompressImageById(img.id)}
                  />
                ))}
              </div>
            </div>

            {images.length > 1 && !hasUnprocessed && (
               <div className="mt-20 flex justify-center pb-20">
                  <button
                    onClick={handleDownloadAll}
                    className="flex items-center gap-4 px-14 py-6 bg-slate-900 text-white rounded-[24px] font-black text-xl shadow-2xl hover:bg-black transition-all active:scale-[0.98] tracking-tight"
                  >
                    <Download size={28} />
                    Download All Optimized Images
                  </button>
               </div>
            )}
          </div>
        )}
      </main>

      <footer className="mt-20 pb-12 pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6 px-4">
        <div className="flex items-center">
          <p className="text-slate-400 text-sm">
            Made by <a href="https://github.com/thesauravkarmakar" target="_blank" rel="noopener noreferrer" className="font-bold text-slate-600 hover:text-blue-600 transition-colors">Saurav Karmakar</a>
          </p>
        </div>
        
        <div className="flex items-center gap-8">
          <a href="#" className="text-slate-400 hover:text-slate-900 transition-colors text-sm font-medium">Blog</a>
          <a href="#" className="text-slate-400 hover:text-slate-900 transition-colors text-sm font-medium">Help</a>
          <a href="#" className="text-slate-400 hover:text-slate-900 transition-colors text-sm font-medium">Compliance</a>
          <a href="#" className="text-slate-400 hover:text-slate-900 transition-colors text-sm font-medium">Terms</a>
        </div>
      </footer>
    </div>
  );
};

export default App;
