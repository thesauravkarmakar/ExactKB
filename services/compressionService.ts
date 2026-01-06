
import { CompressionResult } from '../types';

/**
 * Helper to create an artificial delay for visual feedback.
 */
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Intelligent compression service that attempts to reach a target size.
 * Uses a high-precision binary search (16 iterations) to hit the "Exact KB" target.
 */
export async function compressImage(
  file: File,
  targetSizeInBytes: number,
  onProgress?: (progress: number) => void
): Promise<CompressionResult> {
  const originalImg = await loadImage(file);
  const format = file.type;
  const isLossy = format === 'image/jpeg' || format === 'image/webp';
  
  let bestBlob: Blob | null = null;
  let bestScale = 1.0;
  let bestQuality = 1.0;
  
  // Increase iterations for better precision (2^16 = 65,536 steps)
  const stepsPerPhase = 16;
  const totalSteps = isLossy ? stepsPerPhase * 2 : stepsPerPhase;
  let currentStep = 0;

  const updateProgress = () => {
    currentStep++;
    if (onProgress) {
      onProgress(Math.min(99, (currentStep / totalSteps) * 100));
    }
  };

  /**
   * STAGE 1: Optimize Quality (Lossy only)
   * We try to hit the target at 100% scale by varying quality.
   */
  if (isLossy) {
    let lowQ = 0.01;
    let highQ = 1.0;
    
    for (let i = 0; i < stepsPerPhase; i++) {
      const midQ = (lowQ + highQ) / 2;
      const blob = await getResizedBlob(originalImg, format, 1.0, midQ);
      
      // Artificial delay to make progress visible
      await sleep(20);

      if (blob.size <= targetSizeInBytes) {
        // This is a candidate. We want the largest blob <= target.
        bestBlob = blob;
        bestQuality = midQ;
        bestScale = 1.0;
        lowQ = midQ; // Try higher quality
      } else {
        highQ = midQ; // Quality too high, file too big
      }
      updateProgress();
    }
  }

  /**
   * STAGE 2: Optimize Scale
   * If Stage 1 didn't find a result (or for lossless), OR if the smallest 
   * quality at scale 1.0 is still too big, we reduce scale.
   */
  if (!bestBlob || bestBlob.size > targetSizeInBytes) {
    let lowS = 0.01; // Allow very small thumbnails if necessary
    let highS = 1.0;
    
    // For lossy, we use a slightly lower base quality to give scaling more "room" to work
    const baseQuality = isLossy ? 0.75 : 1.0;

    for (let i = 0; i < stepsPerPhase; i++) {
      const midS = (lowS + highS) / 2;
      const blob = await getResizedBlob(originalImg, format, midS, baseQuality);
      
      await sleep(20);

      if (blob.size <= targetSizeInBytes) {
        bestBlob = blob;
        bestScale = midS;
        bestQuality = baseQuality;
        lowS = midS; // Try larger scale
      } else {
        highS = midS; // Scale too large, file too big
      }
      updateProgress();
    }
  }

  // Absolute fallback: if even 1% scale is too big, just use the last thing we got
  if (!bestBlob) {
    bestBlob = await getResizedBlob(originalImg, format, 0.05, 0.1);
  }

  if (onProgress) onProgress(100);
  return createResult(file, bestBlob, bestQuality, bestScale);
}

async function getResizedBlob(img: HTMLImageElement, format: string, scale: number, quality: number): Promise<Blob> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context failed');

  // Ensure dimensions are at least 1 pixel
  canvas.width = Math.max(1, Math.floor(img.width * scale));
  canvas.height = Math.max(1, Math.floor(img.height * scale));
  
  // Using imageSmoothingQuality for better results during downscaling
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('toBlob failed'));
    }, format, quality);
  });
}

function createResult(originalFile: File, resultBlob: Blob, quality: number, scale: number): CompressionResult {
  const finalSize = resultBlob.size;
  const reduction = ((originalFile.size - finalSize) / originalFile.size) * 100;
  const extension = originalFile.name.split('.').pop()?.toUpperCase() || 'IMG';
  
  return {
    blob: resultBlob,
    previewUrl: URL.createObjectURL(resultBlob),
    finalSize: finalSize,
    reductionPercentage: Math.max(0, reduction),
    format: extension,
    quality: Math.round(quality * 100)
  };
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function formatBytes(bytes: number, decimals = 1) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
