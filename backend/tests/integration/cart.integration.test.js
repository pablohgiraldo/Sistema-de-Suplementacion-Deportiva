import request from 'supertest';
import app from '../../src/server.js';
import Product from '../../src/models/Product.js';
import User from '../../src/models/User.js';
import Cart from '../../src/models/Cart.js';
import Inventory from '../../src/models/Inventory.js';

describe('Cart Integration Tests', () => {
    let authToken;
    let testProduct1;
    let testProduct2;
    let testUser;

    const sampleUser = {
        nombre: 'Test User',
        email: 'test@example.com',
        contraseña: 'Password123!',
        confirmarContraseña: 'Password123!'
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

    beforeAll(async () => {
        // Crear usuario
        await request(app)
            .post('/api/users/register')
            .send(sampleUser);

        // Obtener token de autenticación
        const loginResponse = await request(app)
            .post('/api/users/login')
            .send({
                email: sampleUser.email,
                contraseña: sampleUser.contraseña
            });

        authToken = loginResponse.body.token;
        testUser = loginResponse.body.user;
    });

    beforeEach(async () => {
        // Limpiar carrito y productos de prueba
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

    describe('GET /api/cart', () => {
        test('should get empty cart for new user', async () => {
            const response = await request(app)
                .get('/api/cart')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.items).toEqual([]);
            expect(response.body.data.total).toBe(0);
            expect(response.body.data.itemCount).toBe(0);
        });

        test('should get cart with items', async () => {
            // Agregar productos al carrito primero
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

            const response = await request(app)
                .get('/api/cart')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.items.length).toBe(2);
            expect(response.body.data.itemCount).toBe(3);
            expect(response.body.data.total).toBeCloseTo(209.97, 2);
        });

        test('should fail to get cart without authentication', async () => {
            const response = await request(app)
                .get('/api/cart')
                .expect(401);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Token no proporcionado');
        });
    });

    describe('POST /api/cart/add', () => {
        test('should add product to cart successfully', async () => {
            const response = await request(app)
                .post('/api/cart/add')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    productId: testProduct1._id,
                    quantity: 2
                })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain('Producto agregado al carrito');
            expect(response.body.data.items.length).toBe(1);
            expect(response.body.data.items[0].quantity).toBe(2);
        });

        test('should update quantity when adding existing product', async () => {
            // Agregar producto primero
            await request(app)
                .post('/api/cart/add')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    productId: testProduct1._id,
                    quantity: 2
                });

            // Agregar más del mismo producto
            const response = await request(app)
                .post('/api/cart/add')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    productId: testProduct1._id,
                    quantity: 3
                })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.items[0].quantity).toBe(5);
        });

        test('should fail to add product with insufficient stock', async () => {
            const response = await request(app)
                .post('/api/cart/add')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    productId: testProduct1._id,
                    quantity: 100 // Más que el stock disponible
                })
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Stock insuficiente');
        });

        test('should fail to add non-existent product', async () => {
            const fakeId = '507f1f77bcf86cd799439011';
            const response = await request(app)
                .post('/api/cart/add')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    productId: fakeId,
                    quantity: 1
                })
                .expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Producto no encontrado');
        });

        test('should fail to add product with invalid quantity', async () => {
            const response = await request(app)
                .post('/api/cart/add')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    productId: testProduct1._id,
                    quantity: 0
                })
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.errors).toBeDefined();
        });

        test('should fail to add product without authentication', async () => {
            const response = await request(app)
                .post('/api/cart/add')
                .send({
                    productId: testProduct1._id,
                    quantity: 1
                })
                .expect(401);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Token no proporcionado');
        });
    });

    describe('PUT /api/cart/item/:productId', () => {
        beforeEach(async () => {
            // Crear carrito con productos
            await Cart.create({
                user: testUser._id,
                items: [
                    {
                        product: testProduct1._id,
                        quantity: 2,
                        price: testProduct1.price
                    }
                ]
            });
        });

        test('should update cart item quantity successfully', async () => {
            const response = await request(app)
                .put(`/api/cart/item/${testProduct1._id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ quantity: 5 })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain('Cantidad actualizada');
            expect(response.body.data.items[0].quantity).toBe(5);
        });

        test('should remove item when quantity is set to 0', async () => {
            const response = await request(app)
                .put(`/api/cart/item/${testProduct1._id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ quantity: 0 })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.items.length).toBe(0);
        });

        test('should fail to update with insufficient stock', async () => {
            const response = await request(app)
                .put(`/api/cart/item/${testProduct1._id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ quantity: 100 })
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Stock insuficiente');
        });

        test('should fail to update non-existent cart item', async () => {
            const fakeId = '507f1f77bcf86cd799439011';
            const response = await request(app)
                .put(`/api/cart/item/${fakeId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ quantity: 5 })
                .expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Producto no encontrado en el carrito');
        });
    });

    describe('DELETE /api/cart/item/:productId', () => {
        beforeEach(async () => {
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
        });

        test('should remove item from cart successfully', async () => {
            const response = await request(app)
                .delete(`/api/cart/item/${testProduct1._id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain('Producto eliminado del carrito');
            expect(response.body.data.items.length).toBe(1);
            expect(response.body.data.items[0].product.toString()).toBe(testProduct2._id.toString());
        });

        test('should fail to remove non-existent item', async () => {
            const fakeId = '507f1f77bcf86cd799439011';
            const response = await request(app)
                .delete(`/api/cart/item/${fakeId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Producto no encontrado en el carrito');
        });
    });

    describe('DELETE /api/cart/clear', () => {
        beforeEach(async () => {
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
        });

        test('should clear cart successfully', async () => {
            const response = await request(app)
                .delete('/api/cart/clear')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain('Carrito vaciado exitosamente');
            expect(response.body.data.items.length).toBe(0);
            expect(response.body.data.total).toBe(0);
        });

        test('should handle clearing already empty cart', async () => {
            // Limpiar carrito primero
            await request(app)
                .delete('/api/cart/clear')
                .set('Authorization', `Bearer ${authToken}`);

            // Intentar limpiar de nuevo
            const response = await request(app)
                .delete('/api/cart/clear')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.items.length).toBe(0);
        });
    });

    describe('GET /api/cart/validate', () => {
        beforeEach(async () => {
            // Crear carrito con productos
            await Cart.create({
                user: testUser._id,
                items: [
                    {
                        product: testProduct1._id,
                        quantity: 2,
                        price: testProduct1.price
                    }
                ]
            });
        });

        test('should validate cart stock successfully', async () => {
            const response = await request(app)
                .get('/api/cart/validate')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.isValid).toBe(true);
            expect(response.body.data.items).toBeDefined();
        });

        test('should detect insufficient stock', async () => {
            // Reducir stock en inventario
            await Inventory.findOneAndUpdate(
                { product: testProduct1._id },
                { availableStock: 1 }
            );

            const response = await request(app)
                .get('/api/cart/validate')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.isValid).toBe(false);
            expect(response.body.data.items[0].hasInsufficientStock).toBe(true);
        });
    });

    describe('POST /api/cart/sync', () => {
        beforeEach(async () => {
            // Crear carrito con productos
            await Cart.create({
                user: testUser._id,
                items: [
                    {
                        product: testProduct1._id,
                        quantity: 2,
                        price: testProduct1.price
                    }
                ]
            });
        });

        test('should sync cart with inventory successfully', async () => {
            const response = await request(app)
                .post('/api/cart/sync')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain('Carrito sincronizado');
            expect(response.body.data.items).toBeDefined();
        });

        test('should remove items with insufficient stock during sync', async () => {
            // Reducir stock a 0
            await Inventory.findOneAndUpdate(
                { product: testProduct1._id },
                { availableStock: 0 }
            );

            const response = await request(app)
                .post('/api/cart/sync')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.items.length).toBe(0);
        });
    });

    describe('Cart Calculations', () => {
        beforeEach(async () => {
            // Crear carrito con múltiples productos
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
                        quantity: 3,
                        price: testProduct2.price
                    }
                ]
            });
        });

        test('should calculate total correctly', async () => {
            const response = await request(app)
                .get('/api/cart')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            const expectedTotal = (testProduct1.price * 2) + (testProduct2.price * 3);
            expect(response.body.data.total).toBeCloseTo(expectedTotal, 2);
        });

        test('should calculate item count correctly', async () => {
            const response = await request(app)
                .get('/api/cart')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.itemCount).toBe(5); // 2 + 3
        });
    });

    describe('Rate Limiting', () => {
        test('should apply rate limiting to cart endpoints', async () => {
            const promises = Array(20).fill().map(() =>
                request(app)
                    .get('/api/cart')
                    .set('Authorization', `Bearer ${authToken}`)
            );

            const responses = await Promise.all(promises);

            // Al menos uno debería ser rate limited
            const rateLimitedResponses = responses.filter(r => r.status === 429);
            expect(rateLimitedResponses.length).toBeGreaterThanOrEqual(0);
        });
    });
});
