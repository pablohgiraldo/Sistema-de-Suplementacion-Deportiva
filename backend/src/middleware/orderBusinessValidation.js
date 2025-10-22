import Cart from '../models/Cart.js';
import Inventory from '../models/Inventory.js';
import Product from '../models/Product.js';

// Middleware para validaciones de negocio específicas de órdenes
export const validateOrderBusinessRules = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { paymentMethod } = req.body;

        // 1. Validar que el usuario tenga un carrito con productos
        const cart = await Cart.findOne({ user: userId }).populate('items.product');

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'El carrito está vacío. Agrega productos al carrito antes de crear una orden.',
                code: 'EMPTY_CART'
            });
        }

        // 2. Validar stock disponible para todos los productos
        const stockValidation = [];
        const unavailableProducts = [];

        for (const item of cart.items) {
            const inventory = await Inventory.findOne({ product: item.product._id });

            if (!inventory) {
                unavailableProducts.push({
                    productId: item.product._id,
                    productName: item.product.name,
                    requested: item.quantity,
                    available: 0,
                    reason: 'Producto no encontrado en inventario'
                });
            } else if (inventory.availableStock < item.quantity) {
                unavailableProducts.push({
                    productId: item.product._id,
                    productName: item.product.name,
                    requested: item.quantity,
                    available: inventory.availableStock,
                    reason: 'Stock insuficiente'
                });
            }
        }

        if (unavailableProducts.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'Algunos productos no están disponibles en la cantidad solicitada',
                code: 'INSUFFICIENT_STOCK',
                details: unavailableProducts
            });
        }

        // 3. Validar que los productos estén activos (TEMPORALMENTE DESACTIVADO)
        // const inactiveProducts = [];
        // for (const item of cart.items) {
        //     if (!item.product.isActive) {
        //         inactiveProducts.push({
        //             productId: item.product._id,
        //             productName: item.product.name,
        //             reason: 'Producto desactivado'
        //         });
        //     }
        // }

        // if (inactiveProducts.length > 0) {
        //     return res.status(400).json({
        //         success: false,
        //         error: 'Algunos productos no están disponibles',
        //         code: 'INACTIVE_PRODUCTS',
        //         details: inactiveProducts
        //     });
        // }

        // 4. Validar límites de cantidad por producto
        const quantityViolations = [];
        for (const item of cart.items) {
            if (item.quantity > 10) {
                quantityViolations.push({
                    productId: item.product._id,
                    productName: item.product.name,
                    requested: item.quantity,
                    maxAllowed: 10,
                    reason: 'Cantidad excede el límite máximo por producto'
                });
            }
        }

        if (quantityViolations.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'Algunos productos exceden la cantidad máxima permitida',
                code: 'QUANTITY_LIMIT_EXCEEDED',
                details: quantityViolations
            });
        }

        // 5. Validar método de pago específico (TEMPORALMENTE DESACTIVADO)
        // if (paymentMethod === 'credit_card') {
        //     const { cardNumber, expiryDate, cvv } = req.body;

        //     if (!cardNumber || !expiryDate || !cvv) {
        //         return res.status(400).json({
        //             success: false,
        //             error: 'Datos de tarjeta de crédito incompletos',
        //             code: 'INCOMPLETE_CARD_DATA',
        //             details: {
        //                 cardNumber: !cardNumber ? 'Número de tarjeta requerido' : null,
        //                 expiryDate: !expiryDate ? 'Fecha de vencimiento requerida' : null,
        //                 cvv: !cvv ? 'CVV requerido' : null
        //             }
        //         });
        //     }
        // }

        // 6. Validar límites de orden (opcional - para prevenir abuso)
        const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
        if (totalItems > 50) {
            return res.status(400).json({
                success: false,
                error: 'La orden excede el límite máximo de productos (50 items)',
                code: 'ORDER_LIMIT_EXCEEDED',
                details: {
                    totalItems,
                    maxAllowed: 50
                }
            });
        }

        // 7. Validar valor mínimo de orden (opcional) - TEMPORALMENTE DESACTIVADO
        // const subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        // if (subtotal < 1000) { // $10.000 COP mínimo
        //     return res.status(400).json({
        //         success: false,
        //         error: 'El valor mínimo de la orden es $10.000 COP',
        //         code: 'MINIMUM_ORDER_VALUE',
        //         details: {
        //             currentSubtotal: subtotal,
        //             minimumRequired: 1000
        //         }
        //     });
        // }

        // Agregar información del carrito al request para uso posterior
        req.cart = cart;
        req.cartSubtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        next();

    } catch (error) {
        console.error('Error en validación de reglas de negocio:', error);
        return res.status(500).json({
            success: false,
            error: 'Error interno del servidor durante la validación',
            code: 'VALIDATION_ERROR'
        });
    }
};

