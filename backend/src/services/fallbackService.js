/**
 * Servicio de Fallback para cuando MongoDB no está disponible
 * Mantiene datos críticos en memoria y caché para operación degradada
 */

import cacheService from './cacheService.js';
import { CACHE_CONFIG } from '../config/redis.js';

class FallbackService {
  constructor() {
    // Almacenamiento en memoria para datos críticos
    this.memoryCache = {
      products: new Map(),
      categories: new Map(),
      orders: new Map(),
      users: new Map(),
      lastSync: null
    };
    
    this.isMongoDBAvailable = true;
    this.lastMongoDBCheck = Date.now();
    this.failureCount = 0;
    this.maxFailures = 3; // Después de 3 fallos, activar modo fallback
    this.checkInterval = 30000; // 30 segundos entre verificaciones
  }

  /**
   * Verificar si MongoDB está disponible
   */
  checkMongoDBStatus(isAvailable) {
    const previousStatus = this.isMongoDBAvailable;
    this.isMongoDBAvailable = isAvailable;
    this.lastMongoDBCheck = Date.now();

    if (!isAvailable) {
      this.failureCount++;
      console.warn(`⚠️ MongoDB no disponible (${this.failureCount}/${this.maxFailures})`);
      
      if (this.failureCount >= this.maxFailures && previousStatus) {
        console.error('🚨 MODO FALLBACK ACTIVADO - MongoDB no disponible');
        this.activateFallbackMode();
      }
    } else {
      if (this.failureCount > 0 || !previousStatus) {
        console.log('✅ MongoDB disponible nuevamente');
        this.failureCount = 0;
        if (!previousStatus) {
          this.deactivateFallbackMode();
        }
      }
    }

    return this.isMongoDBAvailable;
  }

  /**
   * Activar modo fallback
   */
  activateFallbackMode() {
    console.log('📦 Activando modo fallback...');
    console.log('   - Usando datos de caché Redis');
    console.log('   - Usando datos de memoria');
    console.log('   - Operaciones de escritura en cola');
    // Aquí podrías enviar alertas, notificaciones, etc.
  }

  /**
   * Desactivar modo fallback
   */
  deactivateFallbackMode() {
    console.log('✅ Desactivando modo fallback - MongoDB restaurado');
    // Sincronizar datos pendientes si los hay
    this.syncPendingData();
  }

  /**
   * Verificar si está en modo fallback
   */
  isInFallbackMode() {
    return !this.isMongoDBAvailable || this.failureCount >= this.maxFailures;
  }

  /**
   * Guardar datos críticos en memoria
   */
  async saveToMemory(collection, id, data) {
    try {
      if (!this.memoryCache[collection]) {
        this.memoryCache[collection] = new Map();
      }
      
      this.memoryCache[collection].set(id, {
        data: data,
        timestamp: Date.now()
      });
      
      // También intentar guardar en Redis si está disponible
      await cacheService.set(
        `fallback:${collection}:${id}`,
        data,
        CACHE_CONFIG.DEFAULT_TTL * 2 // TTL más largo para datos de fallback
      );
      
      return true;
    } catch (error) {
      console.error(`❌ Error guardando en memoria (${collection}:${id}):`, error.message);
      return false;
    }
  }

  /**
   * Obtener datos de memoria o caché
   */
  async getFromFallback(collection, id) {
    try {
      // 1. Intentar obtener de memoria
      if (this.memoryCache[collection]?.has(id)) {
        const cached = this.memoryCache[collection].get(id);
        console.log(`📦 Datos obtenidos de memoria: ${collection}:${id}`);
        return cached.data;
      }

      // 2. Intentar obtener de Redis
      const redisData = await cacheService.get(`fallback:${collection}:${id}`);
      if (redisData) {
        console.log(`📦 Datos obtenidos de Redis fallback: ${collection}:${id}`);
        return redisData;
      }

      // 3. Intentar obtener del caché normal
      const normalCache = await cacheService.get(`${CACHE_CONFIG.PREFIXES[collection.toUpperCase()]}${id}`);
      if (normalCache) {
        console.log(`📦 Datos obtenidos de caché normal: ${collection}:${id}`);
        return normalCache;
      }

      return null;
    } catch (error) {
      console.error(`❌ Error obteniendo datos de fallback (${collection}:${id}):`, error.message);
      return null;
    }
  }

