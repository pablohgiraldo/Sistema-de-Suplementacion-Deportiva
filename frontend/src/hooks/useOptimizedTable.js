import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import useComponentMemoryOptimization from './useComponentMemoryOptimization';
import useOptimizedList from './useOptimizedList';

/**
 * Hook para optimización de tablas
 * Implementa virtualización, paginación, filtrado y ordenamiento optimizado
 */
const useOptimizedTable = (data, options = {}) => {
    const {
        pageSize = 20,
        maxItems = 1000,
        enableVirtualization = true,
        enablePagination = true,
        enableFiltering = true,
        enableSorting = true,
        enableSelection = false,
        enableExport = true
    } = options;

    const memoryOptimization = useComponentMemoryOptimization('OptimizedTable');
    const [selectedRows, setSelectedRows] = useState(new Set());
    const [expandedRows, setExpandedRows] = useState(new Set());
    const [columnVisibility, setColumnVisibility] = useState({});
    const [columnWidths, setColumnWidths] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const tableRef = useRef(null);

    // Usar hook de lista optimizada
    const listOptimization = useOptimizedList(data, {
        pageSize,
        maxItems,
        enableVirtualization,
        enablePagination,
        enableFiltering,
        enableSorting
    });

    // Función para seleccionar fila
    const selectRow = useCallback((rowId) => {
        setSelectedRows(prev => {
            const newSet = new Set(prev);
            if (newSet.has(rowId)) {
                newSet.delete(rowId);
            } else {
                newSet.add(rowId);
            }
            return newSet;
        });
    }, []);

    // Función para seleccionar todas las filas
    const selectAllRows = useCallback(() => {
        const allRowIds = listOptimization.items.map(item => item.id || item._id);
        setSelectedRows(new Set(allRowIds));
    }, [listOptimization.items]);

    // Función para deseleccionar todas las filas
    const deselectAllRows = useCallback(() => {
        setSelectedRows(new Set());
    }, []);

    // Función para expandir/contraer fila
    const toggleRowExpansion = useCallback((rowId) => {
        setExpandedRows(prev => {
            const newSet = new Set(prev);
            if (newSet.has(rowId)) {
                newSet.delete(rowId);
            } else {
                newSet.add(rowId);
            }
            return newSet;
        });
    }, []);

    // Función para actualizar visibilidad de columna
    const updateColumnVisibility = useCallback((columnId, isVisible) => {
        setColumnVisibility(prev => ({ ...prev, [columnId]: isVisible }));
    }, []);

    // Función para actualizar ancho de columna
    const updateColumnWidth = useCallback((columnId, width) => {
        setColumnWidths(prev => ({ ...prev, [columnId]: width }));
    }, []);

    // Función para obtener estadísticas de selección
    const getSelectionStats = useCallback(() => {
        return {
            selectedCount: selectedRows.size,
            totalCount: listOptimization.items.length,
            isAllSelected: selectedRows.size === listOptimization.items.length && listOptimization.items.length > 0,
            isPartiallySelected: selectedRows.size > 0 && selectedRows.size < listOptimization.items.length
        };
    }, [selectedRows, listOptimization.items]);

    // Función para exportar datos seleccionados
    const exportSelectedData = useCallback((format = 'json') => {
        const selectedItems = listOptimization.items.filter(item =>
            selectedRows.has(item.id || item._id)
        );

        switch (format) {
            case 'json':
                return JSON.stringify(selectedItems, null, 2);
            case 'csv':
                if (selectedItems.length === 0) return '';
                const headers = Object.keys(selectedItems[0]).join(',');
                const rows = selectedItems.map(item => Object.values(item).join(','));
                return [headers, ...rows].join('\n');
            default:
                return selectedItems;
        }
    }, [listOptimization.items, selectedRows]);

    // Función para obtener estadísticas de tabla
    const getTableStats = useCallback(() => {
        return {
            ...listOptimization.getListStats(),
            selectedRows: selectedRows.size,
            expandedRows: expandedRows.size,
            columnVisibility,
            columnWidths,
            isLoading,
            error
        };
    }, [listOptimization, selectedRows, expandedRows, columnVisibility, columnWidths, isLoading, error]);

    // Función para limpiar selección
    const clearSelection = useCallback(() => {
        setSelectedRows(new Set());
    }, []);

    // Función para limpiar expansión
    const clearExpansion = useCallback(() => {
        setExpandedRows(new Set());
    }, []);

    // Función para resetear tabla
    const resetTable = useCallback(() => {
        clearSelection();
        clearExpansion();
        setColumnVisibility({});
        setColumnWidths({});
        listOptimization.clearFilters();
    }, [clearSelection, clearExpansion, listOptimization]);

    // Función para obtener filas visibles
    const getVisibleRows = useCallback(() => {
        return listOptimization.items.map(item => ({
            ...item,
            isSelected: selectedRows.has(item.id || item._id),
            isExpanded: expandedRows.has(item.id || item._id)
        }));
    }, [listOptimization.items, selectedRows, expandedRows]);

    // Función para obtener columnas visibles
    const getVisibleColumns = useCallback((columns) => {
        return columns.filter(column =>
            columnVisibility[column.id] !== false
        );
    }, [columnVisibility]);

    // Función para obtener ancho de columna
    const getColumnWidth = useCallback((columnId, defaultWidth = 150) => {
        return columnWidths[columnId] || defaultWidth;
    }, [columnWidths]);

    // Función para actualizar ancho de columna
    const resizeColumn = useCallback((columnId, newWidth) => {
        setColumnWidths(prev => ({ ...prev, [columnId]: newWidth }));
    }, []);

    // Función para obtener estadísticas de rendimiento
    const getPerformanceStats = useCallback(() => {
        return {
            ...memoryOptimization.getMemoryStats(),
            tableStats: getTableStats(),
            listStats: listOptimization.getListStats()
        };
    }, [memoryOptimization, getTableStats, listOptimization]);

    // Cleanup automático
    useEffect(() => {
        return memoryOptimization.cleanup;
    }, [memoryOptimization]);

    return {
        // Referencias
        tableRef,

        // Datos
        items: listOptimization.items,
        visibleRows: getVisibleRows(),
        totalItems: listOptimization.totalItems,
        totalPages: listOptimization.totalPages,

        // Estados
        currentPage: listOptimization.currentPage,
        filters: listOptimization.filters,
        searchQuery: listOptimization.searchQuery,
        sortBy: listOptimization.sortBy,
        sortOrder: listOptimization.sortOrder,
        isLoading: listOptimization.isLoading,
        error: listOptimization.error,

        // Selección
        selectedRows,
        selectionStats: getSelectionStats(),

        // Expansión
        expandedRows,

        // Columnas
        columnVisibility,
        columnWidths,

        // Navegación
        hasNextPage: listOptimization.hasNextPage,
        hasPreviousPage: listOptimization.hasPreviousPage,

        // Acciones de datos
        updateFilters: listOptimization.updateFilters,
        updateSearch: listOptimization.updateSearch,
        updateSorting: listOptimization.updateSorting,
        changePage: listOptimization.changePage,
        nextPage: listOptimization.nextPage,
        previousPage: listOptimization.previousPage,
        clearFilters: listOptimization.clearFilters,

        // Acciones de tabla
        selectRow,
        selectAllRows,
        deselectAllRows,
        toggleRowExpansion,
        updateColumnVisibility,
        updateColumnWidth,
        resizeColumn,
        clearSelection,
        clearExpansion,
        resetTable,

        // Utilidades
        getVisibleColumns,
        getColumnWidth,
        getTableStats,
        getPerformanceStats,
        exportData: listOptimization.exportData,
        exportSelectedData,

        // Configuración
        pageSize: listOptimization.pageSize,
        maxItems: listOptimization.maxItems,
        enableVirtualization: listOptimization.enableVirtualization,
        enablePagination: listOptimization.enablePagination,
        enableFiltering: listOptimization.enableFiltering,
        enableSorting: listOptimization.enableSorting,
        enableSelection,
        enableExport
    };
};

export default useOptimizedTable;
