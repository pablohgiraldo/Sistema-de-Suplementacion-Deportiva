import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

// Obtener el carrito del usuario
export async function getCart(req, res) {
    try {
        const cart = await Cart.findOne({ user: req.user.id })
            .populate('items.product', 'name price imageUrl brand')
            .lean();

        if (!cart) {
            return res.json({
                success: true,
                data: {
                    items: [],
                    total: 0
                }
            });
        }

        res.json({
            success: true,
            data: {
                items: cart.items,
                total: cart.total
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

// Agregar producto al carrito
export async function addToCart(req, res) {
    try {
        const { productId, quantity = 1 } = req.body;

        // Validar que el producto existe
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                error: 'Producto no encontrado'
            });
        }

        // Validar stock
        if (product.stock < quantity) {
            return res.status(400).json({
                success: false,
                error: 'Stock insuficiente'
            });
        }

        // Buscar o crear carrito
        let cart = await Cart.findOne({ user: req.user.id });
        if (!cart) {
            cart = new Cart({ user: req.user.id, items: [] });
        }

        // Agregar producto al carrito
        await cart.addItem(productId, quantity, product.price);

        // Obtener carrito actualizado con productos poblados
        const updatedCart = await Cart.findOne({ user: req.user.id })
            .populate('items.product', 'name price imageUrl brand');

        res.json({
            success: true,
            message: 'Producto agregado al carrito',
            data: {
                items: updatedCart.items,
                total: updatedCart.total
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

// Actualizar cantidad de producto en el carrito
export async function updateCartItem(req, res) {
    try {
        const { productId } = req.params;
        const { quantity } = req.body;

        if (quantity < 0) {
            return res.status(400).json({
                success: false,
                error: 'La cantidad no puede ser negativa'
            });
        }

        const cart = await Cart.findOne({ user: req.user.id });
        if (!cart) {
            return res.status(404).json({
                success: false,
                error: 'Carrito no encontrado'
            });
        }

        await cart.updateQuantity(productId, quantity);

        // Obtener carrito actualizado
        const updatedCart = await Cart.findOne({ user: req.user.id })
            .populate('items.product', 'name price imageUrl brand');

        res.json({
            success: true,
            message: 'Carrito actualizado',
            data: {
                items: updatedCart.items,
                total: updatedCart.total
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

// Remover producto del carrito
export async function removeFromCart(req, res) {
    try {
        const { productId } = req.params;

        const cart = await Cart.findOne({ user: req.user.id });
        if (!cart) {
            return res.status(404).json({
                success: false,
                error: 'Carrito no encontrado'
            });
        }

        await cart.removeItem(productId);

        // Obtener carrito actualizado
        const updatedCart = await Cart.findOne({ user: req.user.id })
            .populate('items.product', 'name price imageUrl brand');

        res.json({
            success: true,
            message: 'Producto removido del carrito',
            data: {
                items: updatedCart.items,
                total: updatedCart.total
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

// Limpiar carrito
export async function clearCart(req, res) {
    try {
        const cart = await Cart.findOne({ user: req.user.id });
        if (!cart) {
            return res.status(404).json({
                success: false,
                error: 'Carrito no encontrado'
            });
        }

        await cart.clearCart();

        res.json({
            success: true,
            message: 'Carrito limpiado',
            data: {
                items: [],
                total: 0
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}
