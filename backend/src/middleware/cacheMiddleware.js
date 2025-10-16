import cacheService from '../services/cacheService.js';
import { CACHE_CONFIG } from '../config/redis.js';

/**
 * Middleware de caché genérico para endpoints GET
 * @param {string} keyPrefix - Prefijo para la clave de caché
 * @param {number} ttl - Tiempo de vida en segundos (opcional)
 * @param {Function} keyGenerator - Función para generar clave única (opcional)
 */
export function cacheMiddleware(keyPrefix, ttl = CACHE_CONFIG.DEFAULT_TTL, keyGenerator = null) {
  return async (req, res, next) => {
    // Solo aplicar caché a métodos GET
    if (req.method !== 'GET') {
      return next();
    }

    try {
      // Generar clave de caché
      let cacheKey;
      if (keyGenerator) {
        cacheKey = keyGenerator(req);
      } else {
        // Clave por defecto basada en URL y query params
        const queryString = Object.keys(req.query).length > 0 
          ? `_${JSON.stringify(req.query)}` 
          : '';
        cacheKey = `${keyPrefix}${req.path}${queryString}`;
      }

      // Verificar si Redis está disponible
      const isRedisAvailable = await cacheService.isRedisAvailable();
      if (!isRedisAvailable) {
        console.log('⚠️ Redis no disponible, saltando caché');
        return next();
      }

      // Intentar obtener datos del caché
      const cachedData = await cacheService.get(cacheKey);
      
      if (cachedData !== null) {
        console.log(`✅ Datos obtenidos del caché: ${cacheKey}`);
        return res.json({
          success: true,
          data: cachedData,
          cached: true,
          cacheKey: cacheKey,
          timestamp: new Date().toISOString()
        });
      }

      // Si no hay datos en caché, continuar con el siguiente middleware
      // y guardar la respuesta en caché
      const originalSend = res.json;
      res.json = function(data) {
        // Solo cachear respuestas exitosas
        if (data && data.success !== false) {
          cacheService.set(cacheKey, data.data || data, ttl)
            .then(() => {
              console.log(`💾 Datos guardados en caché: ${cacheKey}`);
            })
            .catch(error => {
              console.error(`❌ Error guardando en caché: ${error.message}`);
            });
        }
        
        // Agregar información de caché a la respuesta
        const responseData = {
          ...data,
          cached: false,
          cacheKey: cacheKey,
          timestamp: new Date().toISOString()
        };
        
        return originalSend.call(this, responseData);
      };

      next();
    } catch (error) {
      console.error('❌ Error en middleware de caché:', error.message);
      next();
    }
  };
}

/**
 * Middleware específico para productos
 */
export function productCacheMiddleware() {
  return cacheMiddleware(
    CACHE_CONFIG.PREFIXES.PRODUCT,
    CACHE_CONFIG.PRODUCTS_TTL,
    (req) => {
      const productId = req.params.id;
      if (productId) {
        return `${CACHE_CONFIG.PREFIXES.PRODUCT}${productId}`;
      }
      // Para listados de productos, incluir query params
      const queryString = Object.keys(req.query).length > 0 
        ? `_list_${JSON.stringify(req.query)}` 
        : '_list';
      return `${CACHE_CONFIG.PREFIXES.PRODUCT}${queryString}`;
    }
  );
}

/**
 * Middleware específico para categorías
 */
export function categoryCacheMiddleware() {
  return cacheMiddleware(
    CACHE_CONFIG.PREFIXES.CATEGORY,
    CACHE_CONFIG.CATEGORIES_TTL,
    (req) => {
      const categoryId = req.params.id;
      if (categoryId) {
        return `${CACHE_CONFIG.PREFIXES.CATEGORY}${categoryId}`;
      }
      return `${CACHE_CONFIG.PREFIXES.CATEGORY}list`;
    }
  );
}

/**
 * Middleware específico para recomendaciones
 */
export function recommendationCacheMiddleware() {
  return cacheMiddleware(
    CACHE_CONFIG.PREFIXES.RECOMMENDATION,
    CACHE_CONFIG.RECOMMENDATIONS_TTL,
    (req) => {
      const userId = req.user?.id || req.params.userId || 'anonymous';
      const type = req.query.type || 'general';
      return `${CACHE_CONFIG.PREFIXES.RECOMMENDATION}${userId}_${type}`;
    }
  );
}

/**
 * Middleware específico para búsquedas
 */
export function searchCacheMiddleware() {
  return cacheMiddleware(
    CACHE_CONFIG.PREFIXES.SEARCH,
    CACHE_CONFIG.DEFAULT_TTL,
    (req) => {
      const query = req.query.q || req.query.query || '';
      const filters = {
        category: req.query.category,
        minPrice: req.query.minPrice,
        maxPrice: req.query.maxPrice,
        sort: req.query.sort,
        page: req.query.page,
        limit: req.query.limit
      };
      
      // Limpiar filtros undefined
      Object.keys(filters).forEach(key => {
        if (filters[key] === undefined) {
          delete filters[key];
        }
      });
      
      const filterString = Object.keys(filters).length > 0 
        ? `_${JSON.stringify(filters)}` 
        : '';
      
      return `${CACHE_CONFIG.PREFIXES.SEARCH}${query}${filterString}`;
    }
  );
}

