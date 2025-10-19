/**
 * Controlador de Loyalty (Lealtad)
 * 
 * Maneja las operaciones relacionadas con puntos de lealtad,
 * canje, acumulación y gestión del programa de fidelización.
 */

import Customer from '../models/Customer.js';
import { createCustomerFromUser } from '../services/customerSyncService.js';

/**
 * @desc    Obtener resumen de puntos de lealtad del usuario actual
 * @route   GET /api/loyalty/me
 * @access  Private
 */
export const getMyLoyaltyPoints = async (req, res) => {
    try {
        const userId = req.user.id;

        // Buscar o crear customer para este usuario
        let customer = await Customer.findOne({ user: userId });

        if (!customer) {
            customer = await createCustomerFromUser(userId);
        }

        // Obtener resumen de puntos
        const loyaltySummary = customer.getLoyaltyPointsSummary();

        res.status(200).json({
            success: true,
            data: {
                customerCode: customer.customerCode,
                loyaltyLevel: customer.loyaltyLevel,
                segment: customer.segment,
                ...loyaltySummary
            }
        });

    } catch (error) {
        console.error('Error al obtener puntos de lealtad:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener los puntos de lealtad',
            message: error.message
        });
    }
};

/**
 * @desc    Canjear puntos de lealtad por descuento
 * @route   POST /api/loyalty/redeem
 * @access  Private
 */
export const redeemLoyaltyPoints = async (req, res) => {
    try {
        const userId = req.user.id;
        const { pointsToRedeem } = req.body;

        // Validar input
        if (!pointsToRedeem || pointsToRedeem <= 0) {
            return res.status(400).json({
                success: false,
                error: 'La cantidad de puntos debe ser mayor a 0'
            });
        }

        if (!Number.isInteger(pointsToRedeem)) {
            return res.status(400).json({
                success: false,
                error: 'La cantidad de puntos debe ser un número entero'
            });
        }

        // Buscar customer
        let customer = await Customer.findOne({ user: userId });

        if (!customer) {
            return res.status(404).json({
                success: false,
                error: 'No tienes puntos de lealtad disponibles',
                message: 'Debes realizar al menos una compra para acumular puntos'
            });
        }

        // Verificar que tenga suficientes puntos
        if (customer.loyaltyPoints < pointsToRedeem) {
            return res.status(400).json({
                success: false,
                error: 'Puntos insuficientes',
                message: `Tienes ${customer.loyaltyPoints} puntos disponibles. Intentas canjear ${pointsToRedeem}.`,
                data: {
                    available: customer.loyaltyPoints,
                    requested: pointsToRedeem,
                    missing: pointsToRedeem - customer.loyaltyPoints
                }
            });
        }

        // Canjear puntos
        const redeemResult = customer.redeemLoyaltyPoints(
            pointsToRedeem,
            null, // orderId se agregará cuando se complete la orden
            'Pre-canje en checkout'
        );

        if (!redeemResult.success) {
            return res.status(400).json({
                success: false,
                error: 'Error al canjear puntos',
                message: redeemResult.message
            });
        }

        await customer.save();

        res.status(200).json({
            success: true,
            message: redeemResult.message,
            data: {
                pointsRedeemed: redeemResult.pointsRedeemed,
                discountAmount: redeemResult.discountAmount,
                newBalance: redeemResult.newBalance,
                customerCode: customer.customerCode,
                loyaltyLevel: customer.loyaltyLevel
            }
        });

    } catch (error) {
        console.error('Error al canjear puntos de lealtad:', error);
        res.status(500).json({
            success: false,
            error: 'Error al canjear puntos de lealtad',
            message: error.message
        });
    }
};

/**
 * @desc    Calcular descuento potencial por puntos (preview sin canjear)
 * @route   POST /api/loyalty/calculate-discount
 * @access  Private
 */
