import { useMemo } from 'react';
import { getProductImage, getProductImages } from '../data/sampleProducts';

/**
 * Hook personalizado para manejar imágenes de productos
 * @param {Object} product - El producto
 * @returns {Object} - Objeto con funciones para obtener imágenes
 */
export const useProductImages = (product) => {
    const productImages = useMemo(() => {
        if (!product?._id) return null;

        return {
            // Imagen principal del producto
            mainImage: product.imageUrl || getProductImage(product._id),

            // Galería de imágenes (para páginas de detalle)
            gallery: product.images || getProductImages(product._id, 4),

            // Imagen de respaldo en caso de error
            fallbackImage: getProductImage(product._id),

            // Verificar si tiene imagen personalizada
            hasCustomImage: !!product.imageUrl
        };
    }, [product?._id, product?.imageUrl, product?.images]);

    return productImages;
};

/**
 * Función utilitaria para generar imágenes consistentes basadas en ID
 * @param {string} productId - ID del producto
 * @param {number} count - Número de imágenes a generar
 * @returns {Array} - Array de URLs de imágenes
 */
export const generateConsistentImages = (productId, count = 3) => {
    return getProductImages(productId, count);
};
