import { useEffect } from 'react';
import useInventoryTable from '../hooks/useInventoryTable';

const InventoryTable = () => {
    const {
        inventory,
        loading,
        error,
        filters,
        pagination,
        sorting,
        selectedItems,
        actionLoading,
        updateFilters,
        updatePagination,
        updateSorting,
        toggleItemSelection,
        toggleSelectAll,
        executeStockAction,
        refreshData,
        clearError
    } = useInventoryTable();

    // El polling ahora se maneja en el hook useInventoryTable

    // Manejar cambios en filtros
    const handleFilterChange = (key, value) => {
        updateFilters({ [key]: value });
    };

    // Manejar cambios en paginación
    const handlePageChange = (page) => {
        updatePagination({ currentPage: page });
    };

    // Manejar cambios en ordenamiento
    const handleSort = (sortBy) => {
        updateSorting({
            sortBy,
            sortOrder: sorting.sortBy === sortBy && sorting.sortOrder === 'asc' ? 'desc' : 'asc'
        });
    };

    // Acciones de stock
    const handleStockAction = async (action, itemId, data = {}) => {
        const result = await executeStockAction(action, itemId, data);
        if (!result.success) {
            // El error ya se maneja en el hook
            console.error('Error en acción de stock:', result.message);
        }
    };

    // Función para obtener el color del estado del stock
    const getStockStatusColor = (item) => {
        if (item.currentStock === 0) return 'text-red-600 bg-red-50 border-red-200';
        if (item.currentStock <= (item.minStock * 0.5)) return 'text-red-700 bg-red-100 border-red-300';
        if (item.currentStock <= item.minStock) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        if (item.currentStock >= item.maxStock) return 'text-green-600 bg-green-50 border-green-200';
        return 'text-blue-600 bg-blue-50 border-blue-200';
    };

    // Función para obtener el texto del estado del stock
    const getStockStatusText = (item) => {
        if (item.currentStock === 0) return 'Agotado';
        if (item.currentStock <= (item.minStock * 0.5)) return 'Crítico';
        if (item.currentStock <= item.minStock) return 'Stock Bajo';
        if (item.currentStock >= item.maxStock) return 'Stock Alto';
        return 'Normal';
    };

    // Función para obtener el icono de alerta
    const getStockAlertIcon = (item) => {
        if (item.currentStock === 0) {
            return (
                <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
            );
        }
        if (item.currentStock <= (item.minStock * 0.5)) {
            return (
                <svg className="w-4 h-4 text-red-600 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
            );
        }
        if (item.currentStock <= item.minStock) {
            return (
                <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
            );
        }
        return null;
    };

    if (loading && inventory.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow">
            {/* Header con filtros */}
            <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-medium text-gray-900">
                            Gestión de Inventario
                        </h3>
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-xs text-gray-500">Actualización en tiempo real</span>
                        </div>
                    </div>

                    {/* Filtros */}
                    <div className="flex flex-wrap gap-4">
                        <select
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                        >
                            <option value="">Todos los estados</option>
                            <option value="active">Activo</option>
                            <option value="inactive">Inactivo</option>
                            <option value="out_of_stock">Agotado</option>
                            <option value="discontinued">Descontinuado</option>
                        </select>

                        <input
                            type="number"
                            placeholder="Stock min"
                            value={filters.stock_min}
                            onChange={(e) => handleFilterChange('stock_min', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md text-sm w-24"
                        />

                        <input
                            type="number"
                            placeholder="Stock max"
                            value={filters.stock_max}
                            onChange={(e) => handleFilterChange('stock_max', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md text-sm w-24"
                        />

                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={filters.needs_restock}
                                onChange={(e) => handleFilterChange('needs_restock', e.target.checked)}
                                className="mr-2"
                            />
                            <span className="text-sm text-gray-600">Necesita reabastecimiento</span>
                        </label>

                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Buscar producto..."
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm w-48 pr-8"
                            />
                            {filters.search && (
                                <button
                                    type="button"
                                    onClick={() => handleFilterChange('search', '')}
                                    className="absolute inset-y-0 right-2 flex items-center text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabla */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left">
                                <input
                                    type="checkbox"
                                    checked={selectedItems.length === inventory.length && inventory.length > 0}
                                    onChange={toggleSelectAll}
                                    className="rounded border-gray-300"
                                />
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSort('productName')}
                            >
                                Producto
                                {sorting.sortBy === 'productName' && (
                                    <span className="ml-1">
                                        {sorting.sortOrder === 'asc' ? '↑' : '↓'}
                                    </span>
                                )}
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSort('currentStock')}
                            >
                                Stock Actual
                                {sorting.sortBy === 'currentStock' && (
                                    <span className="ml-1">
                                        {sorting.sortOrder === 'asc' ? '↑' : '↓'}
                                    </span>
                                )}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Stock Disponible
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Estado
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {inventory.map((item) => {
                            const isLowStock = item.currentStock <= item.minStock;
                            const isCriticalStock = item.currentStock <= (item.minStock * 0.5) || item.currentStock === 0;
                            const rowClass = isCriticalStock
                                ? "bg-red-50 hover:bg-red-100 border-l-4 border-red-400"
                                : isLowStock
                                    ? "bg-yellow-50 hover:bg-yellow-100 border-l-4 border-yellow-400"
                                    : "hover:bg-gray-50";

                            return (
                                <tr key={item._id} className={rowClass}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <input
                                            type="checkbox"
                                            checked={selectedItems.includes(item._id)}
                                            onChange={() => toggleItemSelection(item._id)}
                                            className="rounded border-gray-300"
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10 relative overflow-hidden rounded-lg bg-gray-100">
                                                {item.product?.imageUrl ? (
                                                    <img
                                                        className="h-10 w-10 rounded-lg object-cover transition-opacity duration-300"
                                                        src={item.product.imageUrl}
                                                        alt={item.product.name}
                                                        loading="lazy"
                                                        decoding="async"
                                                        onLoad={(e) => {
                                                            e.target.style.opacity = '1';
                                                        }}
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                        }}
                                                        style={{ opacity: 0 }}
                                                    />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                                                        <span className="text-gray-400 text-xs">IMG</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {item.product?.name || 'Producto no encontrado'}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {item.product?.brand || 'Sin marca'}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{item.currentStock}</div>
                                        <div className="text-xs text-gray-500">
                                            Min: {item.minStock} | Max: {item.maxStock}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{item.availableStock}</div>
                                        {item.reservedStock > 0 && (
                                            <div className="text-xs text-yellow-600">
                                                Reservado: {item.reservedStock}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center space-x-2">
                                            {getStockAlertIcon(item)}
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStockStatusColor(item)}`}>
                                                {getStockStatusText(item)}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => {
                                                    const quantity = prompt('Cantidad a reabastecer:');
                                                    if (quantity && !isNaN(quantity) && quantity > 0) {
                                                        handleStockAction('restock', item._id, { quantity: parseInt(quantity) });
                                                    }
                                                }}
                                                disabled={actionLoading[item._id]}
                                                className="text-green-600 hover:text-green-900 disabled:opacity-50"
                                            >
                                                {actionLoading[item._id] ? '...' : 'Reabastecer'}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    const quantity = prompt('Cantidad a reservar:');
                                                    if (quantity && !isNaN(quantity) && quantity > 0) {
                                                        handleStockAction('reserve', item._id, { quantity: parseInt(quantity) });
                                                    }
                                                }}
                                                disabled={actionLoading[item._id] || item.availableStock === 0}
                                                className="text-yellow-600 hover:text-yellow-900 disabled:opacity-50"
                                            >
                                                Reservar
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {!loading && inventory.length === 0 && (
                    <div className="px-6 py-10 text-center text-gray-500">
                        <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2a4 4 0 014-4h4m0 0l-3-3m3 3l-3 3" />
                        </svg>
                        <p className="text-lg font-medium text-gray-700">No encontramos resultados</p>
                        <p className="mt-1 text-sm text-gray-500">Prueba ajustando los filtros o buscando con otros términos.</p>
                    </div>
                )}
            </div>

            {/* Paginación */}
            {pagination.totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                            Mostrando {((pagination.currentPage - 1) * pagination.limit) + 1} a{' '}
                            {Math.min(pagination.currentPage * pagination.limit, pagination.totalCount || 0)} de{' '}
                            {pagination.totalCount || 0} resultados
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => handlePageChange(pagination.currentPage - 1)}
                                disabled={pagination.currentPage === 1}
                                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Anterior
                            </button>
                            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    className={`px-3 py-2 text-sm font-medium rounded-md ${page === pagination.currentPage
                                        ? 'text-white bg-blue-600'
                                        : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}
                            <button
                                onClick={() => handlePageChange(pagination.currentPage + 1)}
                                disabled={pagination.currentPage === pagination.totalPages}
                                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Siguiente
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Error message */}
            {error && (
                <div className="px-6 py-4 bg-red-50 border-t border-red-200">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-red-600">{error}</div>
                        <button
                            onClick={clearError}
                            className="text-red-400 hover:text-red-600"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InventoryTable;
