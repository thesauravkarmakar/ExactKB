
import React from 'react';
import { Download, CheckCircle2, Loader2, ArrowRight, Clock } from 'lucide-react';
import { ImageFile } from '../types';
import { formatBytes as formatBytesUtil } from '../services/compressionService';

interface ResultCardProps {
  image: ImageFile;
  onDownload: (image: ImageFile) => void;
}

const ResultCard: React.FC<ResultCardProps> = ({ image, onDownload }) => {
  const isCompleted = image.status === 'completed' && image.result;
  const isCompressing = image.status === 'compressing';
  const isIdle = image.status === 'idle';

  // Helper to format the final size string requested by the user
  const renderFinalSize = () => {
    if (!image.result) return '—';
    
    const bytes = image.result.finalSize;
    const mb = bytes / (1024 * 1024);
    const kb = bytes / 1024;
    
    // If it's roughly in the MB range, show ~X.X MB (Actual)
    if (mb >= 0.9) {
      return (
        <div className="flex flex-col md:flex-row md:items-baseline gap-2">
          <span className="text-4xl font-black text-slate-900 tracking-tight">
            ~{mb.toFixed(1)} MB
          </span>
          <span className="text-lg font-bold text-slate-400 tracking-tight">
            ({formatBytesUtil(bytes)})
          </span>
        </div>
      );
    }
    
    // Otherwise show exact bytes formatted
    return (
      <span className="text-4xl font-black text-slate-900 tracking-tight">
        {formatBytesUtil(bytes)}
      </span>
    );
  };

  return (
    <div className={`bg-white border rounded-[32px] overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 ${isIdle ? 'border-slate-100 opacity-90' : 'border-slate-200'}`}>
      <div className="flex flex-col md:flex-row h-full">
        {/* Left: Original Preview */}
        <div className="relative w-full md:w-[320px] bg-slate-100 border-r border-slate-100">
          <img 
            src={image.originalPreview} 
            alt="Original" 
            className="w-full h-full object-cover min-h-[260px]"
          />
          <div className="absolute top-4 left-4 px-3 py-1.5 bg-black/60 backdrop-blur-md text-white text-[11px] font-bold rounded-lg uppercase tracking-wider">
            Original • {formatBytesUtil(image.originalSize)}
          </div>
        </div>

        {/* Right: Results & Actions */}
        <div className="flex-1 p-8 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="text-xl font-bold text-slate-900 truncate max-w-[300px]" title={image.file.name}>
                  {image.file.name}
                </h4>
                <p className="text-sm font-semibold text-slate-400 uppercase tracking-wide">
                  {image.file.type.split('/')[1].toUpperCase()} File
                </p>
              </div>
              {isCompleted && image.result && image.result.reductionPercentage > 0 && (
                <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full text-xs font-bold border border-emerald-100">
                  <CheckCircle2 size={14} />
                  <span>Reduced by {image.result.reductionPercentage.toFixed(0)}%</span>
                </div>
              )}
              {isIdle && (
                <div className="flex items-center gap-1.5 text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full text-xs font-bold border border-slate-100">
                  <Clock size={14} />
                  <span>Ready</span>
                </div>
              )}
            </div>

            <div className="mt-8 flex items-center gap-6 md:gap-10">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1.5">Initial</span>
                <span className="text-2xl font-bold text-slate-400">{formatBytesUtil(image.originalSize)}</span>
              </div>
              
              <div className="text-slate-200 mt-4">
                <ArrowRight size={24} strokeWidth={2.5} />
              </div>

              <div className="flex flex-col">
                <span className={`text-[11px] font-bold uppercase tracking-[0.2em] mb-1.5 ${isIdle ? 'text-slate-300' : 'text-blue-600'}`}>Compressed</span>
                <div className="flex items-center gap-2">
                  {isCompressing ? (
                    <div className="flex items-center gap-3 text-slate-400">
                      <Loader2 size={24} className="animate-spin" />
                      <span className="text-2xl font-bold">Optimizing...</span>
                    </div>
                  ) : isIdle ? (
                    <span className="text-4xl font-black text-slate-200 tracking-tight">Pending</span>
                  ) : (
                    renderFinalSize()
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-6 border-t border-slate-50 pt-8">
            <button
              onClick={() => onDownload(image)}
              disabled={!isCompleted}
              className={`w-full sm:w-auto min-w-[200px] flex items-center justify-center gap-3 px-10 py-4 rounded-[20px] font-black text-sm transition-all duration-300 active:scale-95 disabled:opacity-50 tracking-wide ${
                isCompleted 
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20' 
                : 'bg-slate-100 text-slate-300 cursor-not-allowed'
              }`}
            >
              <Download size={18} />
              <span>Download</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultCard;