  /**
   * Obtener listado de una colección desde fallback
   */
  async getListFromFallback(collection, filters = {}) {
    try {
      const items = [];

      // 1. Obtener de memoria
      if (this.memoryCache[collection]) {
        for (const [id, cached] of this.memoryCache[collection].entries()) {
          items.push(cached.data);
        }
      }

      // 2. Si no hay datos en memoria, intentar Redis
      if (items.length === 0) {
        const pattern = `fallback:${collection}:*`;
        const keys = await cacheService.getKeys(pattern);
        
        for (const key of keys) {
          const data = await cacheService.get(key);
          if (data) {
            items.push(data);
          }
        }
      }

      // 3. Si aún no hay datos, intentar caché normal
      if (items.length === 0) {
        const cacheKey = `${CACHE_CONFIG.PREFIXES[collection.toUpperCase()]}list`;
        const cachedList = await cacheService.get(cacheKey);
        if (cachedList) {
          return cachedList;
        }
      }

      console.log(`📦 ${items.length} items obtenidos de fallback para ${collection}`);
      return items;
    } catch (error) {
      console.error(`❌ Error obteniendo listado de fallback (${collection}):`, error.message);
      return [];
    }
  }

  /**
   * Sincronizar datos de productos críticos para fallback
   */
  async syncCriticalProducts(products) {
    try {
      for (const product of products) {
        await this.saveToMemory('products', product._id.toString(), product);
      }
      this.memoryCache.lastSync = Date.now();
      console.log(`✅ ${products.length} productos sincronizados para fallback`);
      return true;
    } catch (error) {
      console.error('❌ Error sincronizando productos:', error.message);
      return false;
    }
  }

  /**
   * Sincronizar datos pendientes cuando MongoDB vuelva
   */
  async syncPendingData() {
    // Implementar lógica de sincronización si hay operaciones pendientes
    console.log('🔄 Sincronizando datos pendientes...');
    // TODO: Implementar cola de operaciones pendientes
  }

  /**
   * Limpiar caché de memoria antigua
   */
  cleanOldMemoryCache(maxAge = 3600000) { // 1 hora por defecto
    const now = Date.now();
    let cleaned = 0;

    for (const [collection, cache] of Object.entries(this.memoryCache)) {
      if (cache instanceof Map) {
        for (const [id, cached] of cache.entries()) {
          if (now - cached.timestamp > maxAge) {
            cache.delete(id);
            cleaned++;
          }
        }
      }
    }

    if (cleaned > 0) {
      console.log(`🗑️ Limpiados ${cleaned} items antiguos de memoria`);
    }
  }

  /**
   * Obtener estadísticas del fallback
   */
  getStats() {
    const stats = {
      isMongoDBAvailable: this.isMongoDBAvailable,
      isInFallbackMode: this.isInFallbackMode(),
      failureCount: this.failureCount,
      lastCheck: new Date(this.lastMongoDBCheck).toISOString(),
      lastSync: this.memoryCache.lastSync ? new Date(this.memoryCache.lastSync).toISOString() : null,
      memoryCacheSize: {
        products: this.memoryCache.products.size,
        categories: this.memoryCache.categories.size,
        orders: this.memoryCache.orders.size,
        users: this.memoryCache.users.size
      }
    };

    return stats;
  }

  /**
   * Resetear contador de fallos
   */
  resetFailureCount() {
    this.failureCount = 0;
  }

  /**
   * Crear respuesta de modo degradado
   */
  createDegradedResponse(data, source = 'fallback') {
    return {
      success: true,
      data: data,
      degraded: true,
      source: source,
      message: 'Operando en modo degradado - MongoDB no disponible',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Crear respuesta de error para operaciones no disponibles
   */
  createUnavailableResponse(operation) {
    return {
      success: false,
      degraded: true,
      message: `Operación no disponible en modo degradado: ${operation}`,
      suggestion: 'Por favor, intenta más tarde cuando el servicio esté completamente operativo',
      timestamp: new Date().toISOString()
    };
  }
}

// Crear instancia singleton
const fallbackService = new FallbackService();

// Limpiar caché antigua periódicamente (cada 30 minutos)
setInterval(() => {
  fallbackService.cleanOldMemoryCache();
}, 1800000);

export default fallbackService;
