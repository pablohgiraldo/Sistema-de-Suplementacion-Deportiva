import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import useComponentMemoryOptimization from './useComponentMemoryOptimization';

/**
 * Hook para listas virtualizadas
 * Optimiza el rendimiento de listas grandes renderizando solo los elementos visibles
 */
const useVirtualizedList = (items, options = {}) => {
    const {
        itemHeight = 50,
        containerHeight = 400,
        overscan = 5,
        threshold = 100
    } = options;

    const memoryOptimization = useComponentMemoryOptimization('VirtualizedList');
    const containerRef = useRef(null);
    const [scrollTop, setScrollTop] = useState(0);
    const [containerSize, setContainerSize] = useState({ width: 0, height: containerHeight });

    // Calcular elementos visibles
    const visibleItems = useMemo(() => {
        const startIndex = Math.floor(scrollTop / itemHeight);
        const endIndex = Math.min(
            startIndex + Math.ceil(containerSize.height / itemHeight) + overscan,
            items.length - 1
        );

        return {
            startIndex: Math.max(0, startIndex - overscan),
            endIndex: Math.min(items.length - 1, endIndex),
            totalHeight: items.length * itemHeight
        };
    }, [scrollTop, itemHeight, containerSize.height, items.length, overscan]);

    // Elementos a renderizar
    const visibleItemsData = useMemo(() => {
        const { startIndex, endIndex } = visibleItems;
        return items.slice(startIndex, endIndex + 1).map((item, index) => ({
            ...item,
            index: startIndex + index,
            top: (startIndex + index) * itemHeight
        }));
    }, [items, visibleItems, itemHeight]);

    // Función para manejar scroll
    const handleScroll = useCallback((event) => {
        const { scrollTop: newScrollTop } = event.target;
        setScrollTop(newScrollTop);
    }, []);

    // Función para manejar resize
    const handleResize = useCallback(() => {
        if (containerRef.current) {
            const { width, height } = containerRef.current.getBoundingClientRect();
            setContainerSize({ width, height });
        }
    }, []);

    // Función para scroll a elemento
    const scrollToItem = useCallback((index) => {
        if (containerRef.current) {
            const targetScrollTop = index * itemHeight;
            containerRef.current.scrollTop = targetScrollTop;
        }
    }, [itemHeight]);

    // Función para scroll a top
    const scrollToTop = useCallback(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = 0;
        }
    }, []);

    // Función para scroll a bottom
    const scrollToBottom = useCallback(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = visibleItems.totalHeight;
        }
    }, [visibleItems.totalHeight]);

    // Función para obtener elemento en viewport
    const getItemInViewport = useCallback(() => {
        const { startIndex, endIndex } = visibleItems;
        const centerIndex = Math.floor((startIndex + endIndex) / 2);
        return items[centerIndex];
    }, [visibleItems, items]);

    // Función para obtener índice del elemento en viewport
    const getItemIndexInViewport = useCallback(() => {
        const { startIndex, endIndex } = visibleItems;
        return Math.floor((startIndex + endIndex) / 2);
    }, [visibleItems]);

    // Función para obtener elementos visibles
    const getVisibleItems = useCallback(() => {
        return visibleItemsData;
    }, [visibleItemsData]);

    // Función para obtener estadísticas
    const getStats = useCallback(() => {
        return {
            totalItems: items.length,
            visibleItems: visibleItemsData.length,
            startIndex: visibleItems.startIndex,
            endIndex: visibleItems.endIndex,
            scrollTop,
            containerHeight: containerSize.height,
            itemHeight,
            overscan
        };
    }, [items.length, visibleItemsData.length, visibleItems, scrollTop, containerSize.height, itemHeight, overscan]);

    // Setup de event listeners
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Scroll listener
        const scrollListener = memoryOptimization.createEventListener(
            container,
            'scroll',
            handleScroll,
            { passive: true }
        );

        // Resize observer
        const resizeObserver = new ResizeObserver(handleResize);
        resizeObserver.observe(container);

        // Cleanup
        return () => {
            scrollListener();
            resizeObserver.disconnect();
        };
    }, [handleScroll, handleResize, memoryOptimization]);

    // Cleanup automático
    useEffect(() => {
        return memoryOptimization.cleanup;
    }, [memoryOptimization]);

    return {
        // Referencias
        containerRef,

        // Datos
        visibleItems: visibleItemsData,
        totalHeight: visibleItems.totalHeight,

        // Estados
        scrollTop,
        containerSize,

        // Acciones
        scrollToItem,
        scrollToTop,
        scrollToBottom,
        getItemInViewport,
        getItemIndexInViewport,
        getVisibleItems,
        getStats,

        // Configuración
        itemHeight,
        overscan
    };
};

export default useVirtualizedList;
