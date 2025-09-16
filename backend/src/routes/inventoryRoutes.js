import express from "express";
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

// Rutas principales CRUD
router.get("/", getInventories);                    // GET /api/inventory
router.get("/stats", getInventoryStats);            // GET /api/inventory/stats
router.get("/low-stock", getLowStockProducts);      // GET /api/inventory/low-stock
router.get("/out-of-stock", getOutOfStockProducts); // GET /api/inventory/out-of-stock
router.get("/product/:productId", getInventoryByProductId); // GET /api/inventory/product/:productId
router.get("/:id", getInventoryById);               // GET /api/inventory/:id
router.post("/", createInventory);                  // POST /api/inventory
router.put("/:id", updateInventory);                // PUT /api/inventory/:id
router.delete("/:id", deleteInventory);             // DELETE /api/inventory/:id

// Rutas de operaciones de stock
router.post("/:id/restock", restockInventory);      // POST /api/inventory/:id/restock
router.post("/:id/reserve", reserveStock);          // POST /api/inventory/:id/reserve
router.post("/:id/release", releaseStock);          // POST /api/inventory/:id/release
router.post("/:id/sell", sellStock);                // POST /api/inventory/:id/sell

export default router;
