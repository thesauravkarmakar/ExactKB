import { CompressionResult } from '../types';

const TOLERANCE = 2 * 1024; // 2 KB — acceptable gap between output and target

// Shared canvas for memory efficiency
let sharedCanvas: HTMLCanvasElement | null = null;

/**
 * Intelligent compression service that attempts to reach a target size within ±2 KB.
 *
 * Algorithm:
 *   Stage 1 – Binary search over quality at full scale (lossy only).
 *             Finds the highest quality whose output is ≤ target.
 *   Stage 2 – Binary search over scale (fallback when Stage 1 can't reach target
 *             even at minimum quality, i.e. target is very small).
 *   Stage 3 – Fine-tune upscale to close the remaining gap.
 *             JPEG/WebP quality is quantized into ~100 discrete steps; adjacent steps
 *             can differ by more than 2 KB with no value in between. We bridge that
 *             gap by slightly enlarging the canvas (≤ 5%) at the converged quality,
 *             which precisely adds the missing bytes without a perceptible quality drop.
 */
export async function compressImage(
  file: File,
  targetSizeInBytes: number,
  onProgress?: (progress: number) => void
): Promise<CompressionResult> {

  // Early exit: file is already at or under target — return as-is, no recompression.
  if (file.size <= targetSizeInBytes) {
    if (onProgress) onProgress(100);
    return createResult(file, file, 1.0, false);
  }

  const originalImg = await loadImage(file);
  const format = file.type;
  const isLossy = format === 'image/jpeg' || format === 'image/webp';

  let bestBlob: Blob | null = null;
  let bestScale = 1.0;
  let bestQuality = 1.0;

  const stepsPerPhase = 16;
  const fineSteps = 8;
  // Expected path: Stage 1 (16) + Stage 3 (8). Stage 2 replaces Stage 1 for tiny targets.
  const totalSteps = stepsPerPhase + fineSteps;
  let currentStep = 0;

  const updateProgress = () => {
    currentStep++;
    if (onProgress) {
      onProgress(Math.min(99, (currentStep / totalSteps) * 100));
    }
  };

  // ─── STAGE 1: Quality binary search (lossy only, at full scale) ─────────────
  // Finds the highest quality setting whose output fits within the target.
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

  // ─── STAGE 2: Scale binary search (fallback) ─────────────────────────────────
  // Runs only when Stage 1 found no solution — meaning the target is so small that
  // even minimum quality at full resolution is too large. Reduces canvas size until
  // the output fits.
  if (!bestBlob || bestBlob.size > targetSizeInBytes) {
    let lowS = 0.01;
    let highS = 1.0;
    const fallbackQuality = isLossy ? 0.75 : 1.0;

    for (let i = 0; i < stepsPerPhase; i++) {
      const midS = (lowS + highS) / 2;
      const blob = await getResizedBlob(originalImg, format, midS, fallbackQuality);

      if (blob.size <= targetSizeInBytes) {
        bestBlob = blob;
        bestScale = midS;
        bestQuality = fallbackQuality;
        lowS = midS;
      } else {
        highS = midS;
      }
      updateProgress();
    }
  }

  // ─── STAGE 3: Fine-tune upscale to close the gap ─────────────────────────────
  // After Stage 1 converges, there is often a gap between bestBlob.size and target
  // because JPEG quality maps to discrete quantization tables (~100 levels). Adjacent
  // levels can differ by 5–15 KB with no intermediate value achievable via quality
  // alone. We close this gap by binary-searching a slight upscale (≤ 5%) at the
  // already-converged quality: more pixels → more bytes, filling the budget precisely.
  // A ≤ 5% resolution change is imperceptible at normal viewing distances.
  if (bestBlob && bestBlob.size < targetSizeInBytes - TOLERANCE) {
    const gapFraction = (targetSizeInBytes - bestBlob.size) / bestBlob.size;
    // File size scales roughly as scale² (proportional to pixel count).
    // Compute the scale multiplier that would ideally fill the gap exactly.
    const idealScale = bestScale * Math.sqrt(1 + gapFraction);
    // Cap at 5% upscale; the 1.1× buffer keeps the ideal point well inside the range.
    const scaleUpperBound = Math.min(bestScale * 1.05, idealScale * 1.1);

    if (scaleUpperBound > bestScale) {
      let lowS = bestScale;
      let highS = scaleUpperBound;

      for (let i = 0; i < fineSteps; i++) {
        const midS = (lowS + highS) / 2;
        const blob = await getResizedBlob(originalImg, format, midS, bestQuality);

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
  }

  // Absolute fallback: target is genuinely unreachable (e.g. 20 KB for a 4K image).
  if (!bestBlob) {
    bestBlob = await getResizedBlob(originalImg, format, 0.05, 0.1);
  }

  // If the gap is still > 2 KB after all stages, the target is beyond what encoding
  // allows. Signal this so the UI can inform the user.
  const isImpossible = bestBlob.size < targetSizeInBytes - TOLERANCE;

  if (onProgress) onProgress(100);
  return createResult(file, bestBlob, bestQuality, isImpossible);
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
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('toBlob failed'));
    }, format, quality);
  });
}

function createResult(
  originalFile: File,
  resultBlob: Blob,
  quality: number,
  isImpossible: boolean
): CompressionResult {
  const finalSize = resultBlob.size;
  const reduction = ((originalFile.size - finalSize) / originalFile.size) * 100;
  const extension = originalFile.name.split('.').pop()?.toUpperCase() || 'IMG';

  return {
    blob: resultBlob,
    previewUrl: URL.createObjectURL(resultBlob),
    finalSize,
    reductionPercentage: Math.max(0, reduction),
    format: extension,
    quality: Math.round(quality * 100),
    isImpossible,
  };
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    img.src = url;
  });
}
