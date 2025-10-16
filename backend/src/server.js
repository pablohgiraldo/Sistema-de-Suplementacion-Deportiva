// server.js
import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { connectDB, checkMongoDBHealth } from "./config/db.js";
import { createRedisClient, closeRedisConnection, checkRedisHealth } from "./config/redis.js";
import cacheService from "./services/cacheService.js";
import fallbackService from "./services/fallbackService.js";
import { configureSecurity } from "./middleware/securityMiddleware.js";
import {
  validateSecurityHeaders,
  validatePayloadSize,
  validateContentType,
  detectCommonAttacks,
  securityLogger
} from "./middleware/securityValidation.js";
import productRoutes from "./routes/productRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import alertRoutes from "./routes/alertRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import healthRoutes from "./routes/healthRoutes.js";
import schedulerRoutes from "./routes/schedulerRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import securityRoutes from "./routes/securityRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import recommendationRoutes from "./routes/recommendationRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import webhookRoutes from "./routes/webhookRoutes.js";
import automationRoutes from "./routes/automationRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import simpleAlertScheduler from "./services/simpleAlertScheduler.js";
import orderAutomationScheduler from "./services/orderAutomationScheduler.js";

const app = express();

// Configuración CORS ANTES de Helmet para evitar conflictos
app.use(
  cors({
    origin: function (origin, callback) {
      // Permitir requests sin origin (como Postman, curl, etc.)
      if (!origin) return callback(null, true);

      // En producción, permitir TODOS los orígenes para acceso público
      if (process.env.NODE_ENV === 'production') {
        callback(null, true);
      } else {
        // En desarrollo, solo orígenes específicos
        const allowedOrigins = [
          "http://localhost:5173",
          "http://localhost:5174",
          "http://localhost:4173",
          "http://localhost:3000",
          "http://127.0.0.1:5173",
          "http://127.0.0.1:5174",
          "http://127.0.0.1:3000"
        ];

        if (allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          console.log('CORS blocked origin:', origin);
          callback(new Error('No permitido por CORS'));
        }
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    optionsSuccessStatus: 200
  })
);

// Configuración de rate limiting (solo en producción)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: process.env.NODE_ENV === 'production' ? 100 : 10000, // muy permisivo en desarrollo
  message: {
    success: false,
    message: 'Demasiadas solicitudes desde esta IP, intenta de nuevo en 15 minutos.'
  }
});

// Configuración avanzada de seguridad con Helmet
const isDevelopment = process.env.NODE_ENV !== 'production';
configureSecurity(app, isDevelopment);

// Middlewares adicionales de validación de seguridad (temporalmente deshabilitados para desarrollo)
// app.use(validateSecurityHeaders);
// app.use(validatePayloadSize('10mb'));
// app.use(validateContentType(['application/json', 'multipart/form-data']));
// app.use(detectCommonAttacks);
// app.use(securityLogger);

// Rate limiting solo para rutas de autenticación
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: process.env.NODE_ENV === 'production' ? 20 : 1000, // 20 intentos balanceado para usuarios reales
  skipSuccessfulRequests: true, // No contar requests exitosos en el límite
  message: {
    success: false,
    message: 'Demasiadas solicitudes de autenticación, intenta de nuevo en 15 minutos.'
  }
});

// Rate limiting más permisivo para carrito
const cartLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: process.env.NODE_ENV === 'production' ? 200 : 50000, // muy permisivo para carrito en desarrollo
  message: {
    success: false,
    message: 'Demasiadas solicitudes de carrito, intenta de nuevo en 15 minutos.'
  }
});


// Middlewares
app.use(morgan("dev"));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Healthcheck mejorado con Redis y Fallback
app.get("/api/health", async (_req, res) => {
  const redisStatus = await checkRedisHealth();
  const cacheStats = await cacheService.getStats();
  const mongoHealth = checkMongoDBHealth();
  const fallbackStats = fallbackService.getStats();

  const isHealthy = mongoHealth.connected || fallbackService.isInFallbackMode();
  const statusCode = isHealthy ? 200 : 503;

  res.status(statusCode).json({
    status: isHealthy ? "OK" : "DEGRADED",
    message: fallbackService.isInFallbackMode() ?
      "Server running in fallback mode" :
      "Server is running normally",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    services: {
      database: mongoHealth.connected ? "connected" : "disconnected",
      databaseState: mongoHealth.stateName,
      auth: "active",
      cache: redisStatus ? "connected" : "disconnected",
      redis: redisStatus,
      fallback: fallbackService.isInFallbackMode() ? "active" : "inactive"
    },
    mongodb: mongoHealth,
    cache: cacheStats,
    fallback: fallbackStats,
    degraded: fallbackService.isInFallbackMode()
  });
});

// Ruta raíz
app.get("/", (_req, res) => {
  res.json({
    message: "SuperGains API",
    version: "1.0.0",
    endpoints: {
      health: "/api/health",
      products: "/api/products",
      users: "/api/users",
      recommendations: "/api/recommendations"
    }
  });
});

