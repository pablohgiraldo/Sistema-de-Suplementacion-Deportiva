import express from "express";
import {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    searchProducts
} from "../controllers/productController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { requireAdmin, requireModerator } from "../middleware/roleMiddleware.js";
import { tokenExpirationMiddleware, tokenRefreshSuggestionMiddleware } from "../middleware/tokenExpirationMiddleware.js";

const router = express.Router();

// Rutas públicas (no requieren autenticación)
router.get("/", getProducts);
router.get("/search", searchProducts);
router.get("/:id", getProductById);

// Rutas protegidas (requieren autenticación)
router.post("/", authMiddleware, tokenExpirationMiddleware, tokenRefreshSuggestionMiddleware, createProduct);
router.put("/:id", authMiddleware, tokenExpirationMiddleware, tokenRefreshSuggestionMiddleware, updateProduct);
router.delete("/:id", authMiddleware, tokenExpirationMiddleware, tokenRefreshSuggestionMiddleware, requireAdmin, deleteProduct);

export default router;
