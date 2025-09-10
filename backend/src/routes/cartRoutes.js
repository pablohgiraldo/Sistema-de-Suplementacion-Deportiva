import express from 'express';
import {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
} from '../controllers/cartController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { tokenExpirationMiddleware, tokenRefreshSuggestionMiddleware } from '../middleware/tokenExpirationMiddleware.js';
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

// Rutas del carrito
router.get('/', validateGetCart, getCart);
router.post('/add', validateAddToCart, addToCart);
router.put('/item/:productId', validateUpdateCartItem, updateCartItem);
router.delete('/item/:productId', validateRemoveFromCart, removeFromCart);
router.delete('/clear', validateClearCart, clearCart);

export default router;
