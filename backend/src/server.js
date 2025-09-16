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

const app = express();

// Configuración de rate limiting (solo en producción)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // más permisivo en desarrollo
  message: {
    success: false,
    message: 'Demasiadas solicitudes desde esta IP, intenta de nuevo en 15 minutos.'
  }
});

// Middlewares de seguridad
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(limiter);

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
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/inventory", inventoryRoutes);

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
      console.log(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error("❌ Error al conectar con la base de datos:", error);
    process.exit(1);
  }
};

startServer();

export default app;