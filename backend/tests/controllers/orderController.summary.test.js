import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import Order from '../../src/models/Order.js';
import Product from '../../src/models/Product.js';
import User from '../../src/models/User.js';
import Inventory from '../../src/models/Inventory.js';
import { getOrdersSummary } from '../../src/controllers/orderController.js';

const createTestApp = () => {
    const app = express();
    app.use(express.json());
    app.get('/orders/summary', getOrdersSummary);
    return app;
};

const createUser = async (overrides = {}) => {
    const userData = {
        nombre: 'Usuario Prueba',
        email: `usuario${Date.now()}@example.com`,
        contraseña: 'password123',
        rol: 'admin',
        ...overrides
    };

    const user = new User(userData);
    await user.save();
    return user;
};

const createProduct = async (overrides = {}) => {
    const product = new Product({
        name: 'Producto de prueba',
        brand: 'SuperGains',
        price: 80,
        categories: ['suplemento'],
        ...overrides
    });
    await product.save();
    return product;
};

const createInventoryRecord = async (productId, overrides = {}) => {
    const inventory = new Inventory({
        product: productId,
        minStock: 10,
        maxStock: 200,
        reservedStock: 2,
        channels: {
            physical: {
                stock: 3,
                location: 'Bodega Central'
            },
            digital: {
                stock: 2,
                platform: 'website'
            }
        },
        ...overrides
    });
    await inventory.save();
    return inventory;
};

const createOrder = async ({ userId, items, subtotal, tax, shipping, total, overrides = {} }) => {
    const order = new Order({
        user: userId,
        items,
        subtotal,
        tax,
        shipping,
        total,
        status: 'delivered',
        paymentStatus: 'paid',
        paymentMethod: 'credit_card',
        salesChannel: 'online',
        shippingAddress: {
            firstName: 'Juan',
            lastName: 'Pérez',
            street: 'Calle 123',
            city: 'Bogotá',
            state: 'Cundinamarca',
            zipCode: '11001',
            country: 'Colombia',
            phone: '+573001234567'
        },
        ...overrides
    });
    await order.save();
    if (overrides.createdAt || overrides.updatedAt) {
        const updateFields = {};
        if (overrides.createdAt) updateFields.createdAt = overrides.createdAt;
        if (overrides.updatedAt) updateFields.updatedAt = overrides.updatedAt;
        await Order.updateOne({ _id: order._id }, { $set: updateFields });
        return Order.findById(order._id);
    }
    return order;
};

describe('GET /orders/summary', () => {
    let app;

    beforeEach(() => {
        app = createTestApp();
    });

    it('debería retornar métricas completas de ventas, productos, clientes e inventario', async () => {
        const userPrimary = await createUser({ nombre: 'Ana Gómez', email: 'ana@example.com' });
        const userSecondary = await createUser({ nombre: 'Carlos Díaz', email: 'carlos@example.com', rol: 'usuario' });

        const wheyProtein = await createProduct({ name: 'Whey Protein', brand: 'SuperGains Elite', price: 80 });
        const creatina = await createProduct({ name: 'Creatina Monohidratada', brand: 'SuperGains Pro', price: 40 });

        await createInventoryRecord(wheyProtein._id, {
            minStock: 10,
            channels: {
                physical: { stock: 3, location: 'Bodega Central' },
                digital: { stock: 2, platform: 'website' }
            }
        });

        await createInventoryRecord(creatina._id, {
            minStock: 5,
            channels: {
                physical: { stock: 30, location: 'Bodega Central' },
                digital: { stock: 20, platform: 'website' }
            }
        });

        await createOrder({
            userId: userPrimary._id,
            items: [
                { product: wheyProtein._id, quantity: 2, price: 80, subtotal: 160 },
                { product: creatina._id, quantity: 1, price: 40, subtotal: 40 }
            ],
            subtotal: 200,
            tax: 38,
            shipping: 5,
            total: 243
        });

        await createOrder({
            userId: userSecondary._id,
            items: [
                { product: creatina._id, quantity: 1, price: 40, subtotal: 40 }
            ],
            subtotal: 40,
            tax: 7.6,
            shipping: 5,
            total: 52.6,
            overrides: {
                paymentMethod: 'paypal'
            }
        });

        const response = await request(app)
            .get('/orders/summary')
            .expect(200);

        expect(response.body.success).toBe(true);
        const data = response.body.data;

        expect(data.summary.totalOrders).toBe(2);
        expect(data.summary.totalRevenue).toBeCloseTo(295.6, 2);
        expect(data.summary.averageOrderValue).toBeCloseTo(147.8, 1);

        expect(data.statusBreakdown.orders.delivered).toBe(2);
        expect(data.statusBreakdown.payments.paid).toBe(2);

        expect(Array.isArray(data.recentOrders)).toBe(true);
        expect(data.recentOrders.length).toBeGreaterThan(0);

        expect(Array.isArray(data.productPerformance)).toBe(true);
        expect(data.productPerformance.length).toBeGreaterThan(0);
        const topProduct = data.productPerformance[0];
        expect(topProduct.name).toBe('Whey Protein');
        expect(topProduct.totalQuantity).toBe(2);
        expect(topProduct.totalRevenue).toBeCloseTo(160, 2);

        expect(Array.isArray(data.customerPerformance)).toBe(true);
        expect(data.customerPerformance.length).toBeGreaterThan(0);
        const topCustomer = data.customerPerformance[0];
        expect(topCustomer.name).toBe('Ana Gómez');
        expect(topCustomer.totalOrders).toBe(1);
        expect(topCustomer.totalSpent).toBeCloseTo(243, 2);

        expect(data.inventory.summary.totalProducts).toBeGreaterThanOrEqual(2);
        expect(data.inventory.summary.lowStockProducts).toBeGreaterThanOrEqual(1);
        expect(Array.isArray(data.inventory.lowStock)).toBe(true);
        expect(data.inventory.lowStock.length).toBeGreaterThan(0);
        expect(data.inventory.lowStock[0].name).toBe('Whey Protein');
    });

    it('debería filtrar resultados por rango de fechas', async () => {
        const user = await createUser({ nombre: 'Lucía', email: 'lucia@example.com' });
        const product = await createProduct({ name: 'BCAA Recovery', price: 30 });
        await createInventoryRecord(product._id, {
            minStock: 5,
            channels: {
                physical: { stock: 10, location: 'Centro logístico' },
                digital: { stock: 5, platform: 'website' }
            }
        });

        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - 30);

        await createOrder({
            userId: user._id,
            items: [
                { product: product._id, quantity: 3, price: 30, subtotal: 90 }
            ],
            subtotal: 90,
            tax: 17.1,
            shipping: 5,
            total: 112.1,
            overrides: {
                createdAt: pastDate,
                updatedAt: pastDate
            }
        });

        const start = new Date();
        start.setDate(start.getDate() - 7);

        const response = await request(app)
            .get('/orders/summary')
            .query({
                startDate: start.toISOString().split('T')[0],
                endDate: new Date().toISOString().split('T')[0]
            })
            .expect(200);

        const data = response.body.data;
        expect(data.summary.totalOrders).toBe(0);
        expect(data.productPerformance.length).toBe(0);
        expect(data.customerPerformance.length).toBe(0);
    });
});

