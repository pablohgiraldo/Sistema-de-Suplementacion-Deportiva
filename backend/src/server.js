// server.js
import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import { connectDB } from "./config/db.js";
import productRoutes from "./routes/productRoutes.js";

const app = express();

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
app.use(express.json());

// Healthcheck
app.get("/api/health", (_req, res) =>
  res.json({
    status: "OK",
    message: "Server is running",
    timestamp: new Date().toISOString(),
  })
);

// Rutas
app.use("/api/products", productRoutes);

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
    });
  } catch (error) {
    console.error("❌ Error al conectar con la base de datos:", error);
    process.exit(1);
  }
};

startServer();
