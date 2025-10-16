import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

// Configuración de Redis
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  db: process.env.REDIS_DB || 0,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  keepAlive: 30000,
  connectTimeout: 10000,
  commandTimeout: 5000,
  // Configuración para producción
  ...(process.env.NODE_ENV === 'production' && {
    tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
    family: 4, // IPv4
  })
};

// Crear instancia de Redis
let redisClient = null;

export function createRedisClient() {
  if (redisClient) {
    return redisClient;
  }

  try {
    redisClient = new Redis(redisConfig);

    // Eventos de conexión
    redisClient.on('connect', () => {
      console.log('✅ Redis conectado exitosamente');
    });

    redisClient.on('ready', () => {
      console.log('✅ Redis listo para operaciones');
    });

    redisClient.on('error', (err) => {
      console.error('❌ Error de Redis:', err.message);
    });

    redisClient.on('close', () => {
      console.log('⚠️ Conexión Redis cerrada');
    });

    redisClient.on('reconnecting', () => {
      console.log('🔄 Reconectando a Redis...');
    });

    return redisClient;
  } catch (error) {
    console.error('❌ Error creando cliente Redis:', error.message);
    throw error;
  }
}

// Función para obtener el cliente Redis
export function getRedisClient() {
  if (!redisClient) {
    redisClient = createRedisClient();
  }
  return redisClient;
}

// Función para cerrar la conexión Redis
export async function closeRedisConnection() {
  if (redisClient) {
    try {
      await redisClient.quit();
      redisClient = null;
      console.log('✅ Conexión Redis cerrada correctamente');
    } catch (error) {
      console.error('❌ Error cerrando conexión Redis:', error.message);
    }
  }
}

// Función para verificar el estado de Redis
export async function checkRedisHealth() {
  try {
    const client = getRedisClient();
    const pong = await client.ping();
    return pong === 'PONG';
  } catch (error) {
    console.error('❌ Redis no está disponible:', error.message);
    return false;
  }
}

// Configuración de caché por defecto
export const CACHE_CONFIG = {
  // TTL por defecto (en segundos)
  DEFAULT_TTL: Number(process.env.CACHE_DEFAULT_TTL || 600), // 10 minutos

  // TTL específicos por tipo de dato
  PRODUCTS_TTL: Number(process.env.CACHE_PRODUCTS_TTL || 600), // 10 minutos
  CATEGORIES_TTL: Number(process.env.CACHE_CATEGORIES_TTL || 600), // 10 minutos
  USER_SESSION_TTL: Number(process.env.CACHE_USER_SESSION_TTL || 3600), // 1 hora
  CART_TTL: Number(process.env.CACHE_CART_TTL || 600), // 10 minutos
  RECOMMENDATIONS_TTL: Number(process.env.CACHE_RECOMMENDATIONS_TTL || 600), // 10 minutos

  // Prefijos para diferentes tipos de datos
  PREFIXES: {
    PRODUCT: 'product:',
    CATEGORY: 'category:',
    USER: 'user:',
    CART: 'cart:',
    SESSION: 'session:',
    RECOMMENDATION: 'recommendation:',
    SEARCH: 'search:',
    ORDER: 'order:'
  }
};

export default redisConfig;
