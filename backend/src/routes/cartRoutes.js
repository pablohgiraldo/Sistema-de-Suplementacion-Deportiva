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

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);
router.use(tokenExpirationMiddleware);
router.use(tokenRefreshSuggestionMiddleware);

// Rutas del carrito
router.get('/', getCart);
router.post('/add', addToCart);
router.put('/item/:productId', updateCartItem);
router.delete('/item/:productId', removeFromCart);
router.delete('/clear', clearCart);

export default router;
