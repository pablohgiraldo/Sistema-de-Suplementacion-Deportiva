import express from "express";
import rateLimit from "express-rate-limit";
import {
    getInventories,
    getInventoryById,
    getInventoryByProductId,
    createInventory,
    updateInventory,
    deleteInventory,
    restockInventory,
    reserveStock,
    releaseStock,
    sellStock,
    getLowStockProducts,
    getOutOfStockProducts,
    getInventoryStats
} from "../controllers/inventoryController.js";

const router = express.Router();

// Rate limiting para operaciones de administración
const adminLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: process.env.NODE_ENV === 'production' ? 50 : 1000, // más restrictivo para admin
    message: {
        success: false,
        message: 'Demasiadas solicitudes de administración, intenta de nuevo en 15 minutos.'
    }
});

// Rutas públicas (sin autenticación) - para mostrar stock en frontend
router.get("/product/:productId", getInventoryByProductId); // GET /api/inventory/product/:productId

// Rutas que requieren autenticación (administración) - con rate limiting
router.get("/", adminLimiter, getInventories);                    // GET /api/inventory
router.get("/stats", adminLimiter, getInventoryStats);            // GET /api/inventory/stats
router.get("/low-stock", adminLimiter, getLowStockProducts);      // GET /api/inventory/low-stock
router.get("/out-of-stock", adminLimiter, getOutOfStockProducts); // GET /api/inventory/out-of-stock
router.get("/:id", adminLimiter, getInventoryById);               // GET /api/inventory/:id
router.post("/", adminLimiter, createInventory);                  // POST /api/inventory
router.put("/:id", adminLimiter, updateInventory);                // PUT /api/inventory/:id
router.delete("/:id", adminLimiter, deleteInventory);             // DELETE /api/inventory/:id

// Rutas de operaciones de stock (requieren autenticación) - con rate limiting
router.post("/:id/restock", adminLimiter, restockInventory);      // POST /api/inventory/:id/restock
router.post("/:id/reserve", adminLimiter, reserveStock);          // POST /api/inventory/:id/reserve
router.post("/:id/release", adminLimiter, releaseStock);          // POST /api/inventory/:id/release
router.post("/:id/sell", adminLimiter, sellStock);                // POST /api/inventory/:id/sell

export default router;
