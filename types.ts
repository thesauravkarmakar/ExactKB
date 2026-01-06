
export interface ImageFile {
  id: string;
  file: File;
  originalSize: number;
  originalPreview: string;
  status: 'idle' | 'compressing' | 'completed' | 'error';
  progress?: number;
  result?: CompressionResult;
}

export interface CompressionResult {
  blob: Blob;
  previewUrl: string;
  finalSize: number;
  reductionPercentage: number;
  format: string;
  quality: number;
  explanation: string;
}

export type SizeUnit = 'KB' | 'MB';
