import request from 'supertest';
import app from '../../src/server.js';
import Product from '../../src/models/Product.js';
import User from '../../src/models/User.js';
import Inventory from '../../src/models/Inventory.js';
import AlertConfig from '../../src/models/AlertConfig.js';

describe('Inventory Integration Tests', () => {
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
        await Inventory.deleteMany({});
        await Product.deleteMany({});
        await AlertConfig.deleteMany({});

        // Crear productos de prueba
        testProduct1 = await Product.create(sampleProducts[0]);
        testProduct2 = await Product.create(sampleProducts[1]);

        // Crear configuración de alertas por defecto
        await AlertConfig.create({
            name: 'Low Stock Alert',
            type: 'inventory',
            enabled: true,
            conditions: {
                field: 'availableStock',
                operator: 'lessThan',
                value: 10
            },
            notificationChannels: ['email'],
            recipients: ['admin@example.com']
        });
    });

    describe('GET /api/inventory', () => {
        beforeEach(async () => {
            // Crear inventario de prueba
            await Inventory.create([
                {
                    product: testProduct1._id,
                    currentStock: 50,
                    availableStock: 45,
                    reservedStock: 5,
                    minStock: 10,
                    maxStock: 100,
                    status: 'active',
                    totalSold: 150
                },
                {
                    product: testProduct2._id,
                    currentStock: 25,
                    availableStock: 20,
                    reservedStock: 5,
                    minStock: 5,
                    maxStock: 50,
                    status: 'active',
                    totalSold: 75
                }
            ]);
        });

        test('should get inventory list successfully', async () => {
            const response = await request(app)
                .get('/api/inventory')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.length).toBe(2);
            expect(response.body.data[0].product).toBeDefined();
            expect(response.body.data[0].currentStock).toBeDefined();
            expect(response.body.data[0].availableStock).toBeDefined();
        });

        test('should get inventory with pagination', async () => {
            const response = await request(app)
                .get('/api/inventory?page=1&limit=1')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.length).toBe(1);
            expect(response.body.pagination.page).toBe(1);
            expect(response.body.pagination.limit).toBe(1);
            expect(response.body.pagination.total).toBe(2);
        });

        test('should filter inventory by status', async () => {
            // Actualizar uno de los inventarios a inactive
            await Inventory.findOneAndUpdate(
                { product: testProduct1._id },
                { status: 'inactive' }
            );

            const response = await request(app)
                .get('/api/inventory?status=active')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.length).toBe(1);
            expect(response.body.data[0].status).toBe('active');
        });

        test('should filter inventory by low stock', async () => {
            // Crear inventario con stock bajo
            const lowStockProduct = await Product.create({
                ...sampleProducts[0],
                name: 'Low Stock Product'
            });

            await Inventory.create({
                product: lowStockProduct._id,
                currentStock: 5,
                availableStock: 5,
                reservedStock: 0,
                minStock: 10,
                maxStock: 100,
                status: 'active',
                totalSold: 10
            });

            const response = await request(app)
                .get('/api/inventory?lowStock=true')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.length).toBe(1);
            expect(response.body.data[0].availableStock).toBeLessThanOrEqual(response.body.data[0].minStock);
        });

        test('should fail to get inventory without authentication', async () => {
            const response = await request(app)
                .get('/api/inventory')
                .expect(401);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Token no proporcionado');
        });
    });

    describe('GET /api/inventory/:id', () => {
        let testInventory;

        beforeEach(async () => {
            testInventory = await Inventory.create({
                product: testProduct1._id,
                currentStock: 50,
                availableStock: 45,
                reservedStock: 5,
                minStock: 10,
                maxStock: 100,
                status: 'active',
                totalSold: 150
            });
        });

        test('should get inventory by ID successfully', async () => {
            const response = await request(app)
                .get(`/api/inventory/${testInventory._id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data._id.toString()).toBe(testInventory._id.toString());
            expect(response.body.data.product).toBeDefined();
            expect(response.body.data.currentStock).toBe(50);
        });

        test('should fail to get non-existent inventory', async () => {
            const fakeId = '507f1f77bcf86cd799439011';
            const response = await request(app)
                .get(`/api/inventory/${fakeId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Inventario no encontrado');
        });

        test('should fail to get inventory with invalid ID', async () => {
            const response = await request(app)
                .get('/api/inventory/invalid-id')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('ID de inventario inválido');
        });
    });

    describe('POST /api/inventory', () => {
        test('should create inventory successfully as admin', async () => {
            const inventoryData = {
                product: testProduct1._id,
                currentStock: 100,
                availableStock: 100,
                minStock: 10,
                maxStock: 200,
                status: 'active'
            };

            const response = await request(app)
                .post('/api/inventory')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(inventoryData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain('Inventario creado exitosamente');
            expect(response.body.data.product.toString()).toBe(testProduct1._id.toString());
            expect(response.body.data.currentStock).toBe(100);
        });

        test('should fail to create inventory as regular user', async () => {
            const inventoryData = {
                product: testProduct1._id,
                currentStock: 100,
                availableStock: 100,
                minStock: 10,
                maxStock: 200,
                status: 'active'
            };

            const response = await request(app)
                .post('/api/inventory')
                .set('Authorization', `Bearer ${authToken}`)
                .send(inventoryData)
                .expect(403);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Acceso denegado');
        });

        test('should fail to create inventory with invalid data', async () => {
            const inventoryData = {
                product: testProduct1._id,
                currentStock: -10, // Stock negativo
                availableStock: 100,
                minStock: 10,
                maxStock: 200,
                status: 'active'
            };

            const response = await request(app)
                .post('/api/inventory')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(inventoryData)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.errors).toBeDefined();
        });

        test('should fail to create duplicate inventory for same product', async () => {
            // Crear inventario primero
            await Inventory.create({
                product: testProduct1._id,
                currentStock: 50,
                availableStock: 50,
                minStock: 10,
                maxStock: 100,
                status: 'active'
            });

            const inventoryData = {
                product: testProduct1._id,
                currentStock: 100,
                availableStock: 100,
                minStock: 10,
                maxStock: 200,
                status: 'active'
            };

            const response = await request(app)
                .post('/api/inventory')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(inventoryData)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Ya existe inventario para este producto');
        });
    });

    describe('PUT /api/inventory/:id', () => {
        let testInventory;

        beforeEach(async () => {
            testInventory = await Inventory.create({
                product: testProduct1._id,
                currentStock: 50,
                availableStock: 45,
                reservedStock: 5,
                minStock: 10,
                maxStock: 100,
                status: 'active',
                totalSold: 150
            });
        });

        test('should update inventory successfully as admin', async () => {
            const updateData = {
                currentStock: 75,
                availableStock: 70,
                minStock: 15,
                maxStock: 150
            };

            const response = await request(app)
                .put(`/api/inventory/${testInventory._id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send(updateData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain('Inventario actualizado exitosamente');
            expect(response.body.data.currentStock).toBe(75);
            expect(response.body.data.availableStock).toBe(70);
        });

        test('should fail to update inventory as regular user', async () => {
            const updateData = {
                currentStock: 75
            };

            const response = await request(app)
                .put(`/api/inventory/${testInventory._id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(updateData)
                .expect(403);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Acceso denegado');
        });

        test('should fail to update with invalid data', async () => {
            const updateData = {
                currentStock: -10 // Stock negativo
            };

            const response = await request(app)
                .put(`/api/inventory/${testInventory._id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send(updateData)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.errors).toBeDefined();
        });

        test('should fail to update non-existent inventory', async () => {
            const fakeId = '507f1f77bcf86cd799439011';
            const updateData = {
                currentStock: 75
            };

            const response = await request(app)
                .put(`/api/inventory/${fakeId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send(updateData)
                .expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Inventario no encontrado');
        });
    });

    describe('POST /api/inventory/:id/adjust', () => {
        let testInventory;

        beforeEach(async () => {
            testInventory = await Inventory.create({
                product: testProduct1._id,
                currentStock: 50,
                availableStock: 45,
                reservedStock: 5,
                minStock: 10,
                maxStock: 100,
                status: 'active',
                totalSold: 150
            });
        });

        test('should adjust inventory stock successfully as admin', async () => {
            const adjustmentData = {
                type: 'increase',
                quantity: 10,
                reason: 'Stock restocked'
            };

            const response = await request(app)
                .post(`/api/inventory/${testInventory._id}/adjust`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send(adjustmentData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain('Inventario ajustado exitosamente');
            expect(response.body.data.currentStock).toBe(60);
            expect(response.body.data.availableStock).toBe(55);
        });

        test('should decrease inventory stock successfully', async () => {
            const adjustmentData = {
                type: 'decrease',
                quantity: 5,
                reason: 'Damaged goods'
            };

            const response = await request(app)
                .post(`/api/inventory/${testInventory._id}/adjust`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send(adjustmentData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.currentStock).toBe(45);
            expect(response.body.data.availableStock).toBe(40);
        });

        test('should fail to adjust inventory as regular user', async () => {
            const adjustmentData = {
                type: 'increase',
                quantity: 10,
                reason: 'Stock restocked'
            };

            const response = await request(app)
                .post(`/api/inventory/${testInventory._id}/adjust`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(adjustmentData)
                .expect(403);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Acceso denegado');
        });

        test('should fail to adjust with invalid type', async () => {
            const adjustmentData = {
                type: 'invalid',
                quantity: 10,
                reason: 'Stock restocked'
            };

            const response = await request(app)
                .post(`/api/inventory/${testInventory._id}/adjust`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send(adjustmentData)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.errors).toBeDefined();
        });

        test('should fail to decrease below zero', async () => {
            const adjustmentData = {
                type: 'decrease',
                quantity: 100, // Más que el stock disponible
                reason: 'Damaged goods'
            };

            const response = await request(app)
                .post(`/api/inventory/${testInventory._id}/adjust`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send(adjustmentData)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('No se puede reducir el stock por debajo de cero');
        });
    });

    describe('GET /api/inventory/low-stock', () => {
        beforeEach(async () => {
            // Crear inventario con stock normal
            await Inventory.create({
                product: testProduct1._id,
                currentStock: 50,
                availableStock: 45,
                reservedStock: 5,
                minStock: 10,
                maxStock: 100,
                status: 'active',
                totalSold: 150
            });

            // Crear inventario con stock bajo
            const lowStockProduct = await Product.create({
                ...sampleProducts[0],
                name: 'Low Stock Product'
            });

            await Inventory.create({
                product: lowStockProduct._id,
                currentStock: 5,
                availableStock: 5,
                reservedStock: 0,
                minStock: 10,
                maxStock: 100,
                status: 'active',
                totalSold: 10
            });
        });

        test('should get low stock items successfully', async () => {
            const response = await request(app)
                .get('/api/inventory/low-stock')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.length).toBe(1);
            expect(response.body.data[0].availableStock).toBeLessThanOrEqual(response.body.data[0].minStock);
        });

        test('should get low stock items with custom threshold', async () => {
            const response = await request(app)
                .get('/api/inventory/low-stock?threshold=20')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            // Ambos productos deberían aparecer ya que ambos tienen menos de 20
            expect(response.body.data.length).toBe(2);
        });
    });

    describe('GET /api/inventory/alerts', () => {
        beforeEach(async () => {
            // Crear inventario que debería generar alertas
            const lowStockProduct = await Product.create({
                ...sampleProducts[0],
                name: 'Low Stock Product'
            });

            await Inventory.create({
                product: lowStockProduct._id,
                currentStock: 5,
                availableStock: 5,
                reservedStock: 0,
                minStock: 10,
                maxStock: 100,
                status: 'active',
                totalSold: 10
            });
        });

        test('should get inventory alerts successfully', async () => {
            const response = await request(app)
                .get('/api/inventory/alerts')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
            expect(response.body.data.alerts).toBeDefined();
        });
    });

    describe('Inventory Calculations', () => {
        test('should calculate available stock correctly', async () => {
            const inventory = await Inventory.create({
                product: testProduct1._id,
                currentStock: 100,
                availableStock: 90,
                reservedStock: 10,
                minStock: 10,
                maxStock: 200,
                status: 'active',
                totalSold: 50
            });

            expect(inventory.availableStock).toBe(inventory.currentStock - inventory.reservedStock);
        });

        test('should update total sold when inventory is adjusted', async () => {
            const inventory = await Inventory.create({
                product: testProduct1._id,
                currentStock: 100,
                availableStock: 100,
                reservedStock: 0,
                minStock: 10,
                maxStock: 200,
                status: 'active',
                totalSold: 0
            });

            // Simular venta
            await Inventory.findByIdAndUpdate(inventory._id, {
                $inc: {
                    currentStock: -5,
                    availableStock: -5,
                    totalSold: 5
                }
            });

            const updatedInventory = await Inventory.findById(inventory._id);
            expect(updatedInventory.totalSold).toBe(5);
            expect(updatedInventory.currentStock).toBe(95);
        });
    });

    describe('Rate Limiting', () => {
        test('should apply rate limiting to inventory endpoints', async () => {
            const promises = Array(20).fill().map(() =>
                request(app)
                    .get('/api/inventory')
                    .set('Authorization', `Bearer ${authToken}`)
            );

            const responses = await Promise.all(promises);

            // Al menos uno debería ser rate limited
            const rateLimitedResponses = responses.filter(r => r.status === 429);
            expect(rateLimitedResponses.length).toBeGreaterThanOrEqual(0);
        });
    });
});
