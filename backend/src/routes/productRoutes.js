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
import { sanitizeInput, validateContentType, detectCommonAttacks } from "../middleware/inputValidationMiddleware.js";
import {
    validateGetProducts,
    validateGetProductById,
    validateCreateProduct,
    validateUpdateProduct,
    validateDeleteProduct,
    validateSearchProducts
} from "../validators/productValidators.js";
import {
    validateProductSecurity,
    validateProductSearchSecurity,
    validateProductUpdateSecurity,
    handleValidationErrors
} from "../validators/enhancedProductValidators.js";

const router = express.Router();

// Aplicar middlewares de seguridad a todas las rutas
router.use(sanitizeInput);
router.use(detectCommonAttacks);

// Rutas públicas (no requieren autenticación)
router.get("/",
    productRateLimit,
    validateProductSearchSecurity,
    handleValidationErrors,
    validateGetProducts,
    getProducts
);

router.get("/search",
    productRateLimit,
    validateProductSearchSecurity,
    handleValidationErrors,
    validateSearchProducts,
    searchProducts
);

router.get("/:id",
    productRateLimit,
    validateGetProductById,
    getProductById
);

// Rutas protegidas (requieren autenticación)
router.post("/",
    authMiddleware,
    tokenExpirationMiddleware,
    tokenRefreshSuggestionMiddleware,
    adminRateLimit,
    validateContentType(['application/json']),
    validateProductSecurity,
    handleValidationErrors,
    validateCreateProduct,
    createProduct
);

router.put("/:id",
    authMiddleware,
    tokenExpirationMiddleware,
    tokenRefreshSuggestionMiddleware,
    adminRateLimit,
    validateContentType(['application/json']),
    validateProductUpdateSecurity,
    handleValidationErrors,
    validateUpdateProduct,
    updateProduct
);

router.delete("/:id",
    authMiddleware,
    tokenExpirationMiddleware,
    tokenRefreshSuggestionMiddleware,
    requireAdmin,
    adminRateLimit,
    validateDeleteProduct,
    deleteProduct
);

export default router;
