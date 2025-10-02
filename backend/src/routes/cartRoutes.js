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

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);
router.use(tokenExpirationMiddleware);
router.use(tokenRefreshSuggestionMiddleware);
router.use(cartRateLimit);

// Rutas del carrito
router.get('/', validateGetCart, getCart);
router.post('/add', validateAddToCart, addToCart);
router.put('/item/:productId', validateUpdateCartItem, updateCartItem);
router.delete('/item/:productId', validateRemoveFromCart, removeFromCart);
router.delete('/clear', validateClearCart, clearCart);

// Rutas de validación de stock
router.get('/validate', validateGetCart, validateCartStock);
router.post('/sync', validateGetCart, syncCartWithInventory);

export default router;