export const calculateDiscount = async (req, res) => {
    try {
        const userId = req.user.id;
        const { pointsToRedeem } = req.body;

        // Validar input
        if (!pointsToRedeem || pointsToRedeem <= 0) {
            return res.status(400).json({
                success: false,
                error: 'La cantidad de puntos debe ser mayor a 0'
            });
        }

        // Buscar customer
        const customer = await Customer.findOne({ user: userId });

        if (!customer) {
            return res.status(404).json({
                success: false,
                error: 'No tienes puntos de lealtad disponibles'
            });
        }

        // Verificar que tenga suficientes puntos
        if (customer.loyaltyPoints < pointsToRedeem) {
            return res.status(400).json({
                success: false,
                error: 'Puntos insuficientes',
                data: {
                    available: customer.loyaltyPoints,
                    requested: pointsToRedeem
                }
            });
        }

        // Calcular descuento sin canjear (preview)
        const dollarValuePerPoint = 0.01;
        const discountAmount = Math.round((pointsToRedeem * dollarValuePerPoint) * 100) / 100;

        res.status(200).json({
            success: true,
            data: {
                pointsToRedeem,
                discountAmount,
                remainingPoints: customer.loyaltyPoints - pointsToRedeem,
                conversionRate: dollarValuePerPoint,
                message: `${pointsToRedeem} puntos = $${discountAmount.toFixed(2)} USD de descuento`
            }
        });

    } catch (error) {
        console.error('Error al calcular descuento:', error);
        res.status(500).json({
            success: false,
            error: 'Error al calcular descuento',
            message: error.message
        });
    }
};

/**
 * @desc    Obtener historial de transacciones de puntos
 * @route   GET /api/loyalty/transactions
 * @access  Private
 */
export const getLoyaltyTransactions = async (req, res) => {
    try {
        const userId = req.user.id;
        const { limit = 20, page = 1 } = req.query;

        // Buscar customer
        const customer = await Customer.findOne({ user: userId })
            .select('loyaltyPoints loyaltyTransactions customerCode loyaltyLevel');

        if (!customer) {
            return res.status(404).json({
                success: false,
                error: 'No se encontró información de lealtad',
                data: {
                    transactions: [],
                    total: 0
                }
            });
        }

        // Paginar transacciones
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + parseInt(limit);
        const transactions = customer.loyaltyTransactions.slice(startIndex, endIndex);

        res.status(200).json({
            success: true,
            data: {
                currentBalance: customer.loyaltyPoints,
                customerCode: customer.customerCode,
                loyaltyLevel: customer.loyaltyLevel,
                transactions,
                pagination: {
                    total: customer.loyaltyTransactions.length,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(customer.loyaltyTransactions.length / limit)
                }
            }
        });

    } catch (error) {
        console.error('Error al obtener transacciones de lealtad:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener historial de transacciones',
            message: error.message
        });
    }
};

/**
 * @desc    Cancelar canje de puntos (reversar transacción)
 * @route   POST /api/loyalty/cancel-redeem
 * @access  Private
 */
export const cancelRedeem = async (req, res) => {
    try {
        const userId = req.user.id;
        const { points, reason = 'Cancelación de canje' } = req.body;

        if (!points || points <= 0) {
            return res.status(400).json({
                success: false,
                error: 'La cantidad de puntos debe ser mayor a 0'
            });
        }

        // Buscar customer
        const customer = await Customer.findOne({ user: userId });

        if (!customer) {
            return res.status(404).json({
                success: false,
                error: 'Cliente no encontrado'
            });
        }

        // Devolver puntos (ajuste positivo)
        const adjustResult = customer.adjustLoyaltyPoints(points, reason);

        await customer.save();

        res.status(200).json({
            success: true,
            message: 'Puntos restaurados exitosamente',
            data: {
                pointsRestored: adjustResult.pointsChanged,
                newBalance: adjustResult.newBalance
            }
        });

    } catch (error) {
        console.error('Error al cancelar canje de puntos:', error);
        res.status(500).json({
            success: false,
            error: 'Error al cancelar canje de puntos',
            message: error.message
        });
    }
};

export default {
    getMyLoyaltyPoints,
    redeemLoyaltyPoints,
    calculateDiscount,
    getLoyaltyTransactions,
    cancelRedeem
};

