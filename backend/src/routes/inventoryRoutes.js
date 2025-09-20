import express from "express";
import rateLimit from "express-rate-limit";
import authMiddleware from "../middleware/authMiddleware.js";
import { requireAdmin, requireStockAccess } from "../middleware/roleMiddleware.js";
import { adminAuditMiddleware, stockAuditMiddleware, unauthorizedAccessMiddleware } from "../middleware/adminAuditMiddleware.js";
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

// Aplicar middleware de auditoría a todas las rutas
router.use(adminAuditMiddleware());
router.use(unauthorizedAccessMiddleware());

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

// Rutas que requieren autenticación y rol de administrador - con rate limiting
router.get("/", authMiddleware, requireAdmin, adminLimiter, getInventories);                    // GET /api/inventory
router.get("/stats", authMiddleware, requireAdmin, adminLimiter, getInventoryStats);            // GET /api/inventory/stats
router.get("/low-stock", authMiddleware, requireAdmin, adminLimiter, getLowStockProducts);      // GET /api/inventory/low-stock
router.get("/out-of-stock", authMiddleware, requireAdmin, adminLimiter, getOutOfStockProducts); // GET /api/inventory/out-of-stock
router.get("/:id", authMiddleware, requireAdmin, adminLimiter, getInventoryById);               // GET /api/inventory/:id
router.post("/", authMiddleware, requireAdmin, adminLimiter, createInventory);                  // POST /api/inventory
router.put("/:id", authMiddleware, requireAdmin, adminLimiter, updateInventory);                // PUT /api/inventory/:id
router.delete("/:id", authMiddleware, requireAdmin, adminLimiter, deleteInventory);             // DELETE /api/inventory/:id

// Rutas de operaciones de stock (requieren autenticación y permisos específicos de stock) - con rate limiting
router.post("/:id/restock", authMiddleware, requireStockAccess, stockAuditMiddleware(), adminLimiter, restockInventory);      // POST /api/inventory/:id/restock
router.post("/:id/reserve", authMiddleware, requireStockAccess, stockAuditMiddleware(), adminLimiter, reserveStock);          // POST /api/inventory/:id/reserve
router.post("/:id/release", authMiddleware, requireStockAccess, stockAuditMiddleware(), adminLimiter, releaseStock);          // POST /api/inventory/:id/release
router.post("/:id/sell", authMiddleware, requireStockAccess, stockAuditMiddleware(), adminLimiter, sellStock);                // POST /api/inventory/:id/sell

export default router;
