import Wishlist from '../models/Wishlist.js';
import Product from '../models/Product.js';

// GET /api/wishlist - Obtener wishlist del usuario
export const obtenerWishlist = async (req, res) => {
    try {
        const userId = req.user.id;

        // Obtener o crear wishlist
        const wishlist = await Wishlist.getOrCreate(userId);

        res.json({
            success: true,
            message: 'Wishlist obtenida exitosamente',
            data: {
                _id: wishlist._id,
                items: wishlist.items,
                itemCount: wishlist.itemCount,
                updatedAt: wishlist.updatedAt
            }
        });

    } catch (error) {
        console.error('Error al obtener wishlist:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// POST /api/wishlist/add - Agregar producto a wishlist
export const agregarProducto = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.body;

        // Validar que se proporcionó el ID del producto
        if (!productId) {
            return res.status(400).json({
                success: false,
                message: 'El ID del producto es requerido'
            });
        }

        // Verificar que el producto existe
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }

        // Obtener o crear wishlist
        const wishlist = await Wishlist.getOrCreate(userId);

        // Verificar si el producto ya está en la wishlist
        if (wishlist.hasProduct(productId)) {
            return res.status(400).json({
                success: false,
                message: 'El producto ya está en tu lista de deseos'
            });
        }

        // Agregar producto
        await wishlist.addProduct(productId);

        // Obtener wishlist actualizada con populate
        const updatedWishlist = await Wishlist.findById(wishlist._id).populate('items.product');

        res.json({
            success: true,
            message: 'Producto agregado a la lista de deseos',
            data: {
                _id: updatedWishlist._id,
                items: updatedWishlist.items,
                itemCount: updatedWishlist.itemCount,
                updatedAt: updatedWishlist.updatedAt
            }
        });

    } catch (error) {
        console.error('Error al agregar producto a wishlist:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// DELETE /api/wishlist/remove/:productId - Remover producto de wishlist
export const removerProducto = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.params;

        // Obtener wishlist
        const wishlist = await Wishlist.findOne({ user: userId });

        if (!wishlist) {
            return res.status(404).json({
                success: false,
                message: 'No tienes una lista de deseos'
            });
        }

        // Verificar si el producto está en la wishlist
        if (!wishlist.hasProduct(productId)) {
            return res.status(404).json({
                success: false,
                message: 'El producto no está en tu lista de deseos'
            });
        }

        // Remover producto
        await wishlist.removeProduct(productId);

        // Obtener wishlist actualizada con populate
        const updatedWishlist = await Wishlist.findById(wishlist._id).populate('items.product');

        res.json({
            success: true,
            message: 'Producto removido de la lista de deseos',
            data: {
                _id: updatedWishlist._id,
                items: updatedWishlist.items,
                itemCount: updatedWishlist.itemCount,
                updatedAt: updatedWishlist.updatedAt
            }
        });

    } catch (error) {
        console.error('Error al remover producto de wishlist:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// DELETE /api/wishlist/clear - Limpiar toda la wishlist
export const limpiarWishlist = async (req, res) => {
    try {
        const userId = req.user.id;

        // Obtener wishlist
        const wishlist = await Wishlist.findOne({ user: userId });

        if (!wishlist) {
            return res.status(404).json({
                success: false,
                message: 'No tienes una lista de deseos'
            });
        }

        // Limpiar wishlist
        await wishlist.clear();

        res.json({
            success: true,
            message: 'Lista de deseos limpiada exitosamente',
            data: {
                _id: wishlist._id,
                items: [],
                itemCount: 0,
                updatedAt: wishlist.updatedAt
            }
        });

    } catch (error) {
        console.error('Error al limpiar wishlist:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// POST /api/wishlist/check - Verificar si un producto está en la wishlist
export const verificarProducto = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.body;

        // Validar que se proporcionó el ID del producto
        if (!productId) {
            return res.status(400).json({
                success: false,
                message: 'El ID del producto es requerido'
            });
        }

        // Obtener wishlist
        const wishlist = await Wishlist.findOne({ user: userId });

        const inWishlist = wishlist ? wishlist.hasProduct(productId) : false;

        res.json({
            success: true,
            data: {
                inWishlist,
                productId
            }
        });

    } catch (error) {
        console.error('Error al verificar producto en wishlist:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

