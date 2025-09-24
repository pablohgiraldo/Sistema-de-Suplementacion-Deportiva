import { useState, useRef, useCallback, useEffect } from 'react';
import useComponentMemoryOptimization from './useComponentMemoryOptimization';

/**
 * Hook para optimización de imágenes
 * Implementa lazy loading, preloading y cleanup automático
 */
const useOptimizedImage = (src, options = {}) => {
    const {
        width = 800,
        height = 600,
        quality = 80,
        format = 'webp',
        lazy = true,
        preload = false,
        fallback = '/placeholder-image.jpg'
    } = options;

    const memoryOptimization = useComponentMemoryOptimization('OptimizedImage');
    const [imageState, setImageState] = useState({
        src: null,
        loading: true,
        error: false,
        loaded: false
    });
    const [isInView, setIsInView] = useState(!lazy);
    const [isPreloaded, setIsPreloaded] = useState(false);
    const imgRef = useRef(null);
    const observerRef = useRef(null);

    // Función para optimizar URL de imagen
    const optimizeImageUrl = useCallback((url) => {
        if (!url) return fallback;

        // Si es una URL de Unsplash, optimizar
        if (url.includes('unsplash.com')) {
            const urlObj = new URL(url);
            urlObj.searchParams.set('w', width.toString());
            urlObj.searchParams.set('h', height.toString());
            urlObj.searchParams.set('q', quality.toString());
            urlObj.searchParams.set('fm', format);
            return urlObj.toString();
        }

        // Si es una URL local, mantener como está
        if (url.startsWith('/') || url.startsWith('./')) {
            return url;
        }

        // Para otras URLs, intentar optimizar si es posible
        return url;
    }, [width, height, quality, format, fallback]);

    // Función para cargar imagen
    const loadImage = useCallback((imageSrc) => {
        if (!imageSrc) return;

        setImageState(prev => ({ ...prev, loading: true, error: false }));

        const img = new Image();
        img.onload = () => {
            setImageState(prev => ({
                ...prev,
                src: imageSrc,
                loading: false,
                error: false,
                loaded: true
            }));
        };
        img.onerror = () => {
            setImageState(prev => ({
                ...prev,
                src: fallback,
                loading: false,
                error: true,
                loaded: false
            }));
        };
        img.src = imageSrc;
    }, [fallback]);

    // Función para preload imagen
    const preloadImage = useCallback((imageSrc) => {
        if (!imageSrc || isPreloaded) return;

        const img = new Image();
        img.onload = () => {
            setIsPreloaded(true);
        };
        img.onerror = () => {
            console.warn('Failed to preload image:', imageSrc);
        };
        img.src = imageSrc;
    }, [isPreloaded]);

    // Función para crear intersection observer
    const createIntersectionObserver = useCallback(() => {
        if (!lazy || !imgRef.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsInView(true);
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                rootMargin: '50px',
                threshold: 0.1
            }
        );

        observer.observe(imgRef.current);
        observerRef.current = observer;

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [lazy]);

    // Función para limpiar imagen
    const cleanupImage = useCallback(() => {
        if (imgRef.current) {
            imgRef.current.src = '';
        }
        if (observerRef.current) {
            observerRef.current.disconnect();
        }
    }, []);

    // Efecto para cargar imagen cuando está en view
    useEffect(() => {
        if (isInView && src) {
            const optimizedSrc = optimizeImageUrl(src);
            loadImage(optimizedSrc);
        }
    }, [isInView, src, optimizeImageUrl, loadImage]);

    // Efecto para preload si está habilitado
    useEffect(() => {
        if (preload && src && !isPreloaded) {
            const optimizedSrc = optimizeImageUrl(src);
            preloadImage(optimizedSrc);
        }
    }, [preload, src, isPreloaded, optimizeImageUrl, preloadImage]);

    // Efecto para crear intersection observer
    useEffect(() => {
        if (lazy) {
            const cleanup = createIntersectionObserver();
            return cleanup;
        }
    }, [lazy, createIntersectionObserver]);

    // Cleanup automático
    useEffect(() => {
        return () => {
            cleanupImage();
            memoryOptimization.cleanup();
        };
    }, [cleanupImage, memoryOptimization]);

    // Función para recargar imagen
    const reloadImage = useCallback(() => {
        if (src) {
            const optimizedSrc = optimizeImageUrl(src);
            loadImage(optimizedSrc);
        }
    }, [src, optimizeImageUrl, loadImage]);

    // Función para cambiar imagen
    const changeImage = useCallback((newSrc) => {
        if (newSrc !== src) {
            setImageState(prev => ({ ...prev, loading: true, error: false }));
            const optimizedSrc = optimizeImageUrl(newSrc);
            loadImage(optimizedSrc);
        }
    }, [src, optimizeImageUrl, loadImage]);

    // Función para obtener estadísticas
    const getImageStats = useCallback(() => {
        return {
            src: imageState.src,
            loading: imageState.loading,
            error: imageState.error,
            loaded: imageState.loaded,
            isInView,
            isPreloaded,
            optimized: src !== imageState.src
        };
    }, [imageState, isInView, isPreloaded, src]);

    return {
        // Referencias
        imgRef,

        // Estados
        ...imageState,
        isInView,
        isPreloaded,

        // Acciones
        reloadImage,
        changeImage,
        getImageStats,

        // Configuración
        width,
        height,
        quality,
        format,
        lazy,
        preload,
        fallback
    };
};

export default useOptimizedImage;
