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
    getInventoryAlerts,
    // Métodos omnicanales
    getChannelDiscrepancies,
    updatePhysicalStock,
    updateDigitalStock,
    syncChannels,
    syncAllChannels,
    getOmnichannelStats,
    getLowPhysicalStockProducts,
    getLowDigitalStockProducts,
    getPendingSyncProducts
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

// ==================== RUTAS OMNICANALES ====================

// Rutas de consulta omnicanal (requieren autenticación y rol de administrador)
router.get("/omnichannel/stats", authMiddleware, requireAdmin, readLimiter, getOmnichannelStats);                    // GET /api/inventory/omnichannel/stats
router.get("/omnichannel/discrepancies", authMiddleware, requireAdmin, readLimiter, getChannelDiscrepancies);         // GET /api/inventory/omnichannel/discrepancies
router.get("/omnichannel/low-physical", authMiddleware, requireAdmin, readLimiter, getLowPhysicalStockProducts);     // GET /api/inventory/omnichannel/low-physical
router.get("/omnichannel/low-digital", authMiddleware, requireAdmin, readLimiter, getLowDigitalStockProducts);       // GET /api/inventory/omnichannel/low-digital
router.get("/omnichannel/pending-sync", authMiddleware, requireAdmin, readLimiter, getPendingSyncProducts);          // GET /api/inventory/omnichannel/pending-sync

// Rutas de sincronización omnicanal (requieren autenticación y rol de administrador)
router.post("/sync", authMiddleware, requireAdmin, adminLimiter, syncAllChannels);                                   // POST /api/inventory/sync
router.post("/:id/sync", authMiddleware, requireAdmin, adminLimiter, syncChannels);                                  // POST /api/inventory/:id/sync
router.put("/:id/physical-stock", authMiddleware, requireAdmin, adminLimiter, updatePhysicalStock);                 // PUT /api/inventory/:id/physical-stock
router.put("/:id/digital-stock", authMiddleware, requireAdmin, adminLimiter, updateDigitalStock);                     // PUT /api/inventory/:id/digital-stock

export default router;
