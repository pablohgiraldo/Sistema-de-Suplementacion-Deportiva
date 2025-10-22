import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import Inventory from '../models/Inventory.js';

// Obtener el carrito del usuario
export async function getCart(req, res) {
    try {
        const cart = await Cart.findOne({ user: req.user.id })
            .populate('items.product', 'name price imageUrl brand');

        if (!cart) {
            return res.json({
                success: true,
                data: {
                    items: [],
                    total: 0
                }
            });
        }

        // Filtrar productos que ya no existen (null después del populate)
        const validItems = cart.items.filter(item => item.product !== null);

        // Si hay items con productos eliminados, limpiar el carrito
        if (cart.items.length !== validItems.length) {
            cart.items = validItems;
            await cart.save();
        }

        // Transformar los items para que tengan la estructura esperada por el frontend
        const transformedItems = validItems.map(item => ({
            _id: item.product._id,
            name: item.product.name,
            price: item.product.price,
            imageUrl: item.product.imageUrl,
            brand: item.product.brand,
            quantity: item.quantity
        }));

        res.json({
            success: true,
            data: {
                items: transformedItems,
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

        // Obtener inventario del producto
        const inventory = await Inventory.findOne({ product: productId });
        if (!inventory) {
            return res.status(404).json({
                success: false,
                error: 'Producto no disponible en inventario'
            });
        }

        // Validar que el producto esté activo
        if (inventory.status !== 'active') {
            return res.status(400).json({
                success: false,
                error: `Producto no disponible. Estado: ${inventory.status}`
            });
        }

        // Validar stock disponible
        if (inventory.availableStock < quantity) {
            return res.status(400).json({
                success: false,
                error: `Stock insuficiente. Disponible: ${inventory.availableStock}, Solicitado: ${quantity}`,
                availableStock: inventory.availableStock,
                requestedQuantity: quantity
            });
        }

        // Buscar o crear carrito
        let cart = await Cart.findOne({ user: req.user.id });
        if (!cart) {
            cart = new Cart({ user: req.user.id, items: [] });
        }

        // Verificar si el producto ya está en el carrito
        const existingItem = cart.items.find(item => item.product.toString() === productId);
        const newQuantity = existingItem ? existingItem.quantity + quantity : quantity;

        // Validar stock total después de agregar
        if (inventory.availableStock < newQuantity) {
            return res.status(400).json({
                success: false,
                error: `Stock insuficiente para la cantidad total. Disponible: ${inventory.availableStock}, Total en carrito: ${newQuantity}`,
                availableStock: inventory.availableStock,
                currentCartQuantity: existingItem ? existingItem.quantity : 0,
                requestedQuantity: quantity
            });
        }

        // Agregar producto al carrito
        await cart.addItem(productId, quantity, product.price);

        // Obtener carrito actualizado con productos poblados
        const updatedCart = await Cart.findOne({ user: req.user.id })
            .populate('items.product', 'name price imageUrl brand');

        // Transformar los items para que tengan la estructura esperada por el frontend
        // Filtrar productos que ya no existen (null después del populate)
        const transformedItems = updatedCart.items
            .filter(item => item.product !== null)
            .map(item => ({
                _id: item.product._id,
                name: item.product.name,
                price: item.product.price,
                imageUrl: item.product.imageUrl,
                brand: item.product.brand,
                quantity: item.quantity
            }));

        res.json({
            success: true,
            message: 'Producto agregado al carrito',
            data: {
                items: transformedItems,
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

        // Si la cantidad es 0, eliminar el producto del carrito
        if (quantity === 0) {
            await cart.removeItem(productId);
        } else {
            // Validar stock disponible si se está aumentando la cantidad
            const inventory = await Inventory.findOne({ product: productId });
            if (!inventory) {
                return res.status(404).json({
                    success: false,
                    error: 'Producto no disponible en inventario'
                });
            }

            // Validar que el producto esté activo
            if (inventory.status !== 'active') {
                return res.status(400).json({
                    success: false,
                    error: `Producto no disponible. Estado: ${inventory.status}`
                });
            }

            // Validar stock disponible
            if (inventory.availableStock < quantity) {
                return res.status(400).json({
                    success: false,
                    error: `Stock insuficiente. Disponible: ${inventory.availableStock}, Solicitado: ${quantity}`,
                    availableStock: inventory.availableStock,
                    requestedQuantity: quantity
                });
            }
        }

        await cart.updateQuantity(productId, quantity);

        // Obtener carrito actualizado
        const updatedCart = await Cart.findOne({ user: req.user.id })
            .populate('items.product', 'name price imageUrl brand');

        // Transformar los items para que tengan la estructura esperada por el frontend
        // Filtrar productos que ya no existen (null después del populate)
        const transformedItems = updatedCart.items
            .filter(item => item.product !== null)
            .map(item => ({
                _id: item.product._id,
                name: item.product.name,
                price: item.product.price,
                imageUrl: item.product.imageUrl,
                brand: item.product.brand,
                quantity: item.quantity
            }));

        res.json({
            success: true,
            message: 'Carrito actualizado',
            data: {
                items: transformedItems,
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

        // Transformar los items para que tengan la estructura esperada por el frontend
        // Filtrar productos que ya no existen (null después del populate)
        const transformedItems = updatedCart.items
            .filter(item => item.product !== null)
            .map(item => ({
                _id: item.product._id,
                name: item.product.name,
                price: item.product.price,
                imageUrl: item.product.imageUrl,
                brand: item.product.brand,
                quantity: item.quantity
            }));

        res.json({
            success: true,
            message: 'Producto removido del carrito',
            data: {
                items: transformedItems,
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

// Validar stock de todos los productos en el carrito
export async function validateCartStock(req, res) {
    try {
        const cart = await Cart.findOne({ user: req.user.id })
            .populate('items.product', 'name price imageUrl brand');

        if (!cart || cart.items.length === 0) {
            return res.json({
                success: true,
                message: 'Carrito vacío',
                data: {
                    isValid: true,
                    items: [],
                    issues: []
                }
            });
        }

        const validationResults = [];
        const issues = [];

        // Validar cada producto en el carrito
        for (const item of cart.items) {
            // Saltar productos que ya no existen
            if (!item.product) continue;
            
            const inventory = await Inventory.findOne({ product: item.product._id });

            if (!inventory) {
                issues.push({
                    productId: item.product._id,
                    productName: item.product.name,
                    issue: 'Producto no disponible en inventario',
                    type: 'not_found'
                });
                continue;
            }

            if (inventory.status !== 'active') {
                issues.push({
                    productId: item.product._id,
                    productName: item.product.name,
                    issue: `Producto no disponible. Estado: ${inventory.status}`,
                    type: 'inactive'
                });
                continue;
            }

            if (inventory.availableStock < item.quantity) {
                issues.push({
                    productId: item.product._id,
                    productName: item.product.name,
                    issue: `Stock insuficiente. Disponible: ${inventory.availableStock}, En carrito: ${item.quantity}`,
                    type: 'insufficient_stock',
                    availableStock: inventory.availableStock,
                    requestedQuantity: item.quantity
                });
            }

            validationResults.push({
                productId: item.product._id,
                productName: item.product.name,
                quantity: item.quantity,
                availableStock: inventory.availableStock,
                status: inventory.status,
                isValid: inventory.status === 'active' && inventory.availableStock >= item.quantity
            });
        }

        const isValid = issues.length === 0;

        res.json({
            success: true,
            message: isValid ? 'Carrito válido' : 'Carrito tiene problemas de stock',
            data: {
                isValid,
                items: validationResults,
                issues,
                totalItems: cart.items.length,
                validItems: validationResults.filter(item => item.isValid).length,
                invalidItems: issues.length
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

// Sincronizar carrito con inventario (eliminar productos no disponibles)
export async function syncCartWithInventory(req, res) {
    try {
        const cart = await Cart.findOne({ user: req.user.id })
            .populate('items.product', 'name price imageUrl brand');

        if (!cart || cart.items.length === 0) {
            return res.json({
                success: true,
                message: 'Carrito vacío',
                data: {
                    items: [],
                    total: 0,
                    removedItems: []
                }
            });
        }

        const removedItems = [];
        const validItems = [];

        // Verificar cada producto en el carrito
        for (const item of cart.items) {
            // Si el producto ya no existe, agregarlo a removedItems
            if (!item.product) {
                removedItems.push({
                    productId: 'unknown',
                    productName: 'Producto eliminado',
                    quantity: item.quantity,
                    reason: 'Producto ya no existe en la base de datos'
                });
                continue;
            }
            
            const inventory = await Inventory.findOne({ product: item.product._id });

            if (!inventory || inventory.status !== 'active' || inventory.availableStock < item.quantity) {
                removedItems.push({
                    productId: item.product._id,
                    productName: item.product.name,
                    quantity: item.quantity,
                    reason: !inventory ? 'No disponible en inventario' :
                        inventory.status !== 'active' ? `Estado: ${inventory.status}` :
                            `Stock insuficiente (${inventory.availableStock} disponible)`
                });
            } else {
                validItems.push(item);
            }
        }

        // Actualizar carrito con solo los productos válidos
        cart.items = validItems;
        await cart.save();

        // Recalcular total
        cart.total = cart.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
        await cart.save();

        res.json({
            success: true,
            message: `Carrito sincronizado. ${removedItems.length} productos removidos`,
            data: {
                items: cart.items,
                total: cart.total,
                removedItems,
                validItemsCount: validItems.length,
                removedItemsCount: removedItems.length
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}