// Middleware para validar datos de dirección específicos de Colombia
export const validateColombianAddress = (req, res, next) => {
    try {
        const { shippingAddress } = req.body;

        // Validar departamentos válidos de Colombia
        const validDepartments = [
            'Amazonas', 'Antioquia', 'Arauca', 'Atlántico', 'Bolívar', 'Boyacá',
            'Caldas', 'Caquetá', 'Casanare', 'Cauca', 'Cesar', 'Chocó', 'Córdoba',
            'Cundinamarca', 'Guainía', 'Guaviare', 'Huila', 'La Guajira', 'Magdalena',
            'Meta', 'Nariño', 'Norte de Santander', 'Putumayo', 'Quindío', 'Risaralda',
            'San Andrés y Providencia', 'Santander', 'Sucre', 'Tolima', 'Valle del Cauca',
            'Vaupés', 'Vichada'
        ];

        if (shippingAddress.country.toLowerCase() === 'colombia' &&
            !validDepartments.includes(shippingAddress.state)) {
            return res.status(400).json({
                success: false,
                error: 'Departamento inválido para Colombia',
                code: 'INVALID_DEPARTMENT',
                details: {
                    provided: shippingAddress.state,
                    validDepartments
                }
            });
        }

        // Validar formato de código postal colombiano
        if (shippingAddress.country.toLowerCase() === 'colombia') {
            const zipCode = shippingAddress.zipCode;
            if (!/^[0-9]{6}$/.test(zipCode)) {
                return res.status(400).json({
                    success: false,
                    error: 'Código postal inválido para Colombia (debe tener 6 dígitos)',
                    code: 'INVALID_ZIP_CODE',
                    details: {
                        provided: zipCode,
                        expectedFormat: 'XXXXXX (6 dígitos)'
                    }
                });
            }
        }

        next();

    } catch (error) {
        console.error('Error en validación de dirección colombiana:', error);
        return res.status(500).json({
            success: false,
            error: 'Error interno del servidor durante la validación de dirección',
            code: 'ADDRESS_VALIDATION_ERROR'
        });
    }
};

// Middleware para validar límites de usuario (prevenir abuso)
export const validateUserLimits = async (req, res, next) => {
    try {
        const userId = req.user.id;

        // Verificar órdenes pendientes del usuario (máximo 3 órdenes pendientes)
        const Order = (await import('../models/Order.js')).default;
        const pendingOrders = await Order.countDocuments({
            user: userId,
            status: { $in: ['pending', 'processing'] }
        });

        if (pendingOrders >= 3) {
            return res.status(400).json({
                success: false,
                error: 'Tienes demasiadas órdenes pendientes. Completa algunas órdenes antes de crear una nueva.',
                code: 'TOO_MANY_PENDING_ORDERS',
                details: {
                    pendingOrders,
                    maxAllowed: 3
                }
            });
        }

        // Verificar órdenes canceladas recientes (máximo 2 cancelaciones en las últimas 24 horas)
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const recentCancellations = await Order.countDocuments({
            user: userId,
            status: 'cancelled',
            updatedAt: { $gte: oneDayAgo }
        });

        if (recentCancellations >= 2) {
            return res.status(400).json({
                success: false,
                error: 'Has cancelado demasiadas órdenes recientemente. Espera 24 horas antes de crear una nueva orden.',
                code: 'TOO_MANY_RECENT_CANCELLATIONS',
                details: {
                    recentCancellations,
                    maxAllowed: 2,
                    waitTime: '24 horas'
                }
            });
        }

        next();

    } catch (error) {
        console.error('Error en validación de límites de usuario:', error);
        return res.status(500).json({
            success: false,
            error: 'Error interno del servidor durante la validación de límites',
            code: 'USER_LIMITS_VALIDATION_ERROR'
        });
    }
};
