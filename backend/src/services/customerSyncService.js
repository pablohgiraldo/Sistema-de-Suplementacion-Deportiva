/**
 * Servicio de Sincronización de Customers
 * 
 * Maneja la sincronización automática entre órdenes y customers,
 * actualizando métricas y creando customers si no existen.
 */

import Customer from '../models/Customer.js';
import User from '../models/User.js';
import Product from '../models/Product.js'; // Importar para evitar errores de registro
import mongoose from 'mongoose';

/**
 * Sincroniza un customer después de que se crea/actualiza una orden
 * @param {ObjectId} userId - ID del usuario que hizo la orden
 * @param {Object} order - Objeto de la orden
 */
export async function syncCustomerAfterOrder(userId, order) {
    try {
        // Buscar o crear customer para este usuario
        let customer = await Customer.findOne({ user: userId });

        if (!customer) {
            // Si no existe, crear un nuevo customer automáticamente
            console.log(`📊 Creando nuevo customer para usuario: ${userId}`);
            customer = await createCustomerFromUser(userId);
        }

        // Actualizar métricas del customer desde todas sus órdenes
        await customer.updateMetricsFromOrders();

        // Agregar interacción de compra al historial
        if (order) {
            customer.addInteraction(
                'Compra',
                `Orden ${order.orderNumber} - $${order.total.toFixed(2)} USD`,
                {
                    orderId: order._id,
                    orderNumber: order.orderNumber,
                    total: order.total,
                    items: order.items.length
                }
            );

            // ==================== ACUMULAR PUNTOS DE LEALTAD ====================
            // Solo acumular puntos si la orden está pagada y no es una cancelación
            if (order.paymentStatus === 'paid' && order.status !== 'cancelled') {
                const loyaltyResult = customer.earnLoyaltyPoints(
                    order.total,
                    order._id,
                    `Compra - Orden ${order.orderNumber}`
                );

                if (loyaltyResult.success) {
                    console.log(`🎁 ${loyaltyResult.message} para customer ${customer.customerCode}`);
                } else {
                    console.log(`⚠️  No se acumularon puntos para orden ${order.orderNumber}: ${loyaltyResult.message}`);
                }
            }
        }

        await customer.save();

        console.log(`✅ Customer ${customer.customerCode} sincronizado exitosamente`);
        return customer;

    } catch (error) {
        console.error('❌ Error al sincronizar customer:', error);
        throw error;
    }
}

/**
 * Crea un customer automáticamente desde un usuario
 * @param {ObjectId} userId - ID del usuario
 */
export async function createCustomerFromUser(userId) {
    try {
        // Verificar que el usuario existe
        const user = await User.findById(userId);
        if (!user) {
            throw new Error(`Usuario ${userId} no encontrado`);
        }

        // Verificar que no exista ya un customer
        const existingCustomer = await Customer.findOne({ user: userId });
        if (existingCustomer) {
            return existingCustomer;
        }

        // Crear nuevo customer
        const customer = new Customer({
            user: userId,
            segment: 'Nuevo',
            loyaltyLevel: 'Bronce',
            status: 'Activo',
            acquisitionSource: 'Directo'
        });

        await customer.save();

        console.log(`✅ Customer creado automáticamente: ${customer.customerCode}`);
        return customer;

    } catch (error) {
        console.error('❌ Error al crear customer desde usuario:', error);
        throw error;
    }
}

/**
 * Actualiza las preferencias del customer basándose en sus compras
 * @param {ObjectId} userId - ID del usuario
 */
export async function updateCustomerPreferences(userId) {
    try {
        const customer = await Customer.findOne({ user: userId })
            .populate({
                path: 'orders',
                populate: {
                    path: 'items.product',
                    select: 'category brand'
                }
            });

        if (!customer || !customer.orders || customer.orders.length === 0) {
            return;
        }

        // Analizar categorías más compradas
        const categoryCount = {};
        const brandCount = {};

        customer.orders.forEach(order => {
            order.items.forEach(item => {
                if (item.product) {
                    // Contar categorías
                    if (item.product.category) {
                        categoryCount[item.product.category] =
                            (categoryCount[item.product.category] || 0) + item.quantity;
                    }

                    // Contar marcas
                    if (item.product.brand) {
                        brandCount[item.product.brand] =
                            (brandCount[item.product.brand] || 0) + item.quantity;
                    }
                }
            });
        });

        // Actualizar preferencias con las categorías y marcas más populares
        const topCategories = Object.entries(categoryCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([category]) => category);

        const topBrands = Object.entries(brandCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([brand]) => brand);

        customer.preferences.categories = topCategories;
        customer.preferences.brands = topBrands;

        await customer.save();

        console.log(`✅ Preferencias actualizadas para customer ${customer.customerCode}`);
        return customer;

    } catch (error) {
        console.error('❌ Error al actualizar preferencias del customer:', error);
        throw error;
    }
}

/**
 * Sincroniza todos los customers con sus órdenes
 */
export async function syncAllCustomers() {
    try {
        const customers = await Customer.find();
        const results = {
            total: customers.length,
            success: 0,
            errors: 0,
            details: []
        };

        for (const customer of customers) {
            try {
                await customer.updateMetricsFromOrders();
                await updateCustomerPreferences(customer.user);
                results.success++;
                results.details.push({
                    customerCode: customer.customerCode,
                    status: 'success'
                });
            } catch (error) {
                console.error(`❌ Error al sincronizar ${customer.customerCode}:`, error);
                results.errors++;
                results.details.push({
                    customerCode: customer.customerCode,
                    status: 'error',
                    error: error.message
                });
            }
        }

        console.log(`📊 Sincronización completada: ${results.success}/${results.total} exitosos`);
        return results;

    } catch (error) {
        console.error('❌ Error al sincronizar todos los customers:', error);
        throw error;
    }
}

/**
 * Crea customers para todos los usuarios que no tengan uno
 */
export async function createMissingCustomers() {
    try {
        // Obtener todos los usuarios
        const users = await User.find({ activo: true });

        // Obtener IDs de usuarios que ya tienen customer
        const existingCustomers = await Customer.find().select('user');
        const existingUserIds = new Set(
            existingCustomers.map(c => c.user.toString())
        );

        const results = {
            total: users.length,
            created: 0,
            existing: existingCustomers.length,
            errors: 0,
            details: []
        };

        for (const user of users) {
            const userIdStr = user._id.toString();

            if (existingUserIds.has(userIdStr)) {
                continue; // Ya tiene customer
            }

            try {
                const customer = await createCustomerFromUser(user._id);
                await customer.updateMetricsFromOrders();
                results.created++;
                results.details.push({
                    userId: user._id,
                    email: user.email,
                    customerCode: customer.customerCode,
                    status: 'created'
                });
            } catch (error) {
                console.error(`❌ Error al crear customer para usuario ${user.email}:`, error);
                results.errors++;
                results.details.push({
                    userId: user._id,
                    email: user.email,
                    status: 'error',
                    error: error.message
                });
            }
        }

        console.log(`📊 Customers creados: ${results.created} nuevos`);
        return results;

    } catch (error) {
        console.error('❌ Error al crear customers faltantes:', error);
        throw error;
    }
}

export default {
    syncCustomerAfterOrder,
    createCustomerFromUser,
    updateCustomerPreferences,
    syncAllCustomers,
    createMissingCustomers
};

