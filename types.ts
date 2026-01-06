
export interface ImageFile {
  id: string;
  file: File;
  originalSize: number;
  originalPreview: string;
  status: 'idle' | 'compressing' | 'completed' | 'error';
  progress?: number;
  result?: CompressionResult;
  targetSize: number;
  unit: SizeUnit;
}

export interface CompressionResult {
  blob: Blob;
  previewUrl: string;
  finalSize: number;
  reductionPercentage: number;
  format: string;
  quality: number;
}

export type SizeUnit = 'KB' | 'MB';
