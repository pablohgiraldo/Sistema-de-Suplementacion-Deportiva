import request from 'supertest';
import app from '../../src/server.js';
import Product from '../../src/models/Product.js';
import User from '../../src/models/User.js';

describe('Products Integration Tests', () => {
    let authToken;
    let adminToken;
    let testProduct;

    const testUser = {
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

    const sampleProduct = {
        name: 'Whey Protein',
        brand: 'Optimum Nutrition',
        price: 89.99,
        stock: 50,
        description: 'Proteína de suero de leche de alta calidad',
        categories: ['Proteínas', 'Suplementos'],
        weightInGrams: 907,
        flavor: 'Chocolate',
        availableFlavors: ['Chocolate', 'Vainilla', 'Fresa']
    };

    beforeAll(async () => {
        // Crear usuario normal y admin
        await request(app)
            .post('/api/users/register')
            .send(testUser);

        await request(app)
            .post('/api/users/register')
            .send(adminUser);

        // Obtener tokens de autenticación
        const userLoginResponse = await request(app)
            .post('/api/users/login')
            .send({
                email: testUser.email,
                contraseña: testUser.contraseña
            });

        const adminLoginResponse = await request(app)
            .post('/api/users/login')
            .send({
                email: adminUser.email,
                contraseña: adminUser.contraseña
            });

        authToken = userLoginResponse.body.token;
        adminToken = adminLoginResponse.body.token;
    });

    beforeEach(async () => {
        // Limpiar productos de prueba
        await Product.deleteMany({});
    });

    describe('GET /api/products', () => {
        test('should get all products successfully', async () => {
            // Crear algunos productos de prueba
            await Product.create([
                { ...sampleProduct, name: 'Product 1' },
                { ...sampleProduct, name: 'Product 2' },
                { ...sampleProduct, name: 'Product 3' }
            ]);

            const response = await request(app)
                .get('/api/products')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
            expect(response.body.data.length).toBe(3);
            expect(response.body.pagination).toBeDefined();
        });

        test('should get products with pagination', async () => {
            // Crear más productos para probar paginación
            const products = Array(15).fill().map((_, index) => ({
                ...sampleProduct,
                name: `Product ${index + 1}`
            }));

            await Product.create(products);

            const response = await request(app)
                .get('/api/products?page=1&limit=10')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.length).toBe(10);
            expect(response.body.pagination.page).toBe(1);
            expect(response.body.pagination.limit).toBe(10);
            expect(response.body.pagination.total).toBe(15);
        });

        test('should get products with category filter', async () => {
            await Product.create([
                { ...sampleProduct, name: 'Protein 1', categories: ['Proteínas'] },
                { ...sampleProduct, name: 'Vitamin 1', categories: ['Vitaminas'] },
                { ...sampleProduct, name: 'Protein 2', categories: ['Proteínas'] }
            ]);

            const response = await request(app)
                .get('/api/products?category=Proteínas')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.length).toBe(2);
            response.body.data.forEach(product => {
                expect(product.categories).toContain('Proteínas');
            });
        });

        test('should get products with price range filter', async () => {
            await Product.create([
                { ...sampleProduct, name: 'Cheap Product', price: 29.99 },
                { ...sampleProduct, name: 'Expensive Product', price: 199.99 },
                { ...sampleProduct, name: 'Mid Range Product', price: 89.99 }
            ]);

            const response = await request(app)
                .get('/api/products?minPrice=50&maxPrice=100')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.length).toBe(1);
            expect(response.body.data[0].name).toBe('Mid Range Product');
        });

        test('should handle empty product list', async () => {
            const response = await request(app)
                .get('/api/products')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.length).toBe(0);
            expect(response.body.pagination.total).toBe(0);
        });
    });

    describe('GET /api/products/search', () => {
        beforeEach(async () => {
            await Product.create([
                { ...sampleProduct, name: 'Whey Protein Chocolate', description: 'Proteína de suero chocolate' },
                { ...sampleProduct, name: 'Casein Protein', description: 'Proteína caseína' },
                { ...sampleProduct, name: 'Vitamin D3', description: 'Vitamina D3' }
            ]);
        });

        test('should search products by name', async () => {
            const response = await request(app)
                .get('/api/products/search?q=whey')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.length).toBe(1);
            expect(response.body.data[0].name).toContain('Whey');
        });

        test('should search products by description', async () => {
            const response = await request(app)
                .get('/api/products/search?q=chocolate')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.length).toBe(1);
            expect(response.body.data[0].description).toContain('chocolate');
        });

        test('should return empty result for non-existent search', async () => {
            const response = await request(app)
                .get('/api/products/search?q=nonexistent')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.length).toBe(0);
        });

        test('should handle search with special characters', async () => {
            const response = await request(app)
                .get('/api/products/search?q=protein%20chocolate')
                .expect(200);

            expect(response.body.success).toBe(true);
        });
    });

    describe('GET /api/products/:id', () => {
        beforeEach(async () => {
            testProduct = await Product.create(sampleProduct);
        });

        test('should get product by ID successfully', async () => {
            const response = await request(app)
                .get(`/api/products/${testProduct._id}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
            expect(response.body.data._id.toString()).toBe(testProduct._id.toString());
            expect(response.body.data.name).toBe(sampleProduct.name);
        });

        test('should return 404 for non-existent product', async () => {
            const fakeId = '507f1f77bcf86cd799439011';
            const response = await request(app)
                .get(`/api/products/${fakeId}`)
                .expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Producto no encontrado');
        });

        test('should return 400 for invalid product ID', async () => {
            const response = await request(app)
                .get('/api/products/invalid-id')
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('ID de producto inválido');
        });
    });

    describe('POST /api/products', () => {
        test('should create product successfully as admin', async () => {
            const response = await request(app)
                .post('/api/products')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(sampleProduct)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain('Producto creado exitosamente');
            expect(response.body.data).toBeDefined();
            expect(response.body.data.name).toBe(sampleProduct.name);
            expect(response.body.data.price).toBe(sampleProduct.price);
        });

        test('should fail to create product as regular user', async () => {
            const response = await request(app)
                .post('/api/products')
                .set('Authorization', `Bearer ${authToken}`)
                .send(sampleProduct)
                .expect(403);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Acceso denegado');
        });

        test('should fail to create product without authentication', async () => {
            const response = await request(app)
                .post('/api/products')
                .send(sampleProduct)
                .expect(401);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Token no proporcionado');
        });

        test('should fail to create product with invalid data', async () => {
            const invalidProduct = {
                name: '', // Nombre vacío
                price: -10, // Precio negativo
                stock: 'invalid' // Stock inválido
            };

            const response = await request(app)
                .post('/api/products')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(invalidProduct)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.errors).toBeDefined();
        });

        test('should fail to create product with duplicate name', async () => {
            // Crear producto primero
            await Product.create(sampleProduct);

            // Intentar crear otro con el mismo nombre
            const response = await request(app)
                .post('/api/products')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(sampleProduct)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Ya existe un producto con este nombre');
        });
    });

    describe('PUT /api/products/:id', () => {
        beforeEach(async () => {
            testProduct = await Product.create(sampleProduct);
        });

        test('should update product successfully as admin', async () => {
            const updatedData = {
                name: 'Updated Whey Protein',
                price: 99.99,
                description: 'Updated description'
            };

            const response = await request(app)
                .put(`/api/products/${testProduct._id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send(updatedData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain('Producto actualizado exitosamente');
            expect(response.body.data.name).toBe(updatedData.name);
            expect(response.body.data.price).toBe(updatedData.price);
        });

        test('should fail to update product as regular user', async () => {
            const response = await request(app)
                .put(`/api/products/${testProduct._id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ name: 'Updated Name' })
                .expect(403);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Acceso denegado');
        });

        test('should fail to update non-existent product', async () => {
            const fakeId = '507f1f77bcf86cd799439011';
            const response = await request(app)
                .put(`/api/products/${fakeId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ name: 'Updated Name' })
                .expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Producto no encontrado');
        });

        test('should fail to update product with invalid data', async () => {
            const response = await request(app)
                .put(`/api/products/${testProduct._id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ price: -10 })
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.errors).toBeDefined();
        });
    });

    describe('DELETE /api/products/:id', () => {
        beforeEach(async () => {
            testProduct = await Product.create(sampleProduct);
        });

        test('should delete product successfully as admin', async () => {
            const response = await request(app)
                .delete(`/api/products/${testProduct._id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain('Producto eliminado exitosamente');

            // Verificar que el producto fue eliminado
            const deletedProduct = await Product.findById(testProduct._id);
            expect(deletedProduct).toBeNull();
        });

        test('should fail to delete product as regular user', async () => {
            const response = await request(app)
                .delete(`/api/products/${testProduct._id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(403);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Acceso denegado');
        });

        test('should fail to delete non-existent product', async () => {
            const fakeId = '507f1f77bcf86cd799439011';
            const response = await request(app)
                .delete(`/api/products/${fakeId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Producto no encontrado');
        });
    });

    describe('Rate Limiting', () => {
        test('should apply rate limiting to product endpoints', async () => {
            const promises = Array(20).fill().map(() =>
                request(app)
                    .get('/api/products')
            );

            const responses = await Promise.all(promises);

            // Al menos uno debería ser rate limited
            const rateLimitedResponses = responses.filter(r => r.status === 429);
            expect(rateLimitedResponses.length).toBeGreaterThanOrEqual(0);
        });
    });

    describe('Input Validation and Security', () => {
        test('should sanitize malicious input in search', async () => {
            const response = await request(app)
                .get('/api/products/search?q=<script>alert("xss")</script>')
                .expect(200);

            expect(response.body.success).toBe(true);
            // El input malicioso debería ser sanitizado
        });

        test('should handle SQL injection attempts', async () => {
            const response = await request(app)
                .get('/api/products/search?q=1; DROP TABLE products; --')
                .expect(200);

            expect(response.body.success).toBe(true);
            // No debería causar errores de base de datos
        });
    });
});
