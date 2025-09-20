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

    // Polling cada 30 segundos para actualizaciones en tiempo real
    useEffect(() => {
        const interval = setInterval(refreshData, 30000);
        return () => clearInterval(interval);
    }, [refreshData]);

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
        if (item.currentStock === 0) return 'text-red-600 bg-red-50';
        if (item.currentStock <= item.minStock) return 'text-yellow-600 bg-yellow-50';
        if (item.currentStock >= item.maxStock) return 'text-green-600 bg-green-50';
        return 'text-blue-600 bg-blue-50';
    };

    // Función para obtener el texto del estado del stock
    const getStockStatusText = (item) => {
        if (item.currentStock === 0) return 'Agotado';
        if (item.currentStock <= item.minStock) return 'Stock Bajo';
        if (item.currentStock >= item.maxStock) return 'Stock Alto';
        return 'Normal';
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

                        <input
                            type="text"
                            placeholder="Buscar producto..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md text-sm w-48"
                        />
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
                        {inventory.map((item) => (
                            <tr key={item._id} className="hover:bg-gray-50">
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
                                        <div className="flex-shrink-0 h-10 w-10">
                                            {item.product?.imageUrl ? (
                                                <img
                                                    className="h-10 w-10 rounded-lg object-cover"
                                                    src={item.product.imageUrl}
                                                    alt={item.product.name}
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
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStockStatusColor(item)}`}>
                                        {getStockStatusText(item)}
                                    </span>
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
                        ))}
                    </tbody>
                </table>
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
