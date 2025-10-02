import express from 'express';
import {
    obtenerWishlist,
    agregarProducto,
    removerProducto,
    limpiarWishlist,
    verificarProducto
} from '../controllers/wishlistController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { tokenExpirationMiddleware, tokenRefreshSuggestionMiddleware } from '../middleware/tokenExpirationMiddleware.js';
import { wishlistRateLimit } from '../middleware/rateLimitMiddleware.js';
import {
    validateAddProduct,
    validateRemoveProduct,
    validateCheckProduct
} from '../validators/wishlistValidators.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);
router.use(tokenExpirationMiddleware);
router.use(tokenRefreshSuggestionMiddleware);
router.use(wishlistRateLimit);

// GET /api/wishlist - Obtener wishlist del usuario
router.get('/', obtenerWishlist);

// POST /api/wishlist/add - Agregar producto a wishlist
router.post('/add', validateAddProduct, agregarProducto);

// DELETE /api/wishlist/remove/:productId - Remover producto de wishlist
router.delete('/remove/:productId', validateRemoveProduct, removerProducto);

// DELETE /api/wishlist/clear - Limpiar wishlist
router.delete('/clear', limpiarWishlist);

// POST /api/wishlist/check - Verificar si producto está en wishlist
router.post('/check', validateCheckProduct, verificarProducto);

export default router;

