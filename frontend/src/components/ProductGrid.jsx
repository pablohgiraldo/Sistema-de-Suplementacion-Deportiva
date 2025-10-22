import React from 'react';
import ProductCard from './productCard';

const ProductGrid = ({ products, className = '', showTitle = true, title = "Productos", subtitle = "" }) => {
    if (!products || products.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="text-gray-500 text-lg">
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p>No hay productos disponibles</p>
                </div>
            </div>
        );
    }

    return (
        <section className={className}>
            {showTitle && (
                <div className="text-center mb-8">
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                        {title}
                    </h2>
                    {subtitle && (
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            {subtitle}
                        </p>
                    )}
                </div>
            )}

            {/* Grid responsive optimizado para HU47 - Catálogo visual mejorado */}
            <div className="grid gap-4 sm:gap-5 md:gap-6 lg:gap-7 xl:gap-8
                          grid-cols-2 
                          sm:grid-cols-2 
                          md:grid-cols-3 
                          lg:grid-cols-4 
                          xl:grid-cols-4 
                          2xl:grid-cols-5
                          auto-rows-fr">
                {products.map(product => (
                    <ProductCard key={product._id} p={product} />
                ))}
            </div>
        </section>
    );
};

export default ProductGrid;
