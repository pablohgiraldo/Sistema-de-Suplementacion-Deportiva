/**
 * Controladores de fallback para cuando MongoDB no está disponible
 * Estos controladores usan caché y datos en memoria
 */

import fallbackService from '../services/fallbackService.js';
import cacheService from '../services/cacheService.js';

/**
 * Fallback para obtener productos
 */
export async function getProductsFallback(req, res) {
  try {
    console.log('📦 Obteniendo productos desde fallback...');
    
    // Intentar obtener de caché o memoria
    const products = await fallbackService.getListFromFallback('products', req.query);
    
    if (products && products.length > 0) {
      // Aplicar filtros básicos si es posible
      let filteredProducts = products;
      
      const { brand, price_min, price_max, category, limit = 50, page = 1 } = req.query;
      
      // Filtro por marca
      if (brand) {
        filteredProducts = filteredProducts.filter(p => 
          p.brand && p.brand.toLowerCase().includes(brand.toLowerCase())
        );
      }
      
      // Filtro por categoría
      if (category) {
        const categories = category.split(',').map(cat => cat.trim());
        filteredProducts = filteredProducts.filter(p =>
          p.categories && p.categories.some(cat => categories.includes(cat))
        );
      }
      
      // Filtro por precio
      if (price_min) {
        filteredProducts = filteredProducts.filter(p => p.price >= parseFloat(price_min));
      }
      if (price_max) {
        filteredProducts = filteredProducts.filter(p => p.price <= parseFloat(price_max));
      }
      
      // Paginación
      const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 50));
      const pageNum = Math.max(1, parseInt(page) || 1);
      const skip = (pageNum - 1) * limitNum;
      const paginatedProducts = filteredProducts.slice(skip, skip + limitNum);
      
      const totalCount = filteredProducts.length;
      const totalPages = Math.ceil(totalCount / limitNum);
      
      return res.json(fallbackService.createDegradedResponse({
        products: paginatedProducts,
        count: paginatedProducts.length,
        totalCount,
        pagination: {
          currentPage: pageNum,
          totalPages,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1,
          limit: limitNum
        }
      }, 'memory/cache'));
    }
    
    // Si no hay datos disponibles
    return res.status(503).json(
      fallbackService.createUnavailableResponse('GET /api/products')
    );
    
  } catch (error) {
    console.error('❌ Error en fallback de productos:', error.message);
    return res.status(503).json({
      success: false,
      degraded: true,
      error: 'Service temporarily unavailable',
      message: 'No se pudieron obtener productos en modo fallback',
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Fallback para obtener un producto por ID
 */
export async function getProductByIdFallback(req, res) {
  try {
    const { id } = req.params;
    console.log(`📦 Obteniendo producto ${id} desde fallback...`);
    
    // Intentar obtener de caché o memoria
    const product = await fallbackService.getFromFallback('products', id);
    
    if (product) {
      return res.json(fallbackService.createDegradedResponse(product, 'cache'));
    }
    
    // Si no se encuentra
    return res.status(404).json({
      success: false,
      degraded: true,
      error: 'Product not found',
      message: 'Producto no encontrado en datos de fallback',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error en fallback de producto:', error.message);
    return res.status(503).json({
      success: false,
      degraded: true,
      error: 'Service temporarily unavailable',
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Fallback para búsqueda de productos
 */
export async function searchProductsFallback(req, res) {
  try {
    const { query, category, brand, limit = 20 } = req.query;
    console.log(`🔍 Buscando "${query}" en fallback...`);
    
    // Obtener todos los productos disponibles
    const products = await fallbackService.getListFromFallback('products');
    
    if (products && products.length > 0) {
      // Filtrar por query de búsqueda
      let results = products;
      
      if (query) {
        const searchTerm = query.toLowerCase();
        results = results.filter(p =>
          (p.name && p.name.toLowerCase().includes(searchTerm)) ||
          (p.description && p.description.toLowerCase().includes(searchTerm)) ||
          (p.brand && p.brand.toLowerCase().includes(searchTerm))
        );
      }
      
      // Filtros adicionales
      if (category) {
        results = results.filter(p =>
          p.categories && p.categories.includes(category)
        );
      }
      
      if (brand) {
        results = results.filter(p =>
          p.brand && p.brand.toLowerCase() === brand.toLowerCase()
        );
      }
      
      // Limitar resultados
      const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
      results = results.slice(0, limitNum);
      
      return res.json(fallbackService.createDegradedResponse({
        products: results,
        count: results.length,
        query: query
      }, 'cache'));
    }
    
    return res.status(503).json(
      fallbackService.createUnavailableResponse('GET /api/products/search')
    );
    
  } catch (error) {
    console.error('❌ Error en fallback de búsqueda:', error.message);
    return res.status(503).json({
      success: false,
      degraded: true,
      error: 'Service temporarily unavailable',
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Fallback para obtener recomendaciones populares
 */
export async function getPopularProductsFallback(req, res) {
  try {
    console.log('📦 Obteniendo productos populares desde fallback...');
    
    const products = await fallbackService.getListFromFallback('products');
    
    if (products && products.length > 0) {
      // Ordenar por popularidad estimada (por ejemplo, por stock vendido)
      const popular = products
        .sort((a, b) => (b.sold || 0) - (a.sold || 0))
        .slice(0, 10);
      
      return res.json(fallbackService.createDegradedResponse({
        products: popular,
        count: popular.length
      }, 'cache'));
    }
    
    return res.status(503).json(
      fallbackService.createUnavailableResponse('GET /api/recommendations/popular')
    );
    
  } catch (error) {
    console.error('❌ Error en fallback de recomendaciones:', error.message);
    return res.status(503).json({
      success: false,
      degraded: true,
      error: 'Service temporarily unavailable',
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Fallback para obtener carrito
 */
export async function getCartFallback(req, res) {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'No autorizado'
      });
    }
    
    console.log(`📦 Obteniendo carrito de usuario ${userId} desde fallback...`);
    
    // Intentar obtener carrito de caché
    const cart = await cacheService.getCart(userId);
    
    if (cart) {
      return res.json(fallbackService.createDegradedResponse(cart, 'cache'));
    }
    
    // Si no hay carrito en caché, devolver carrito vacío
    return res.json(fallbackService.createDegradedResponse({
      items: [],
      total: 0,
      message: 'Carrito no disponible en modo degradado'
    }, 'fallback'));
    
  } catch (error) {
    console.error('❌ Error en fallback de carrito:', error.message);
    return res.status(503).json({
      success: false,
      degraded: true,
      error: 'Service temporarily unavailable',
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Fallback genérico para operaciones de escritura
 */
export function writeOperationFallback(req, res) {
  return res.status(503).json({
    success: false,
    degraded: true,
    error: 'Write operations not available',
    message: 'Las operaciones de escritura no están disponibles en modo degradado. Por favor, intenta más tarde.',
    operation: `${req.method} ${req.path}`,
    timestamp: new Date().toISOString()
  });
}

export default {
  getProductsFallback,
  getProductByIdFallback,
  searchProductsFallback,
  getPopularProductsFallback,
  getCartFallback,
  writeOperationFallback
};
