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
import {
    productCacheMiddleware,
    searchCacheMiddleware,
    invalidateProductCacheMiddleware
} from "../middleware/cacheMiddleware.js";
import {
    checkDatabaseStatus,
    withFallback,
    readOnlyInFallback
} from "../middleware/databaseFallbackMiddleware.js";
import {
    getProductsFallback,
    getProductByIdFallback,
    searchProductsFallback,
    writeOperationFallback
} from "../controllers/fallbackControllers.js";

const router = express.Router();

// Aplicar middlewares de seguridad a todas las rutas
router.use(sanitizeInput);
router.use(detectCommonAttacks);

// Middleware para verificar estado de MongoDB
router.use(checkDatabaseStatus);

// Rutas públicas (no requieren autenticación)
router.get("/",
    productRateLimit,
    validateProductSearchSecurity,
    handleValidationErrors,
    validateGetProducts,
    productCacheMiddleware(),
    withFallback(getProducts, getProductsFallback)
);

router.get("/search",
    productRateLimit,
    validateProductSearchSecurity,
    handleValidationErrors,
    validateSearchProducts,
    searchCacheMiddleware(),
    withFallback(searchProducts, searchProductsFallback)
);

router.get("/:id",
    productRateLimit,
    validateGetProductById,
    productCacheMiddleware(),
    withFallback(getProductById, getProductByIdFallback)
);

// Rutas protegidas (requieren autenticación)
router.post("/",
    authMiddleware,
    tokenExpirationMiddleware,
    tokenRefreshSuggestionMiddleware,
    adminRateLimit,
    readOnlyInFallback,
    validateContentType(['application/json']),
    validateProductSecurity,
    handleValidationErrors,
    validateCreateProduct,
    withFallback(createProduct, writeOperationFallback),
    invalidateProductCacheMiddleware()
);

router.put("/:id",
    authMiddleware,
    tokenExpirationMiddleware,
    tokenRefreshSuggestionMiddleware,
    adminRateLimit,
    readOnlyInFallback,
    validateContentType(['application/json']),
    validateProductUpdateSecurity,
    handleValidationErrors,
    validateUpdateProduct,
    withFallback(updateProduct, writeOperationFallback),
    invalidateProductCacheMiddleware()
);

router.delete("/:id",
    authMiddleware,
    tokenExpirationMiddleware,
    tokenRefreshSuggestionMiddleware,
    requireAdmin,
    adminRateLimit,
    readOnlyInFallback,
    validateDeleteProduct,
    withFallback(deleteProduct, writeOperationFallback),
    invalidateProductCacheMiddleware()
);

export default router;
