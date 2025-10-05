import request from 'supertest';
import app from '../../src/server.js';
import Product from '../../src/models/Product.js';
import User from '../../src/models/User.js';
import Cart from '../../src/models/Cart.js';
import Order from '../../src/models/Order.js';
import Inventory from '../../src/models/Inventory.js';

describe('Orders Integration Tests', () => {
    let authToken;
    let adminToken;
    let testProduct1;
    let testProduct2;
    let testUser;

    const sampleUser = {
        nombre: 'Test User',
        email: 'test@example.com',
        contraseña: 'Password123!',
        confirmarContraseña: 'Password123!'
    };

    const adminUser = {
        nombre: 'Admin User',
        email: 'admin@example.com',
        contraseña: 'AdminPassword123!',
        confirmarContraseña: 'AdminPassword123!',
        rol: 'admin'
    };

    const sampleProducts = [
        {
            name: 'Whey Protein',
            brand: 'Optimum Nutrition',
            price: 89.99,
            stock: 50,
            description: 'Proteína de suero de leche',
            categories: ['Proteínas'],
            weightInGrams: 907
        },
        {
            name: 'Creatine Monohydrate',
            brand: 'MuscleTech',
            price: 29.99,
            stock: 25,
            description: 'Creatina monohidrato',
            categories: ['Creatina'],
            weightInGrams: 500
        }
    ];

    const sampleShippingAddress = {
        firstName: 'John',
        lastName: 'Doe',
        street: '123 Main St',
        city: 'Bogotá',
        state: 'Cundinamarca',
        zipCode: '11001',
        country: 'Colombia',
        phone: '+573001234567'
    };

    beforeAll(async () => {
        // Crear usuarios
        await request(app)
            .post('/api/users/register')
            .send(sampleUser);

        await request(app)
            .post('/api/users/register')
            .send(adminUser);

        // Obtener tokens de autenticación
        const userLoginResponse = await request(app)
            .post('/api/users/login')
            .send({
                email: sampleUser.email,
                contraseña: sampleUser.contraseña
            });

        const adminLoginResponse = await request(app)
            .post('/api/users/login')
            .send({
                email: adminUser.email,
                contraseña: adminUser.contraseña
            });

        authToken = userLoginResponse.body.token;
        adminToken = adminLoginResponse.body.token;
        testUser = userLoginResponse.body.user;
    });

    beforeEach(async () => {
        // Limpiar datos de prueba
        await Order.deleteMany({});
        await Cart.deleteMany({});
        await Product.deleteMany({});
        await Inventory.deleteMany({});

        // Crear productos de prueba
        testProduct1 = await Product.create(sampleProducts[0]);
        testProduct2 = await Product.create(sampleProducts[1]);

        // Crear inventario para los productos
        await Inventory.create([
            {
                product: testProduct1._id,
                currentStock: 50,
                availableStock: 50,
                minStock: 5,
                maxStock: 100
            },
            {
                product: testProduct2._id,
                currentStock: 25,
                availableStock: 25,
                minStock: 5,
                maxStock: 50
            }
        ]);
    });

    describe('POST /api/orders', () => {
        test('should create order successfully', async () => {
            // Crear carrito con productos
            await Cart.create({
                user: testUser._id,
                items: [
                    {
                        product: testProduct1._id,
                        quantity: 2,
                        price: testProduct1.price
                    },
                    {
                        product: testProduct2._id,
                        quantity: 1,
                        price: testProduct2.price
                    }
                ]
            });

            const orderData = {
                shippingAddress: sampleShippingAddress,
                paymentMethod: 'credit_card'
            };

            const response = await request(app)
                .post('/api/orders')
                .set('Authorization', `Bearer ${authToken}`)
                .send(orderData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain('Orden creada exitosamente');
            expect(response.body.data).toBeDefined();
            expect(response.body.data.items.length).toBe(2);
            expect(response.body.data.status).toBe('pending');
            expect(response.body.data.total).toBeCloseTo(209.97, 2);
        });

        test('should fail to create order without cart items', async () => {
            const orderData = {
                shippingAddress: sampleShippingAddress,
                paymentMethod: 'credit_card'
            };

            const response = await request(app)
                .post('/api/orders')
                .set('Authorization', `Bearer ${authToken}`)
                .send(orderData)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('No hay productos en el carrito');
        });

        test('should fail to create order with insufficient stock', async () => {
            // Crear carrito con cantidad mayor al stock disponible
            await Cart.create({
                user: testUser._id,
                items: [
                    {
                        product: testProduct1._id,
                        quantity: 100, // Más que el stock disponible
                        price: testProduct1.price
                    }
                ]
            });

            const orderData = {
                shippingAddress: sampleShippingAddress,
                paymentMethod: 'credit_card'
            };

            const response = await request(app)
                .post('/api/orders')
                .set('Authorization', `Bearer ${authToken}`)
                .send(orderData)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Stock insuficiente');
        });

        test('should fail to create order with invalid shipping address', async () => {
            await Cart.create({
                user: testUser._id,
                items: [
                    {
                        product: testProduct1._id,
                        quantity: 1,
                        price: testProduct1.price
                    }
                ]
            });

            const orderData = {
                shippingAddress: {
                    // Dirección incompleta
                    firstName: 'John'
                },
                paymentMethod: 'credit_card'
            };

            const response = await request(app)
                .post('/api/orders')
                .set('Authorization', `Bearer ${authToken}`)
                .send(orderData)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.errors).toBeDefined();
        });

        test('should fail to create order without authentication', async () => {
            const orderData = {
                shippingAddress: sampleShippingAddress,
                paymentMethod: 'credit_card'
            };

            const response = await request(app)
                .post('/api/orders')
                .send(orderData)
                .expect(401);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Token no proporcionado');
        });

        test('should clear cart after successful order creation', async () => {
            // Crear carrito con productos
            await Cart.create({
                user: testUser._id,
                items: [
                    {
                        product: testProduct1._id,
                        quantity: 1,
                        price: testProduct1.price
                    }
                ]
            });

            const orderData = {
                shippingAddress: sampleShippingAddress,
                paymentMethod: 'credit_card'
            };

            await request(app)
                .post('/api/orders')
                .set('Authorization', `Bearer ${authToken}`)
                .send(orderData)
                .expect(201);

            // Verificar que el carrito fue limpiado
            const cartResponse = await request(app)
                .get('/api/cart')
                .set('Authorization', `Bearer ${authToken}`);

            expect(cartResponse.body.data.items.length).toBe(0);
        });

        test('should update inventory after successful order creation', async () => {
            const initialStock = 50;

            // Crear carrito con productos
            await Cart.create({
                user: testUser._id,
                items: [
                    {
                        product: testProduct1._id,
                        quantity: 5,
                        price: testProduct1.price
                    }
                ]
            });

            const orderData = {
                shippingAddress: sampleShippingAddress,
                paymentMethod: 'credit_card'
            };

            await request(app)
                .post('/api/orders')
                .set('Authorization', `Bearer ${authToken}`)
                .send(orderData)
                .expect(201);

            // Verificar que el inventario fue actualizado
            const inventory = await Inventory.findOne({ product: testProduct1._id });
            expect(inventory.currentStock).toBe(initialStock - 5);
            expect(inventory.totalSold).toBe(5);
        });
    });

    describe('GET /api/orders', () => {
        beforeEach(async () => {
            // Crear órdenes de prueba
            await Order.create([
                {
                    user: testUser._id,
                    items: [
                        {
                            product: testProduct1._id,
                            quantity: 2,
                            price: testProduct1.price,
                            subtotal: testProduct1.price * 2
                        }
                    ],
                    subtotal: testProduct1.price * 2,
                    tax: (testProduct1.price * 2) * 0.1,
                    shipping: 5.99,
                    total: (testProduct1.price * 2) + ((testProduct1.price * 2) * 0.1) + 5.99,
                    status: 'completed',
                    shippingAddress: sampleShippingAddress,
                    paymentMethod: 'credit_card'
                },
                {
                    user: testUser._id,
                    items: [
                        {
                            product: testProduct2._id,
                            quantity: 1,
                            price: testProduct2.price,
                            subtotal: testProduct2.price
                        }
                    ],
                    subtotal: testProduct2.price,
                    tax: testProduct2.price * 0.1,
                    shipping: 5.99,
                    total: testProduct2.price + (testProduct2.price * 0.1) + 5.99,
                    status: 'pending',
                    shippingAddress: sampleShippingAddress,
                    paymentMethod: 'credit_card'
                }
            ]);
        });

        test('should get user orders successfully', async () => {
            const response = await request(app)
                .get('/api/orders')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.length).toBe(2);
            expect(response.body.data[0].user.toString()).toBe(testUser._id.toString());
        });

        test('should get orders with pagination', async () => {
            const response = await request(app)
                .get('/api/orders?page=1&limit=1')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.length).toBe(1);
            expect(response.body.pagination.page).toBe(1);
            expect(response.body.pagination.limit).toBe(1);
            expect(response.body.pagination.total).toBe(2);
        });

        test('should filter orders by status', async () => {
            const response = await request(app)
                .get('/api/orders?status=completed')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.length).toBe(1);
            expect(response.body.data[0].status).toBe('completed');
        });

        test('should fail to get orders without authentication', async () => {
            const response = await request(app)
                .get('/api/orders')
                .expect(401);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Token no proporcionado');
        });
    });

    describe('GET /api/orders/:id', () => {
        let testOrder;

        beforeEach(async () => {
            testOrder = await Order.create({
                user: testUser._id,
                items: [
                    {
                        product: testProduct1._id,
                        quantity: 2,
                        price: testProduct1.price,
                        subtotal: testProduct1.price * 2
                    }
                ],
                subtotal: testProduct1.price * 2,
                tax: (testProduct1.price * 2) * 0.1,
                shipping: 5.99,
                total: (testProduct1.price * 2) + ((testProduct1.price * 2) * 0.1) + 5.99,
                status: 'completed',
                shippingAddress: sampleShippingAddress,
                paymentMethod: 'credit_card'
            });
        });

        test('should get order by ID successfully', async () => {
            const response = await request(app)
                .get(`/api/orders/${testOrder._id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data._id.toString()).toBe(testOrder._id.toString());
            expect(response.body.data.user.toString()).toBe(testUser._id.toString());
        });

        test('should fail to get non-existent order', async () => {
            const fakeId = '507f1f77bcf86cd799439011';
            const response = await request(app)
                .get(`/api/orders/${fakeId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Orden no encontrada');
        });

        test('should fail to get order of another user', async () => {
            // Crear otro usuario y su orden
            const anotherUser = await User.create({
                nombre: 'Another User',
                email: 'another@example.com',
                contraseña: 'Password123!'
            });

            const anotherOrder = await Order.create({
                user: anotherUser._id,
                items: [
                    {
                        product: testProduct1._id,
                        quantity: 1,
                        price: testProduct1.price,
                        subtotal: testProduct1.price
                    }
                ],
                subtotal: testProduct1.price,
                tax: testProduct1.price * 0.1,
                shipping: 5.99,
                total: testProduct1.price + (testProduct1.price * 0.1) + 5.99,
                status: 'pending',
                shippingAddress: sampleShippingAddress,
                paymentMethod: 'credit_card'
            });

            const response = await request(app)
                .get(`/api/orders/${anotherOrder._id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(403);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('No tienes acceso a esta orden');
        });
    });

    describe('PUT /api/orders/:id/status', () => {
        let testOrder;

        beforeEach(async () => {
            testOrder = await Order.create({
                user: testUser._id,
                items: [
                    {
                        product: testProduct1._id,
                        quantity: 2,
                        price: testProduct1.price,
                        subtotal: testProduct1.price * 2
                    }
                ],
                subtotal: testProduct1.price * 2,
                tax: (testProduct1.price * 2) * 0.1,
                shipping: 5.99,
                total: (testProduct1.price * 2) + ((testProduct1.price * 2) * 0.1) + 5.99,
                status: 'pending',
                shippingAddress: sampleShippingAddress,
                paymentMethod: 'credit_card'
            });
        });

        test('should update order status successfully as admin', async () => {
            const response = await request(app)
                .put(`/api/orders/${testOrder._id}/status`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ status: 'shipped' })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain('Estado de orden actualizado');
            expect(response.body.data.status).toBe('shipped');
        });

        test('should fail to update order status as regular user', async () => {
            const response = await request(app)
                .put(`/api/orders/${testOrder._id}/status`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ status: 'shipped' })
                .expect(403);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Acceso denegado');
        });

        test('should fail to update with invalid status', async () => {
            const response = await request(app)
                .put(`/api/orders/${testOrder._id}/status`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ status: 'invalid_status' })
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.errors).toBeDefined();
        });
    });

    describe('GET /api/orders/admin/all', () => {
        beforeEach(async () => {
            // Crear órdenes de diferentes usuarios
            const user1 = await User.create({
                nombre: 'User 1',
                email: 'user1@example.com',
                contraseña: 'Password123!'
            });

            const user2 = await User.create({
                nombre: 'User 2',
                email: 'user2@example.com',
                contraseña: 'Password123!'
            });

            await Order.create([
                {
                    user: user1._id,
                    items: [{ product: testProduct1._id, quantity: 1, price: testProduct1.price, subtotal: testProduct1.price }],
                    subtotal: testProduct1.price,
                    tax: testProduct1.price * 0.1,
                    shipping: 5.99,
                    total: testProduct1.price + (testProduct1.price * 0.1) + 5.99,
                    status: 'pending',
                    shippingAddress: sampleShippingAddress,
                    paymentMethod: 'credit_card'
                },
                {
                    user: user2._id,
                    items: [{ product: testProduct2._id, quantity: 2, price: testProduct2.price, subtotal: testProduct2.price * 2 }],
                    subtotal: testProduct2.price * 2,
                    tax: (testProduct2.price * 2) * 0.1,
                    shipping: 5.99,
                    total: (testProduct2.price * 2) + ((testProduct2.price * 2) * 0.1) + 5.99,
                    status: 'completed',
                    shippingAddress: sampleShippingAddress,
                    paymentMethod: 'credit_card'
                }
            ]);
        });

        test('should get all orders as admin', async () => {
            const response = await request(app)
                .get('/api/orders/admin/all')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.length).toBe(2);
        });

        test('should fail to get all orders as regular user', async () => {
            const response = await request(app)
                .get('/api/orders/admin/all')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(403);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Acceso denegado');
        });
    });

    describe('Order Calculations', () => {
        test('should calculate order totals correctly', async () => {
            // Crear carrito con productos
            await Cart.create({
                user: testUser._id,
                items: [
                    {
                        product: testProduct1._id,
                        quantity: 2,
                        price: testProduct1.price
                    },
                    {
                        product: testProduct2._id,
                        quantity: 1,
                        price: testProduct2.price
                    }
                ]
            });

            const orderData = {
                shippingAddress: sampleShippingAddress,
                paymentMethod: 'credit_card'
            };

            const response = await request(app)
                .post('/api/orders')
                .set('Authorization', `Bearer ${authToken}`)
                .send(orderData)
                .expect(201);

            const order = response.body.data;
            const expectedSubtotal = (testProduct1.price * 2) + testProduct2.price;
            const expectedTax = expectedSubtotal * 0.1;
            const expectedShipping = 5.99;
            const expectedTotal = expectedSubtotal + expectedTax + expectedShipping;

            expect(order.subtotal).toBeCloseTo(expectedSubtotal, 2);
            expect(order.tax).toBeCloseTo(expectedTax, 2);
            expect(order.shipping).toBeCloseTo(expectedShipping, 2);
            expect(order.total).toBeCloseTo(expectedTotal, 2);
        });
    });
});
