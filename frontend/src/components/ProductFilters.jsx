import React, { useState } from 'react';

export default function ProductFilters({ onFiltersChange, currentFilters = {} }) {
  const [filters, setFilters] = useState({
    category: currentFilters.category || '',
    priceRange: currentFilters.priceRange || { min: '', max: '' },
    brand: currentFilters.brand || '',
    inStock: currentFilters.inStock || false,
    sortBy: currentFilters.sortBy || 'name'
  });

  const categories = [
    'Todos los Productos',
    'Proteínas',
    'Vitaminas y Más',
    'Rendimiento',
    'Alimentos y Snacks',
    'Accesorios'
  ];

  const brands = [
    'Todas las Marcas',
    'SuperGains',
    'Optimum Nutrition',
    'Dymatize',
    'BSN',
    'MuscleTech'
  ];

  const sortOptions = [
    { value: 'name', label: 'Nombre A-Z' },
    { value: 'price_asc', label: 'Precio: Menor a Mayor' },
    { value: 'price_desc', label: 'Precio: Mayor a Menor' },
    { value: 'rating', label: 'Mejor Valorados' },
    { value: 'newest', label: 'Más Recientes' }
  ];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handlePriceChange = (type, value) => {
    const newPriceRange = { ...filters.priceRange, [type]: value };
    const newFilters = { ...filters, priceRange: newPriceRange };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      category: '',
      priceRange: { min: '', max: '' },
      brand: '',
      inStock: false,
      sortBy: 'name'
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters = () => {
    return (
      filters.category ||
      filters.priceRange.min ||
      filters.priceRange.max ||
      filters.brand ||
      filters.inStock ||
      filters.sortBy !== 'name'
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-black">Filtros</h3>
        {hasActiveFilters() && (
          <button
            onClick={clearFilters}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Filtro por Categoría */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Categoría
          </label>
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          >
            {categories.map((category) => (
              <option key={category} value={category === 'Todos los Productos' ? '' : category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por Marca */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Marca
          </label>
          <select
            value={filters.brand}
            onChange={(e) => handleFilterChange('brand', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          >
            {brands.map((brand) => (
              <option key={brand} value={brand === 'Todas las Marcas' ? '' : brand}>
                {brand}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por Rango de Precio */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Rango de Precio
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Mín"
              value={filters.priceRange.min}
              onChange={(e) => handlePriceChange('min', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
            <input
              type="number"
              placeholder="Máx"
              value={filters.priceRange.max}
              onChange={(e) => handlePriceChange('max', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>
        </div>

        {/* Ordenamiento */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Ordenar por
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Filtros adicionales */}
      <div className="mt-6 flex items-center gap-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={filters.inStock}
            onChange={(e) => handleFilterChange('inStock', e.target.checked)}
            className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
          />
          <span className="ml-2 text-sm text-gray-700">Solo productos en stock</span>
        </label>
      </div>

      {/* Indicador de filtros activos */}
      {hasActiveFilters() && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600">
            <strong>Filtros activos:</strong>
            {filters.category && <span className="ml-2 px-2 py-1 bg-black text-white rounded-full text-xs">{filters.category}</span>}
            {filters.brand && <span className="ml-2 px-2 py-1 bg-black text-white rounded-full text-xs">{filters.brand}</span>}
            {(filters.priceRange.min || filters.priceRange.max) && (
              <span className="ml-2 px-2 py-1 bg-black text-white rounded-full text-xs">
                ${filters.priceRange.min || '0'} - ${filters.priceRange.max || '∞'}
              </span>
            )}
            {filters.inStock && <span className="ml-2 px-2 py-1 bg-green-500 text-white rounded-full text-xs">En Stock</span>}
          </div>
        </div>
      )}
    </div>
  );
}
