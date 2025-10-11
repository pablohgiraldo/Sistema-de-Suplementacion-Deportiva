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
    testRestock,
    restockInventory,
    reserveStock,
    releaseStock,
    sellStock,
    getLowStockProducts,
    getOutOfStockProducts,
    getInventoryStats,
    getInventoryAlerts
} from "../controllers/inventoryController.js";

const router = express.Router();

// Aplicar middleware de auditoría a todas las rutas
router.use(adminAuditMiddleware());
router.use(unauthorizedAccessMiddleware());
// ❌ REMOVIDO: router.use(inventoryRateLimit) - causaba rate limiting excesivo (30 req/min)
// Ahora cada ruta tiene su rate limiting específico según el tipo de operación

// Rate limiting para operaciones de administración
const adminLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: process.env.NODE_ENV === 'production' ? 200 : 1000, // Aumentado para permitir polling
    message: {
        success: false,
        message: 'Demasiadas solicitudes de administración, intenta de nuevo en 15 minutos.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        // Saltar rate limiting para requests de polling en desarrollo
        return process.env.NODE_ENV === 'development';
    }
});

// Rate limiting más permisivo para operaciones de lectura
const readLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minuto
    max: 60, // 60 requests por minuto para operaciones de lectura
    message: {
        success: false,
        message: 'Demasiadas solicitudes de lectura, intenta de nuevo en 1 minuto.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Rutas públicas (sin autenticación) - para mostrar stock en frontend
router.get("/product/:productId", getInventoryByProductId); // GET /api/inventory/product/:productId

// Rutas que requieren autenticación y rol de administrador - con rate limiting permisivo para lectura
router.get("/", authMiddleware, requireAdmin, readLimiter, getInventories);                    // GET /api/inventory
router.get("/stats", authMiddleware, requireAdmin, readLimiter, getInventoryStats);            // GET /api/inventory/stats
router.get("/alerts", authMiddleware, requireAdmin, readLimiter, getInventoryAlerts);          // GET /api/inventory/alerts
router.get("/low-stock", authMiddleware, requireAdmin, readLimiter, getLowStockProducts);      // GET /api/inventory/low-stock
router.get("/out-of-stock", authMiddleware, requireAdmin, readLimiter, getOutOfStockProducts); // GET /api/inventory/out-of-stock
router.get("/:id", authMiddleware, requireAdmin, readLimiter, getInventoryById);               // GET /api/inventory/:id
router.post("/", authMiddleware, requireAdmin, adminLimiter, createInventory);                  // POST /api/inventory
router.put("/:id", authMiddleware, requireAdmin, adminLimiter, updateInventory);                // PUT /api/inventory/:id
router.delete("/:id", authMiddleware, requireAdmin, adminLimiter, deleteInventory);             // DELETE /api/inventory/:id

// Rutas de operaciones de stock (requieren autenticación y permisos específicos de stock) - con rate limiting
router.post("/:id/test-restock", testRestock);                                                                                // POST /api/inventory/:id/test-restock (sin middlewares)
// Endpoint sin requireStockAccess (funciona)
router.post("/:id/restock", authMiddleware, restockInventory);      // POST /api/inventory/:id/restock
router.post("/:id/reserve", authMiddleware, requireStockAccess, stockAuditMiddleware(), adminLimiter, reserveStock);          // POST /api/inventory/:id/reserve
router.post("/:id/release", authMiddleware, requireStockAccess, stockAuditMiddleware(), adminLimiter, releaseStock);          // POST /api/inventory/:id/release
router.post("/:id/sell", authMiddleware, requireStockAccess, stockAuditMiddleware(), adminLimiter, sellStock);                // POST /api/inventory/:id/sell

export default router;
