// server.js
import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { connectDB } from "./config/db.js";
import productRoutes from "./routes/productRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import alertRoutes from "./routes/alertRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import healthRoutes from "./routes/healthRoutes.js";
import schedulerRoutes from "./routes/schedulerRoutes.js";
import simpleAlertScheduler from "./services/simpleAlertScheduler.js";

const app = express();

// Configuración de rate limiting (solo en producción)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: process.env.NODE_ENV === 'production' ? 100 : 10000, // muy permisivo en desarrollo
  message: {
    success: false,
    message: 'Demasiadas solicitudes desde esta IP, intenta de nuevo en 15 minutos.'
  }
});

// Middlewares de seguridad
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting solo para rutas de autenticación
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: process.env.NODE_ENV === 'production' ? 50 : 1000, // más restrictivo para auth
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

// Configuración CORS
app.use(
  cors({
    origin: function (origin, callback) {
      // Permitir requests sin origin (como Postman, curl, etc.)
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        process.env.CORS_ORIGIN || "https://supergains-frontend.vercel.app",
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
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    optionsSuccessStatus: 200
  })
);

// Middlewares
app.use(morgan("dev"));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Healthcheck mejorado
app.get("/api/health", (_req, res) =>
  res.json({
    status: "OK",
    message: "Server is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    services: {
      database: "connected",
      auth: "active"
    }
  })
);

// Ruta raíz
app.get("/", (_req, res) => {
  res.json({
    message: "SuperGains API",
    version: "1.0.0",
    endpoints: {
      health: "/api/health",
      products: "/api/products",
      users: "/api/users"
    }
  });
});

// Rutas
app.use("/api/products", productRoutes); // Sin rate limiting para productos
app.use("/api/users", authLimiter, userRoutes); // Rate limiting para autenticación
app.use("/api/cart", cartLimiter, cartRoutes); // Rate limiting más permisivo para carrito

// Rutas de inventario - sin rate limiting para consultas públicas
app.use("/api/inventory", inventoryRoutes);

// Rutas de alertas - solo para administradores
app.use("/api/alerts", alertRoutes);

// Rutas de notificaciones - solo para administradores
app.use("/api/notifications", notificationRoutes);

// Rutas del scheduler - solo para administradores
app.use("/api/scheduler", schedulerRoutes);

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

// Conectar a la base de datos y levantar servidor
const startServer = async () => {
  try {
    await connectDB(MONGODB_URI);
    console.log("✅ Base de datos conectada");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 API escuchando en puerto ${PORT}`);
      console.log(`🌐 Endpoints disponibles:`);
      console.log(`   - GET  /api/health`);
      console.log(`   - *    /api/products/*`);
      console.log(`   - POST /api/users/register`);
      console.log(`   - POST /api/users/login`);
      console.log(`   - GET  /api/users/profile`);
      console.log(`   - *    /api/cart/*`);
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
    });
  } catch (error) {
    console.error("❌ Error al conectar con la base de datos:", error);
    process.exit(1);
  }
};

startServer();

export default app;