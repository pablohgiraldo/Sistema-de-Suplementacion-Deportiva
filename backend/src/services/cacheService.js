import { getRedisClient, CACHE_CONFIG, checkRedisHealth } from '../config/redis.js';

class CacheService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.initializeClient();
  }

  async initializeClient() {
    try {
      this.client = getRedisClient();
      this.isConnected = await checkRedisHealth();
      
      if (this.isConnected) {
        console.log('✅ CacheService inicializado correctamente');
      } else {
        console.warn('⚠️ CacheService inicializado pero Redis no disponible');
      }
    } catch (error) {
      console.error('❌ Error inicializando CacheService:', error.message);
      this.isConnected = false;
    }
  }

  // Método para verificar si Redis está disponible
  async isRedisAvailable() {
    try {
      return await checkRedisHealth();
    } catch (error) {
      return false;
    }
  }

  // Método genérico para obtener datos del caché
  async get(key) {
    if (!this.isConnected) {
      return null;
    }

    try {
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`❌ Error obteniendo caché para clave ${key}:`, error.message);
      return null;
    }
  }

  // Método genérico para guardar datos en el caché
  async set(key, value, ttl = CACHE_CONFIG.DEFAULT_TTL) {
    if (!this.isConnected) {
      return false;
    }

    try {
      const serializedValue = JSON.stringify(value);
      await this.client.setex(key, ttl, serializedValue);
      return true;
    } catch (error) {
      console.error(`❌ Error guardando en caché para clave ${key}:`, error.message);
      return false;
    }
  }

  // Método para eliminar datos del caché
  async del(key) {
    if (!this.isConnected) {
      return false;
    }

    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      console.error(`❌ Error eliminando caché para clave ${key}:`, error.message);
      return false;
    }
  }

  // Método para eliminar múltiples claves con patrón
  async delPattern(pattern) {
    if (!this.isConnected) {
      return false;
    }

    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
      return true;
    } catch (error) {
      console.error(`❌ Error eliminando patrón ${pattern}:`, error.message);
      return false;
    }
  }

  // Método para verificar si una clave existe
  async exists(key) {
    if (!this.isConnected) {
      return false;
    }

    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`❌ Error verificando existencia de clave ${key}:`, error.message);
      return false;
    }
  }

  // Método para obtener el TTL de una clave
  async getTTL(key) {
    if (!this.isConnected) {
      return -1;
    }

    try {
      return await this.client.ttl(key);
    } catch (error) {
      console.error(`❌ Error obteniendo TTL para clave ${key}:`, error.message);
      return -1;
    }
  }

  // Método para extender el TTL de una clave
  async extendTTL(key, ttl) {
    if (!this.isConnected) {
      return false;
    }

    try {
      await this.client.expire(key, ttl);
      return true;
    } catch (error) {
      console.error(`❌ Error extendiendo TTL para clave ${key}:`, error.message);
      return false;
    }
  }

  // Métodos específicos para productos
  async getProduct(productId) {
    const key = `${CACHE_CONFIG.PREFIXES.PRODUCT}${productId}`;
    return await this.get(key);
  }

  async setProduct(productId, product, ttl = CACHE_CONFIG.PRODUCTS_TTL) {
    const key = `${CACHE_CONFIG.PREFIXES.PRODUCT}${productId}`;
    return await this.set(key, product, ttl);
  }

  async delProduct(productId) {
    const key = `${CACHE_CONFIG.PREFIXES.PRODUCT}${productId}`;
    return await this.del(key);
  }

  // Métodos específicos para categorías
  async getCategory(categoryId) {
    const key = `${CACHE_CONFIG.PREFIXES.CATEGORY}${categoryId}`;
    return await this.get(key);
  }

  async setCategory(categoryId, category, ttl = CACHE_CONFIG.CATEGORIES_TTL) {
    const key = `${CACHE_CONFIG.PREFIXES.CATEGORY}${categoryId}`;
    return await this.set(key, category, ttl);
  }

  async delCategory(categoryId) {
    const key = `${CACHE_CONFIG.PREFIXES.CATEGORY}${categoryId}`;
    return await this.del(key);
  }

  // Métodos específicos para usuarios
  async getUser(userId) {
    const key = `${CACHE_CONFIG.PREFIXES.USER}${userId}`;
    return await this.get(key);
  }

  async setUser(userId, user, ttl = CACHE_CONFIG.USER_SESSION_TTL) {
    const key = `${CACHE_CONFIG.PREFIXES.USER}${userId}`;
    return await this.set(key, user, ttl);
  }

  async delUser(userId) {
    const key = `${CACHE_CONFIG.PREFIXES.USER}${userId}`;
    return await this.del(key);
  }

  // Métodos específicos para carrito
  async getCart(userId) {
    const key = `${CACHE_CONFIG.PREFIXES.CART}${userId}`;
    return await this.get(key);
  }

  async setCart(userId, cart, ttl = CACHE_CONFIG.CART_TTL) {
    const key = `${CACHE_CONFIG.PREFIXES.CART}${userId}`;
    return await this.set(key, cart, ttl);
  }

  async delCart(userId) {
    const key = `${CACHE_CONFIG.PREFIXES.CART}${userId}`;
    return await this.del(key);
  }

  // Métodos específicos para sesiones
  async getSession(sessionId) {
    const key = `${CACHE_CONFIG.PREFIXES.SESSION}${sessionId}`;
    return await this.get(key);
  }

  async setSession(sessionId, session, ttl = CACHE_CONFIG.USER_SESSION_TTL) {
    const key = `${CACHE_CONFIG.PREFIXES.SESSION}${sessionId}`;
    return await this.set(key, session, ttl);
  }

  async delSession(sessionId) {
    const key = `${CACHE_CONFIG.PREFIXES.SESSION}${sessionId}`;
    return await this.del(key);
  }

  // Métodos específicos para recomendaciones
  async getRecommendations(userId) {
    const key = `${CACHE_CONFIG.PREFIXES.RECOMMENDATION}${userId}`;
    return await this.get(key);
  }

  async setRecommendations(userId, recommendations, ttl = CACHE_CONFIG.RECOMMENDATIONS_TTL) {
    const key = `${CACHE_CONFIG.PREFIXES.RECOMMENDATION}${userId}`;
    return await this.set(key, recommendations, ttl);
  }

  async delRecommendations(userId) {
    const key = `${CACHE_CONFIG.PREFIXES.RECOMMENDATION}${userId}`;
    return await this.del(key);
  }

  // Métodos específicos para búsquedas
  async getSearchResults(query, filters = {}) {
    const filterKey = Object.keys(filters).length > 0 ? 
      `_${JSON.stringify(filters)}` : '';
    const key = `${CACHE_CONFIG.PREFIXES.SEARCH}${query}${filterKey}`;
    return await this.get(key);
  }

  async setSearchResults(query, results, filters = {}, ttl = CACHE_CONFIG.DEFAULT_TTL) {
    const filterKey = Object.keys(filters).length > 0 ? 
      `_${JSON.stringify(filters)}` : '';
    const key = `${CACHE_CONFIG.PREFIXES.SEARCH}${query}${filterKey}`;
    return await this.set(key, results, ttl);
  }

  // Método para invalidar caché relacionado con un producto
  async invalidateProductCache(productId) {
    const patterns = [
      `${CACHE_CONFIG.PREFIXES.PRODUCT}${productId}`,
      `${CACHE_CONFIG.PREFIXES.SEARCH}*`,
      `${CACHE_CONFIG.PREFIXES.RECOMMENDATION}*`
    ];

    for (const pattern of patterns) {
      await this.delPattern(pattern);
    }
  }

  // Método para invalidar caché relacionado con una categoría
  async invalidateCategoryCache(categoryId) {
    const patterns = [
      `${CACHE_CONFIG.PREFIXES.CATEGORY}${categoryId}`,
      `${CACHE_CONFIG.PREFIXES.PRODUCT}*`,
      `${CACHE_CONFIG.PREFIXES.SEARCH}*`
    ];

    for (const pattern of patterns) {
      await this.delPattern(pattern);
    }
  }

  // Método para obtener estadísticas del caché
  async getStats() {
    if (!this.isConnected) {
      return null;
    }

    try {
      const info = await this.client.info('memory');
      const keyspace = await this.client.info('keyspace');
      
      return {
        connected: this.isConnected,
        memory: info,
        keyspace: keyspace,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas de caché:', error.message);
      return null;
    }
  }

  // Método para limpiar todo el caché
  async flushAll() {
    if (!this.isConnected) {
      return false;
    }

    try {
      await this.client.flushall();
      console.log('✅ Caché limpiado completamente');
      return true;
    } catch (error) {
      console.error('❌ Error limpiando caché:', error.message);
      return false;
    }
  }

  // Método para obtener todas las claves con un patrón
  async getKeys(pattern = '*') {
    if (!this.isConnected) {
      return [];
    }

    try {
      return await this.client.keys(pattern);
    } catch (error) {
      console.error(`❌ Error obteniendo claves con patrón ${pattern}:`, error.message);
      return [];
    }
  }
}

// Crear instancia singleton del servicio de caché
const cacheService = new CacheService();

export default cacheService;
