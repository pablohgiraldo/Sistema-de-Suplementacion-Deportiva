import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import { connectDB } from "./config/db.js";
import productRoutes from "./routes/productRoutes.js";

const app = express();

// Seguridad CORS (ajusta en prod)
const allowedOrigin = process.env.CORS_ORIGIN || "*";
app.use(cors({ origin: allowedOrigin }));

app.use(morgan("dev"));
app.use(express.json());

// Healthcheck
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

// Rutas
app.use("/api/products", productRoutes);

// Server + DB
const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI;

app.listen(PORT, async () => {
  console.log(`🚀 API escuchando en http://localhost:${PORT}`);
  await connectDB(MONGODB_URI);
});