// Rutas
app.use("/api/products", productRoutes); // Sin rate limiting para productos
app.use("/api/users", authLimiter, userRoutes); // Rate limiting para autenticación
app.use("/api/cart", cartLimiter, cartRoutes); // Rate limiting más permisivo para carrito
app.use("/api/orders", orderRoutes); // Rutas de órdenes
app.use("/api/wishlist", wishlistRoutes); // Rutas de wishlist

// Rutas de inventario - sin rate limiting para consultas públicas
app.use("/api/inventory", inventoryRoutes);

// Rutas de alertas - solo para administradores
app.use("/api/alerts", alertRoutes);

// Rutas de seguridad - solo para administradores
app.use("/api/security", securityRoutes);

// Rutas de notificaciones - solo para administradores
app.use("/api/notifications", notificationRoutes);

// Rutas del scheduler - solo para administradores
app.use("/api/scheduler", schedulerRoutes);

// Rutas de CRM customers - solo para administradores
app.use("/api/customers", customerRoutes);

// Rutas de recomendaciones - sin rate limiting para recomendaciones públicas
app.use("/api/recommendations", recommendationRoutes);

// Rutas de pagos - incluye webhook público y endpoints autenticados
app.use("/api/payments", paymentRoutes);

// Rutas de webhooks - sistema de notificaciones automáticas
app.use("/api/webhooks", webhookRoutes);

// Rutas de automatizaciones - actualización automática de estados
app.use("/api/automations", automationRoutes);

// Dashboard omnicanal routes (solo administradores)
app.use("/api/dashboard", dashboardRoutes);

// Rutas de salud y monitoreo - sin rate limiting para pruebas de estrés
app.use("/api/health", healthRoutes);

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada',
    path: req.originalUrl
  });
});

// Manejo global de errores
app.use((error, req, res, next) => {
  console.error('❌ Error global:', error);

  // No enviar stack trace en producción
  const isDevelopment = process.env.NODE_ENV === 'development';

  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Error interno del servidor',
    ...(isDevelopment && { stack: error.stack })
  });
});

// Variables de entorno
const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI;

// Conectar a la base de datos, Redis y levantar servidor
const startServer = async () => {
  try {
    // Conectar a MongoDB
    await connectDB(MONGODB_URI);
    console.log("✅ Base de datos conectada");

    // Inicializar Redis
    try {
      createRedisClient();
      const redisStatus = await checkRedisHealth();
      if (redisStatus) {
        console.log("✅ Redis conectado exitosamente");
      } else {
        console.warn("⚠️ Redis no disponible - funcionando sin caché");
      }
    } catch (redisError) {
      console.warn("⚠️ Error conectando Redis:", redisError.message);
      console.warn("⚠️ Continuando sin caché...");
    }

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 API escuchando en puerto ${PORT}`);
      console.log(`🌐 Endpoints disponibles:`);
      console.log(`   - GET  /api/health`);
      console.log(`   - *    /api/products/*`);
      console.log(`   - POST /api/users/register`);
      console.log(`   - POST /api/users/login`);
      console.log(`   - GET  /api/users/profile`);
      console.log(`   - *    /api/cart/*`);
      console.log(`   - *    /api/wishlist/*`);
      console.log(`   - *    /api/orders/*`);
      console.log(`   - *    /api/inventory/*`);
      console.log(`   - *    /api/alerts/*`);
      console.log(`   - *    /api/notifications/*`);
      console.log(`   - *    /api/scheduler/*`);
      console.log(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`);

      // Iniciar scheduler de alertas automáticas
      simpleAlertScheduler.start();
      console.log(`🔔 Sistema de alertas automáticas: ACTIVADO`);
      console.log(`   ⏰ Verificando alertas cada 5 minutos`);
      console.log(`   📧 Notificaciones por email: ${process.env.EMAIL_NOTIFICATIONS_ENABLED === 'true' ? 'ACTIVADO' : 'DESACTIVADO'}`);

      // Iniciar scheduler de automatizaciones de órdenes
      orderAutomationScheduler.start();
      console.log(`🤖 Sistema de automatizaciones de órdenes: ACTIVADO`);
      console.log(`   ⏰ Ejecutando automatizaciones cada 60 minutos`);
      console.log(`   📦 Auto-entrega de órdenes enviadas hace +7 días`);
      console.log(`   ❌ Auto-cancelación de órdenes sin pago +24 horas`);
    });
  } catch (error) {
    console.error("❌ Error al conectar con la base de datos:", error);
    process.exit(1);
  }
};

startServer();

// Manejo de cierre graceful
process.on('SIGTERM', async () => {
  console.log('🛑 Recibida señal SIGTERM, cerrando servidor...');
  await closeRedisConnection();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 Recibida señal SIGINT, cerrando servidor...');
  await closeRedisConnection();
  process.exit(0);
});

export default app;