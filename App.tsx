
import React from 'react';
import { Target, RotateCcw, Download, ChevronRight, LayoutGrid } from 'lucide-react';
import { Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import Dropzone from './components/Dropzone';
import ResultCard from './components/ResultCard';
import Layout from './components/Layout';
import Compliance from './components/legal/Compliance';
import Terms from './components/legal/Terms';
import { useCompression } from './hooks/useCompression';

const Home: React.FC = () => {
  const {
    images,
    globalTargetSize,
    globalUnit,
    isProcessingAll,
    galleryRef,
    handleFilesSelected,
    updateGlobalTarget,
    updateGlobalUnit,
    updateImageTarget,
    recompressImageById,
    startCompression,
    handleDownload,
    handleDownloadAll,
    clearAll,
    hasUnprocessed
  } = useCompression();

  return (
    <div className="space-y-12">
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
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/compliance" element={<Compliance />} />
        <Route path="/terms" element={<Terms />} />
      </Routes>
      <Analytics />
      <SpeedInsights />
    </Layout>
  );
};

export default App;
