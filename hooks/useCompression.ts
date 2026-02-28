
import { useState, useCallback, useRef } from 'react';
import { ImageFile, SizeUnit } from '../types';
import { compressImage } from '../services/compressionService';

export const useCompression = () => {
    const [images, setImages] = useState<ImageFile[]>([]);
    const [globalTargetSize, setGlobalTargetSize] = useState<number>(500);
    const [globalUnit, setGlobalUnit] = useState<SizeUnit>('KB');
    const [isProcessingAll, setIsProcessingAll] = useState(false);
    const galleryRef = useRef<HTMLDivElement>(null);

    const handleFilesSelected = useCallback((files: FileList) => {
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
    }, [globalTargetSize, globalUnit]);

    const updateGlobalTarget = useCallback((value: number) => {
        setGlobalTargetSize(value);
        setImages(prev => prev.map(img =>
            ({ ...img, targetSize: value, status: 'idle' as const })
        ));
    }, []);

    const updateGlobalUnit = useCallback((u: SizeUnit) => {
        setGlobalUnit(u);
        setImages(prev => prev.map(img =>
            ({ ...img, unit: u, status: 'idle' as const })
        ));
    }, []);

    const updateImageTarget = useCallback((id: string, size: number, unit?: SizeUnit) => {
        setImages(prev => prev.map(img =>
            img.id === id ? { ...img, targetSize: size, status: 'idle' as const, ...(unit ? { unit } : {}) } : img
        ));
    }, []);

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

    const handleDownload = useCallback((image: ImageFile) => {
        if (!image.result) return;
        const link = document.createElement('a');
        link.href = image.result.previewUrl;
        const ext = image.file.name.split('.').pop();
        const name = image.file.name.replace(/\.[^/.]+$/, "") + `_exact.${ext}`;
        link.download = name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, []);

    const handleDownloadAll = useCallback(() => {
        images.forEach(img => {
            if (img.status === 'completed') handleDownload(img);
        });
    }, [images, handleDownload]);

    const clearAll = useCallback(() => {
        setImages([]);
    }, []);

    const hasUnprocessed = images.some(img => img.status === 'idle');

    return {
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
    };
};
