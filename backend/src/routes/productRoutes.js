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
import { productRateLimit, adminRateLimit } from "../middleware/rateLimitMiddleware.js";
import {
    validateGetProducts,
    validateGetProductById,
    validateCreateProduct,
    validateUpdateProduct,
    validateDeleteProduct,
    validateSearchProducts
} from "../validators/productValidators.js";

const router = express.Router();

// Rutas públicas (no requieren autenticación)
router.get("/", productRateLimit, validateGetProducts, getProducts);
router.get("/search", productRateLimit, validateSearchProducts, searchProducts);
router.get("/:id", productRateLimit, validateGetProductById, getProductById);

// Rutas protegidas (requieren autenticación)
router.post("/", authMiddleware, tokenExpirationMiddleware, tokenRefreshSuggestionMiddleware, adminRateLimit, validateCreateProduct, createProduct);
router.put("/:id", authMiddleware, tokenExpirationMiddleware, tokenRefreshSuggestionMiddleware, adminRateLimit, validateUpdateProduct, updateProduct);
router.delete("/:id", authMiddleware, tokenExpirationMiddleware, tokenRefreshSuggestionMiddleware, requireAdmin, adminRateLimit, validateDeleteProduct, deleteProduct);

export default router;
