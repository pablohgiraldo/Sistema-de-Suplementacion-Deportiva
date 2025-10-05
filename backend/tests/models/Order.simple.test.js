import mongoose from 'mongoose';
import Order from '../../src/models/Order.js';
import User from '../../src/models/User.js';
import Product from '../../src/models/Product.js';

describe('Order Model - Comprehensive Tests', () => {
    let testUser;
    let testProduct1;
    let testProduct2;

    beforeEach(async () => {
        // Create test user with unique email
        testUser = new User({
            nombre: 'Test User',
            email: `test-${Date.now()}@example.com`,
            contraseña: 'password123'
        });
        await testUser.save();

        // Create test products
        testProduct1 = new Product({
            name: 'Test Product 1',
            price: 29.99,
            stock: 100
        });
        await testProduct1.save();

        testProduct2 = new Product({
            name: 'Test Product 2',
            price: 49.99,
            stock: 50
        });
        await testProduct2.save();
    });

    const createValidOrderData = () => ({
        user: testUser._id,
        items: [
            {
                product: testProduct1._id,
                quantity: 2,
                price: 29.99,
                subtotal: 59.98
            },
            {
                product: testProduct2._id,
                quantity: 1,
                price: 49.99,
                subtotal: 49.99
            }
        ],
        subtotal: 109.97,
        tax: 10.99,
        shipping: 5.99,
        total: 126.95,
        paymentMethod: 'credit_card',
        shippingAddress: {
            firstName: 'John',
            lastName: 'Doe',
            street: '123 Main St',
            city: 'Bogotá',
            state: 'Cundinamarca',
            zipCode: '11001',
            country: 'Colombia',
            phone: '+573001234567'
        }
    });

    describe('Schema Validation', () => {
        test('should create a valid order with all required fields', async () => {
            const orderData = createValidOrderData();
            const order = new Order(orderData);
            const savedOrder = await order.save();

            expect(savedOrder._id).toBeDefined();
            expect(savedOrder.orderNumber).toBeDefined();
            expect(savedOrder.user.toString()).toBe(testUser._id.toString());
            expect(savedOrder.items).toHaveLength(2);
            expect(savedOrder.subtotal).toBe(109.97);
            expect(savedOrder.tax).toBe(10.99);
            expect(savedOrder.shipping).toBe(5.99);
            expect(savedOrder.total).toBeCloseTo(126.95, 2);
            expect(savedOrder.status).toBe('pending');
            expect(savedOrder.paymentStatus).toBe('pending');
            expect(savedOrder.paymentMethod).toBe('credit_card');
            expect(savedOrder.shippingAddress.firstName).toBe('John');
            expect(savedOrder.createdAt).toBeDefined();
            expect(savedOrder.updatedAt).toBeDefined();
        });

        test('should generate unique order number automatically', async () => {
            const order1 = new Order(createValidOrderData());
            const savedOrder1 = await order1.save();

            const order2 = new Order(createValidOrderData());
            const savedOrder2 = await order2.save();

            expect(savedOrder1.orderNumber).toBeDefined();
            expect(savedOrder2.orderNumber).toBeDefined();
            expect(savedOrder1.orderNumber).not.toBe(savedOrder2.orderNumber);
            expect(savedOrder1.orderNumber).toMatch(/^ORD-\d{6}$/);
            expect(savedOrder2.orderNumber).toMatch(/^ORD-\d{6}$/);
        });

        test('should require user field', async () => {
            const orderData = createValidOrderData();
            delete orderData.user;
            const order = new Order(orderData);

            await expect(order.save()).rejects.toThrow();
        });

        test('should require items array', async () => {
            const orderData = createValidOrderData();
            delete orderData.items;
            const order = new Order(orderData);

            await expect(order.save()).rejects.toThrow();
        });

        test('should require payment method', async () => {
            const orderData = createValidOrderData();
            delete orderData.paymentMethod;
            const order = new Order(orderData);

            await expect(order.save()).rejects.toThrow();
        });

        test('should validate payment method enum', async () => {
            const orderData = createValidOrderData();
            orderData.paymentMethod = 'invalid_method';
            const order = new Order(orderData);

            await expect(order.save()).rejects.toThrow();
        });

        test('should validate status enum', async () => {
            const orderData = createValidOrderData();
            const order = new Order(orderData);
            order.status = 'invalid_status';

            await expect(order.save()).rejects.toThrow();
        });

        test('should validate payment status enum', async () => {
            const orderData = createValidOrderData();
            const order = new Order(orderData);
            order.paymentStatus = 'invalid_status';

            await expect(order.save()).rejects.toThrow();
        });

        test('should require shipping address fields', async () => {
            const orderData = createValidOrderData();
            delete orderData.shippingAddress.firstName;
            const order = new Order(orderData);

            await expect(order.save()).rejects.toThrow();
        });

        test('should validate shipping address field lengths', async () => {
            const orderData = createValidOrderData();
            orderData.shippingAddress.firstName = 'A'.repeat(51);
            const order = new Order(orderData);

            await expect(order.save()).rejects.toThrow();
        });

        test('should validate item structure', async () => {
            const orderData = createValidOrderData();
            orderData.items[0].quantity = 0; // Invalid quantity
            const order = new Order(orderData);

            await expect(order.save()).rejects.toThrow();
        });

        test('should validate subtotal calculation', async () => {
            const orderData = createValidOrderData();
            orderData.items.forEach(item => {
                item.subtotal = item.price * item.quantity;
            });
            orderData.subtotal = 50; // Wrong subtotal
            const order = new Order(orderData);

            await expect(order.save()).rejects.toThrow();
        });
    });

    describe('Virtual Properties', () => {
        let order;

        beforeEach(async () => {
            const orderData = createValidOrderData();
            order = new Order(orderData);
            await order.save();
        });

        test('should calculate item count correctly', () => {
            expect(order.itemCount).toBe(3); // 2 + 1
        });

        test('should format status correctly', () => {
            expect(order.statusFormatted).toBe('Pendiente');

            order.status = 'processing';
            expect(order.statusFormatted).toBe('Procesando');

            order.status = 'shipped';
            expect(order.statusFormatted).toBe('Enviado');

            order.status = 'delivered';
            expect(order.statusFormatted).toBe('Entregado');

            order.status = 'cancelled';
            expect(order.statusFormatted).toBe('Cancelado');
        });

        test('should format payment status correctly', () => {
            expect(order.paymentStatusFormatted).toBe('Pendiente');

            order.paymentStatus = 'paid';
            expect(order.paymentStatusFormatted).toBe('Pagado');

            order.paymentStatus = 'failed';
            expect(order.paymentStatusFormatted).toBe('Fallido');

            order.paymentStatus = 'refunded';
            expect(order.paymentStatusFormatted).toBe('Reembolsado');
        });

        test('should format payment method correctly', () => {
            expect(order.paymentMethodFormatted).toBe('Tarjeta de Crédito');

            order.paymentMethod = 'paypal';
            expect(order.paymentMethodFormatted).toBe('PayPal');

            order.paymentMethod = 'pse';
            expect(order.paymentMethodFormatted).toBe('PSE - Pagos Seguros en Línea');
        });

        test('should format customer full name correctly', () => {
            expect(order.customerFullName).toBe('John Doe');
        });

        test('should format full shipping address correctly', () => {
            const expectedAddress = '123 Main St, Bogotá, Cundinamarca, 11001, Colombia';
            expect(order.fullShippingAddress).toBe(expectedAddress);
        });

        test('should format full billing address correctly when provided', () => {
            order.billingAddress = {
                firstName: 'Jane',
                lastName: 'Smith',
                street: '456 Oak Ave',
                city: 'Medellín',
                state: 'Antioquia',
                zipCode: '05001',
                country: 'Colombia',
                phone: '+57 300 987 6543'
            };

            const expectedAddress = '456 Oak Ave, Medellín, Antioquia, 05001, Colombia';
            expect(order.fullBillingAddress).toBe(expectedAddress);
        });

        test('should use shipping address when billing address is not provided', () => {
            expect(order.fullBillingAddress).toBe(order.fullShippingAddress);
        });

        test('should calculate time since created correctly', () => {
            expect(order.timeSinceCreated).toMatch(/\d+ (minutos|horas|días)/);
        });

        test('should determine if order can be cancelled', () => {
            expect(order.canBeCancelled).toBe(true);

            order.status = 'processing';
            expect(order.canBeCancelled).toBe(true);

            order.status = 'shipped';
            expect(order.canBeCancelled).toBe(false);

            order.status = 'delivered';
            expect(order.canBeCancelled).toBe(false);

            order.status = 'cancelled';
            expect(order.canBeCancelled).toBe(false);
        });

        test('should determine if order can be modified', () => {
            expect(order.canBeModified).toBe(true);

            order.status = 'processing';
            expect(order.canBeModified).toBe(false);

            order.status = 'shipped';
            expect(order.canBeModified).toBe(false);
        });

        test('should determine shipping status correctly', () => {
            expect(order.shippingStatus).toBe('Pendiente de procesamiento');

            order.status = 'processing';
            expect(order.shippingStatus).toBe('Preparando envío');

            order.status = 'shipped';
            expect(order.shippingStatus).toBe('En tránsito');

            order.status = 'delivered';
            expect(order.shippingStatus).toBe('Entregado');

            order.status = 'cancelled';
            expect(order.shippingStatus).toBe('Cancelado');
        });
    });

    describe('Pre-save Middleware', () => {
        test('should calculate item subtotals automatically', async () => {
            const orderData = createValidOrderData();
            // Remove subtotals to test automatic calculation
            orderData.items.forEach(item => delete item.subtotal);

            const order = new Order(orderData);
            const savedOrder = await order.save();

            expect(savedOrder.items[0].subtotal).toBeCloseTo(59.98, 2); // 2 * 29.99
            expect(savedOrder.items[1].subtotal).toBeCloseTo(49.99, 2); // 1 * 49.99
        });

        test('should calculate total automatically', async () => {
            const orderData = createValidOrderData();
            orderData.total = 0; // Will be recalculated

            const order = new Order(orderData);
            const savedOrder = await order.save();

            const expectedTotal = 109.97 + 10.99 + 5.99; // subtotal + tax + shipping
            expect(savedOrder.total).toBeCloseTo(expectedTotal, 2);
        });
    });

    describe('Order Methods', () => {
        let order;

        beforeEach(async () => {
            const orderData = createValidOrderData();
            order = new Order(orderData);
            await order.save();
        });

        describe('updateStatus method', () => {
            test('should update status to processing', async () => {
                const adminUserId = new mongoose.Types.ObjectId();
                await order.updateStatus('processing', adminUserId);

                expect(order.status).toBe('processing');
                expect(order.processedAt).toBeDefined();
                expect(order.processedBy.toString()).toBe(adminUserId.toString());
            });

            test('should update status to shipped', async () => {
                await order.updateStatus('shipped');

                expect(order.status).toBe('shipped');
                expect(order.shippedAt).toBeDefined();
            });

            test('should update status to delivered', async () => {
                await order.updateStatus('delivered');

                expect(order.status).toBe('delivered');
                expect(order.deliveredAt).toBeDefined();
            });
        });

        describe('updatePaymentStatus method', () => {
            test('should update payment status with details', async () => {
                const paymentDetails = {
                    transactionId: 'TXN123456',
                    amountPaid: 126.95,
                    paymentDate: new Date(),
                    cardLastFour: '1234',
                    cardBrand: 'visa'
                };

                await order.updatePaymentStatus('paid', paymentDetails);

                expect(order.paymentStatus).toBe('paid');
                expect(order.paymentDetails.transactionId).toBe('TXN123456');
                expect(order.paymentDetails.amountPaid).toBe(126.95);
                expect(order.paymentDetails.cardLastFour).toBe('1234');
                expect(order.paymentDetails.cardBrand).toBe('visa');
            });
        });

        describe('cancelOrder method', () => {
            test('should cancel order with reason', async () => {
                const adminUserId = new mongoose.Types.ObjectId();
                const reason = 'Customer requested cancellation';

                await order.cancelOrder(reason, adminUserId);

                expect(order.status).toBe('cancelled');
                expect(order.cancelledAt).toBeDefined();
                expect(order.cancellationReason).toBe(reason);
                expect(order.processedBy.toString()).toBe(adminUserId.toString());
            });
        });

        describe('processOrder method', () => {
            test('should process order', async () => {
                const adminUserId = new mongoose.Types.ObjectId();

                await order.processOrder(adminUserId);

                expect(order.status).toBe('processing');
                expect(order.processedBy.toString()).toBe(adminUserId.toString());
                expect(order.processedAt).toBeDefined();
            });
        });

        describe('markAsShipped method', () => {
            test('should mark order as shipped with tracking', async () => {
                const trackingNumber = 'TRK123456789';
                const carrier = 'DHL';
                const adminUserId = new mongoose.Types.ObjectId();

                await order.markAsShipped(trackingNumber, carrier, adminUserId);

                expect(order.status).toBe('shipped');
                expect(order.shippedAt).toBeDefined();
                expect(order.trackingNumber).toBe(trackingNumber);
                expect(order.carrier).toBe(carrier);
                expect(order.processedBy.toString()).toBe(adminUserId.toString());
            });
        });

        describe('markAsDelivered method', () => {
            test('should mark order as delivered', async () => {
                const adminUserId = new mongoose.Types.ObjectId();

                await order.markAsDelivered(adminUserId);

                expect(order.status).toBe('delivered');
                expect(order.deliveredAt).toBeDefined();
                expect(order.processedBy.toString()).toBe(adminUserId.toString());
            });
        });

        describe('processRefund method', () => {
            test('should process refund', async () => {
                const amount = 126.95;
                const reason = 'Defective product';
                const adminUserId = new mongoose.Types.ObjectId();

                await order.processRefund(amount, reason, adminUserId);

                expect(order.paymentStatus).toBe('refunded');
                expect(order.refundAmount).toBe(amount);
                expect(order.refundDate).toBeDefined();
                expect(order.refundReason).toBe(reason);
                expect(order.processedBy.toString()).toBe(adminUserId.toString());
            });
        });

        describe('getOrderSummary method', () => {
            test('should return comprehensive order summary', () => {
                const summary = order.getOrderSummary();

                expect(summary).toHaveProperty('orderNumber');
                expect(summary).toHaveProperty('customerName');
                expect(summary).toHaveProperty('total');
                expect(summary).toHaveProperty('status');
                expect(summary).toHaveProperty('paymentStatus');
                expect(summary).toHaveProperty('paymentMethod');
                expect(summary).toHaveProperty('itemCount');
                expect(summary).toHaveProperty('createdAt');
                expect(summary).toHaveProperty('timeSinceCreated');
                expect(summary).toHaveProperty('canBeCancelled');
                expect(summary).toHaveProperty('canBeModified');
                expect(summary).toHaveProperty('shippingStatus');

                expect(summary.orderNumber).toBe(order.orderNumber);
                expect(summary.customerName).toBe('John Doe');
                expect(summary.total).toBeCloseTo(126.95, 2);
                expect(summary.itemCount).toBe(3);
            });
        });

        describe('validateOrderData method', () => {
            test('should validate correct order data', () => {
                const errors = order.validateOrderData();
                expect(errors).toHaveLength(0);
            });

            test('should detect incorrect total calculation', () => {
                order.total = 100; // Wrong total
                const errors = order.validateOrderData();
                expect(errors.length).toBeGreaterThan(0);
                expect(errors.some(error => error.includes('total no coincide'))).toBe(true);
            });

            test('should detect empty items array', () => {
                order.items = [];
                const errors = order.validateOrderData();
                expect(errors.length).toBeGreaterThan(0);
                expect(errors.some(error => error.includes('al menos un producto'))).toBe(true);
            });

            test('should detect incorrect item subtotals', () => {
                order.items[0].subtotal = 100; // Wrong subtotal
                const errors = order.validateOrderData();
                expect(errors.length).toBeGreaterThan(0);
                expect(errors.some(error => error.includes('subtotal del item'))).toBe(true);
            });
        });
    });

    describe('Static Methods', () => {
        beforeEach(async () => {
            // Create multiple orders for statistics testing
            const orders = [
                { ...createValidOrderData(), total: 100, createdAt: new Date('2024-01-01') },
                { ...createValidOrderData(), total: 200, createdAt: new Date('2024-01-02') },
                { ...createValidOrderData(), total: 300, createdAt: new Date('2024-01-03') }
            ];

            for (const orderData of orders) {
                const order = new Order(orderData);
                await order.save();
            }
        });

        describe('getSalesStats method', () => {
            test('should return sales statistics', async () => {
                const stats = await Order.getSalesStats();

                expect(stats).toHaveProperty('totalOrders');
                expect(stats).toHaveProperty('totalRevenue');
                expect(stats).toHaveProperty('averageOrderValue');
                expect(stats).toHaveProperty('totalItemsSold');

                expect(stats.totalOrders).toBe(3);
                expect(stats.totalRevenue).toBe(600); // 100 + 200 + 300
                expect(stats.averageOrderValue).toBe(200);
            });

            test('should return sales statistics for date range', async () => {
                const startDate = '2024-01-01';
                const endDate = '2024-01-02';

                const stats = await Order.getSalesStats(startDate, endDate);

                expect(stats.totalOrders).toBe(2);
                expect(stats.totalRevenue).toBe(300); // 100 + 200
            });
        });

        describe('getSalesByPeriod method', () => {
            test('should return sales by day', async () => {
                const sales = await Order.getSalesByPeriod(null, null, 'day');

                expect(sales.length).toBeGreaterThan(0);
                expect(sales[0]).toHaveProperty('_id');
                expect(sales[0]).toHaveProperty('orders');
                expect(sales[0]).toHaveProperty('revenue');
                expect(sales[0]).toHaveProperty('itemsSold');
            });
        });
    });

    describe('Edge Cases and Error Handling', () => {
        test('should handle empty items array', async () => {
            const orderData = createValidOrderData();
            orderData.items = [];

            const order = new Order(orderData);
            await expect(order.save()).rejects.toThrow();
        });

        test('should handle very large order numbers', async () => {
            // Create many orders to test order number generation
            const orders = [];
            for (let i = 0; i < 10; i++) {
                const orderData = createValidOrderData();
                const order = new Order(orderData);
                orders.push(order);
            }

            await Promise.all(orders.map(order => order.save()));

            // Check that all orders have unique order numbers
            const orderNumbers = orders.map(order => order.orderNumber);
            const uniqueOrderNumbers = new Set(orderNumbers);
            expect(orderNumbers.length).toBe(uniqueOrderNumbers.size);
        });

        test('should handle decimal precision correctly', async () => {
            const orderData = createValidOrderData();
            orderData.items[0].price = 29.999;
            orderData.items[0].quantity = 3;

            const order = new Order(orderData);
            await order.save();

            expect(order.items[0].subtotal).toBeCloseTo(89.997, 3);
        });
    });
});
