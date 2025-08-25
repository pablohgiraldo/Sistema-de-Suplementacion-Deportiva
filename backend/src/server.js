import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import { connectDB } from "./config/db.js";
import productRoutes from "./routes/productRoutes.js";

const app = express();

// Configuración CORS limpia
app.use(cors({
  origin: [
    process.env.CORS_ORIGIN || 'https://tu-frontend.vercel.app',
    'http://localhost:5173'
  ],
  credentials: true
}));

app.use(morgan("dev"));
app.use(express.json());

// Healthcheck
app.get("/api/health", (_req, res) => res.json({
  status: "OK",
  message: "Server is running",
  timestamp: new Date().toISOString()
}));

// Rutas
app.use("/api/products", productRoutes);

// Server + DB
const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI;

app.listen(PORT, '0.0.0.0', async () => {
  console.log(`🚀 API escuchando en puerto ${PORT}`);
  await connectDB(MONGODB_URI);
  console.log('✅ Base de datos conectada');
});
