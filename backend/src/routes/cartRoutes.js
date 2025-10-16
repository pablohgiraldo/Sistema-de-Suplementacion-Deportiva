import express from 'express';
import {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    validateCartStock,
    syncCartWithInventory
} from '../controllers/cartController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { tokenExpirationMiddleware, tokenRefreshSuggestionMiddleware } from '../middleware/tokenExpirationMiddleware.js';
import { cartRateLimit } from '../middleware/rateLimitMiddleware.js';
import {
    validateGetCart,
    validateAddToCart,
    validateUpdateCartItem,
    validateRemoveFromCart,
    validateClearCart
} from '../validators/cartValidators.js';
import {
    cartCacheMiddleware,
    invalidateCartCacheMiddleware
} from '../middleware/cacheMiddleware.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);
router.use(tokenExpirationMiddleware);
router.use(tokenRefreshSuggestionMiddleware);
router.use(cartRateLimit);

// Rutas del carrito
router.get('/', validateGetCart, cartCacheMiddleware(), getCart);
router.post('/add', validateAddToCart, addToCart, invalidateCartCacheMiddleware());
router.put('/item/:productId', validateUpdateCartItem, updateCartItem, invalidateCartCacheMiddleware());
router.delete('/item/:productId', validateRemoveFromCart, removeFromCart, invalidateCartCacheMiddleware());
router.delete('/clear', validateClearCart, clearCart, invalidateCartCacheMiddleware());

// Rutas de validación de stock
router.get('/validate', validateGetCart, cartCacheMiddleware(), validateCartStock);
router.post('/sync', validateGetCart, syncCartWithInventory, invalidateCartCacheMiddleware());

export default router;
