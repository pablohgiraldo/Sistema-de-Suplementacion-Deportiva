/**
 * Middleware para detectar fallos de MongoDB y activar modo fallback
 */

import mongoose from 'mongoose';
import fallbackService from '../services/fallbackService.js';

/**
 * Middleware para verificar estado de MongoDB
 */
export function checkDatabaseStatus(req, res, next) {
  try {
    const dbState = mongoose.connection.readyState;
    
    // Estados de mongoose:
    // 0 = disconnected
    // 1 = connected
    // 2 = connecting
    // 3 = disconnecting

    if (dbState === 1) {
      // MongoDB conectado
      fallbackService.checkMongoDBStatus(true);
      req.dbAvailable = true;
      req.fallbackMode = false;
    } else {
      // MongoDB no disponible
      fallbackService.checkMongoDBStatus(false);
      req.dbAvailable = false;
      req.fallbackMode = true;
      
      console.warn(`⚠️ Request a ${req.path} en modo fallback (DB state: ${dbState})`);
    }

    next();
  } catch (error) {
    console.error('❌ Error verificando estado de BD:', error.message);
    req.dbAvailable = false;
    req.fallbackMode = true;
    next();
  }
}

/**
 * Middleware para manejar errores de MongoDB y activar fallback
 */
export function handleDatabaseError(error, req, res, next) {
  // Verificar si es un error de MongoDB
  const isMongoError = 
    error.name === 'MongoError' ||
    error.name === 'MongoServerError' ||
    error.name === 'MongoNetworkError' ||
    error.message?.includes('mongo') ||
    error.message?.includes('ECONNREFUSED') ||
    error.message?.includes('connection');

  if (isMongoError) {
    console.error('🚨 Error de MongoDB detectado:', error.message);
    fallbackService.checkMongoDBStatus(false);
    
    // Intentar obtener datos de fallback
    return res.status(503).json({
      success: false,
      degraded: true,
      error: 'Database temporarily unavailable',
      message: 'El sistema está operando en modo degradado. Algunas funcionalidades pueden estar limitadas.',
      fallbackAvailable: true,
      timestamp: new Date().toISOString()
    });
  }

  // Si no es error de MongoDB, pasar al siguiente error handler
  next(error);
}

/**
 * Wrapper para funciones de controlador que manejan fallback automáticamente
 */
export function withFallback(controllerFn, fallbackFn = null) {
  return async (req, res, next) => {
    try {
      // Verificar estado de la BD
      const dbState = mongoose.connection.readyState;
      
      if (dbState !== 1) {
        // Base de datos no disponible
        fallbackService.checkMongoDBStatus(false);
        
        if (fallbackFn) {
          // Ejecutar función de fallback personalizada
          console.log(`📦 Ejecutando fallback para ${req.path}`);
          return await fallbackFn(req, res, next);
        } else {
          // Respuesta genérica de fallback
          return res.status(503).json(
            fallbackService.createUnavailableResponse(req.method + ' ' + req.path)
          );
        }
      }

      // Base de datos disponible, ejecutar controlador normal
      await controllerFn(req, res, next);
      
    } catch (error) {
      // Si hay error durante la ejecución
      const isMongoError = 
        error.name === 'MongoError' ||
        error.name === 'MongoServerError' ||
        error.name === 'MongoNetworkError';

      if (isMongoError && fallbackFn) {
        // Intentar fallback si hay error de MongoDB
        console.error('🚨 Error de MongoDB, intentando fallback:', error.message);
        fallbackService.checkMongoDBStatus(false);
        
        try {
          return await fallbackFn(req, res, next);
        } catch (fallbackError) {
          console.error('❌ Error en fallback también:', fallbackError.message);
          return res.status(503).json({
            success: false,
            error: 'Service temporarily unavailable',
            message: 'El servicio no está disponible temporalmente',
            timestamp: new Date().toISOString()
          });
        }
      }

      // Pasar error al siguiente middleware
      next(error);
    }
  };
}

/**
 * Middleware para operaciones solo lectura en modo fallback
 */
export function readOnlyInFallback(req, res, next) {
  if (req.fallbackMode && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    return res.status(503).json({
      success: false,
      degraded: true,
      error: 'Write operations not available',
      message: 'Las operaciones de escritura no están disponibles en modo degradado',
      suggestion: 'Por favor, intenta más tarde',
      timestamp: new Date().toISOString()
    });
  }
  
  next();
}

/**
 * Middleware para agregar headers de estado degradado
 */
export function addDegradedHeaders(req, res, next) {
  if (req.fallbackMode) {
    res.setHeader('X-Service-Status', 'degraded');
    res.setHeader('X-Fallback-Active', 'true');
  } else {
    res.setHeader('X-Service-Status', 'operational');
    res.setHeader('X-Fallback-Active', 'false');
  }
  
  next();
}

/**
 * Interceptor para respuestas que agrega información de fallback
 */
export function interceptResponse(req, res, next) {
  const originalJson = res.json.bind(res);
  
  res.json = function(data) {
    if (req.fallbackMode && data) {
      data.degraded = true;
      data.fallbackMode = true;
      data.message = data.message || 'Operando en modo degradado';
    }
    
    return originalJson(data);
  };
  
  next();
}

export default {
  checkDatabaseStatus,
  handleDatabaseError,
  withFallback,
  readOnlyInFallback,
  addDegradedHeaders,
  interceptResponse
};
