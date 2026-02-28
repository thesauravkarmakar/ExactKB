import { CompressionResult } from '../types';

// Shared canvas for memory efficiency
let sharedCanvas: HTMLCanvasElement | null = null;

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
   */
  if (isLossy) {
    let lowQ = 0.01;
    let highQ = 1.0;

    for (let i = 0; i < stepsPerPhase; i++) {
      const midQ = (lowQ + highQ) / 2;
      const blob = await getResizedBlob(originalImg, format, 1.0, midQ);

      if (blob.size <= targetSizeInBytes) {
        bestBlob = blob;
        bestQuality = midQ;
        bestScale = 1.0;
        lowQ = midQ;
      } else {
        highQ = midQ;
      }
      updateProgress();
    }
  }

  /**
   * STAGE 2: Optimize Scale
   */
  if (!bestBlob || bestBlob.size > targetSizeInBytes) {
    let lowS = 0.01;
    let highS = 1.0;
    const baseQuality = isLossy ? 0.75 : 1.0;

    for (let i = 0; i < stepsPerPhase; i++) {
      const midS = (lowS + highS) / 2;
      const blob = await getResizedBlob(originalImg, format, midS, baseQuality);

      if (blob.size <= targetSizeInBytes) {
        bestBlob = blob;
        bestScale = midS;
        bestQuality = baseQuality;
        lowS = midS;
      } else {
        highS = midS;
      }
      updateProgress();
    }
  }

  if (!bestBlob) {
    bestBlob = await getResizedBlob(originalImg, format, 0.05, 0.1);
  }

  if (onProgress) onProgress(100);
  return createResult(file, bestBlob, bestQuality, bestScale);
}

async function getResizedBlob(img: HTMLImageElement, format: string, scale: number, quality: number): Promise<Blob> {
  if (!sharedCanvas) {
    sharedCanvas = document.createElement('canvas');
  }

  const canvas = sharedCanvas;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context failed');

  canvas.width = Math.max(1, Math.floor(img.width * scale));
  canvas.height = Math.max(1, Math.floor(img.height * scale));

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear old data
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
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url); // Clean up memory
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    img.src = url;
  });
}
