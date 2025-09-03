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

const app = express();

// Configuración de rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite de 100 requests por ventana de tiempo
  message: {
    success: false,
    message: 'Demasiadas solicitudes desde esta IP, intenta de nuevo en 15 minutos.'
  }
});

// Middlewares de seguridad
app.use(helmet());
app.use(limiter);

// Configuración CORS
app.use(
  cors({
    origin: [
      process.env.CORS_ORIGIN || "https://supergains-frontend.vercel.app", // dominio del frontend en Vercel
      "http://localhost:5173", // frontend local (vite, react, etc.)
    ],
    credentials: true,
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

// Rutas
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);

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
      console.log(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error("❌ Error al conectar con la base de datos:", error);
    process.exit(1);
  }
};

startServer();

export default app;