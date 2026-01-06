
import { CompressionResult } from '../types';

/**
 * Helper to create an artificial delay for visual feedback.
 */
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Intelligent compression service that attempts to reach a target size.
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
  
  const totalSteps = isLossy ? 12 + 10 : 10;
  let currentStep = 0;

  const updateProgress = () => {
    currentStep++;
    if (onProgress) {
      onProgress(Math.min(95, (currentStep / totalSteps) * 100));
    }
  };

  // Step 1: Optimize quality for lossy formats
  if (isLossy) {
    let lowQ = 0.01;
    let highQ = 1.0;
    for (let i = 0; i < 12; i++) {
      const midQ = (lowQ + highQ) / 2;
      const blob = await getResizedBlob(originalImg, format, 1.0, midQ);
      
      // Artificial delay to make progress visible
      await sleep(30);

      if (blob.size <= targetSizeInBytes) {
        bestBlob = blob;
        bestQuality = midQ;
        lowQ = midQ;
      } else {
        highQ = midQ;
      }
      updateProgress();
    }
  }

  // Step 2: Optimize scale if quality adjustment wasn't enough or format is lossless
  if (!bestBlob || bestBlob.size > targetSizeInBytes) {
    let lowS = 0.05;
    let highS = 1.0;
    const qualityToUse = isLossy ? 0.7 : 1.0;

    for (let i = 0; i < 10; i++) {
      const midS = (lowS + highS) / 2;
      const blob = await getResizedBlob(originalImg, format, midS, qualityToUse);
      
      // Artificial delay to make progress visible
      await sleep(30);

      if (blob.size <= targetSizeInBytes) {
        bestBlob = blob;
        bestScale = midS;
        lowS = midS;
      } else {
        highS = midS;
      }
      updateProgress();
    }
  }

  // Fallback if target is extremely small
  if (!bestBlob) {
    bestBlob = await getResizedBlob(originalImg, format, 0.05, 0.01);
  }

  if (onProgress) onProgress(100);
  return createResult(file, bestBlob, bestQuality, bestScale);
}

async function getResizedBlob(img: HTMLImageElement, format: string, scale: number, quality: number): Promise<Blob> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context failed');

  canvas.width = Math.max(1, img.width * scale);
  canvas.height = Math.max(1, img.height * scale);
  
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
  
  let explanation = '';
  if (scale < 0.99) {
    explanation = `Dimensions scaled to ${Math.round(scale * 100)}% to meet target.`;
  } else if (originalFile.type === 'image/png') {
    explanation = `Optimized ${extension} container.`;
  } else {
    explanation = `Optimized to ${Math.round(quality * 100)}% quality.`;
  }

  return {
    blob: resultBlob,
    previewUrl: URL.createObjectURL(resultBlob),
    finalSize: finalSize,
    reductionPercentage: Math.max(0, reduction),
    format: extension,
    quality: Math.round(quality * 100),
    explanation: explanation
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