/**
 * Middleware para invalidar caché después de operaciones de escritura
 * @param {string} pattern - Patrón de claves a invalidar
 */
export function invalidateCacheMiddleware(pattern) {
  return async (req, res, next) => {
    const originalSend = res.json;
    
    res.json = function(data) {
      // Solo invalidar si la operación fue exitosa
      if (data && data.success !== false) {
        cacheService.delPattern(pattern)
          .then(() => {
            console.log(`🗑️ Caché invalidado para patrón: ${pattern}`);
          })
          .catch(error => {
            console.error(`❌ Error invalidando caché: ${error.message}`);
          });
      }
      
      return originalSend.call(this, data);
    };
    
    next();
  };
}

/**
 * Middleware para invalidar caché de productos
 */
export function invalidateProductCacheMiddleware() {
  return invalidateCacheMiddleware(`${CACHE_CONFIG.PREFIXES.PRODUCT}*`);
}

/**
 * Middleware para invalidar caché de categorías
 */
export function invalidateCategoryCacheMiddleware() {
  return invalidateCacheMiddleware(`${CACHE_CONFIG.PREFIXES.CATEGORY}*`);
}

/**
 * Middleware para invalidar caché de recomendaciones
 */
export function invalidateRecommendationCacheMiddleware() {
  return invalidateCacheMiddleware(`${CACHE_CONFIG.PREFIXES.RECOMMENDATION}*`);
}

/**
 * Middleware para invalidar caché de búsquedas
 */
export function invalidateSearchCacheMiddleware() {
  return invalidateCacheMiddleware(`${CACHE_CONFIG.PREFIXES.SEARCH}*`);
}

/**
 * Middleware para manejar caché de carrito de usuario
 */
export function cartCacheMiddleware() {
  return async (req, res, next) => {
    // Solo aplicar a métodos GET para carrito
    if (req.method !== 'GET') {
      return next();
    }

    try {
      const userId = req.user?.id;
      if (!userId) {
        return next();
      }

      const cacheKey = `${CACHE_CONFIG.PREFIXES.CART}${userId}`;
      const isRedisAvailable = await cacheService.isRedisAvailable();
      
      if (!isRedisAvailable) {
        return next();
      }

      const cachedCart = await cacheService.get(cacheKey);
      
      if (cachedCart !== null) {
        console.log(`✅ Carrito obtenido del caché: ${cacheKey}`);
        return res.json({
          success: true,
          data: cachedCart,
          cached: true,
          cacheKey: cacheKey,
          timestamp: new Date().toISOString()
        });
      }

      // Interceptar respuesta para guardar en caché
      const originalSend = res.json;
      res.json = function(data) {
        if (data && data.success !== false) {
          cacheService.set(cacheKey, data.data || data, CACHE_CONFIG.CART_TTL)
            .then(() => {
              console.log(`💾 Carrito guardado en caché: ${cacheKey}`);
            })
            .catch(error => {
              console.error(`❌ Error guardando carrito en caché: ${error.message}`);
            });
        }
        
        const responseData = {
          ...data,
          cached: false,
          cacheKey: cacheKey,
          timestamp: new Date().toISOString()
        };
        
        return originalSend.call(this, responseData);
      };

      next();
    } catch (error) {
      console.error('❌ Error en middleware de caché de carrito:', error.message);
      next();
    }
  };
}

/**
 * Middleware para invalidar caché de carrito después de modificaciones
 */
export function invalidateCartCacheMiddleware() {
  return async (req, res, next) => {
    const originalSend = res.json;
    
    res.json = function(data) {
      if (data && data.success !== false) {
        const userId = req.user?.id;
        if (userId) {
          const cacheKey = `${CACHE_CONFIG.PREFIXES.CART}${userId}`;
          cacheService.del(cacheKey)
            .then(() => {
              console.log(`🗑️ Caché de carrito invalidado: ${cacheKey}`);
            })
            .catch(error => {
              console.error(`❌ Error invalidando caché de carrito: ${error.message}`);
            });
        }
      }
      
      return originalSend.call(this, data);
    };
    
    next();
  };
}

export default {
  cacheMiddleware,
  productCacheMiddleware,
  categoryCacheMiddleware,
  recommendationCacheMiddleware,
  searchCacheMiddleware,
  invalidateCacheMiddleware,
  invalidateProductCacheMiddleware,
  invalidateCategoryCacheMiddleware,
  invalidateRecommendationCacheMiddleware,
  invalidateSearchCacheMiddleware,
  cartCacheMiddleware,
  invalidateCartCacheMiddleware
};
