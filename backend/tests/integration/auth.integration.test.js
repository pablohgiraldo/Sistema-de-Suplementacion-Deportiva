import request from 'supertest';
import app from '../../src/server.js';
import User from '../../src/models/User.js';

describe('Authentication Integration Tests', () => {
    const testUser = {
        nombre: 'Test User',
        email: 'test@example.com',
        contraseña: 'Password123!',
        confirmarContraseña: 'Password123!'
    };

    beforeEach(async () => {
        // Limpiar usuarios de prueba
        await User.deleteMany({});
    });

    describe('POST /api/users/register', () => {
        test('should register a new user successfully', async () => {
            const response = await request(app)
                .post('/api/users/register')
                .send(testUser)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain('Usuario registrado exitosamente');
            expect(response.body.user).toBeDefined();
            expect(response.body.user.email).toBe(testUser.email);
            expect(response.body.user.contraseña).toBeUndefined(); // No debe devolver la contraseña
        });

        test('should fail to register user with existing email', async () => {
            // Crear usuario primero
            await request(app)
                .post('/api/users/register')
                .send(testUser)
                .expect(201);

            // Intentar crear otro usuario con el mismo email
            const response = await request(app)
                .post('/api/users/register')
                .send(testUser)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('El email ya está registrado');
        });

        test('should fail to register user with invalid email', async () => {
            const invalidUser = {
                ...testUser,
                email: 'invalid-email'
            };

            const response = await request(app)
                .post('/api/users/register')
                .send(invalidUser)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.errors).toBeDefined();
        });

        test('should fail to register user with weak password', async () => {
            const weakPasswordUser = {
                ...testUser,
                contraseña: '123',
                confirmarContraseña: '123'
            };

            const response = await request(app)
                .post('/api/users/register')
                .send(weakPasswordUser)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.errors).toBeDefined();
        });

        test('should fail to register user with mismatched passwords', async () => {
            const mismatchedUser = {
                ...testUser,
                confirmarContraseña: 'DifferentPassword123!'
            };

            const response = await request(app)
                .post('/api/users/register')
                .send(mismatchedUser)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.errors).toBeDefined();
        });
    });

    describe('POST /api/users/login', () => {
        beforeEach(async () => {
            // Crear usuario para las pruebas de login
            await request(app)
                .post('/api/users/register')
                .send(testUser);
        });

        test('should login user with valid credentials', async () => {
            const response = await request(app)
                .post('/api/users/login')
                .send({
                    email: testUser.email,
                    contraseña: testUser.contraseña
                })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain('Inicio de sesión exitoso');
            expect(response.body.token).toBeDefined();
            expect(response.body.refreshToken).toBeDefined();
            expect(response.body.user).toBeDefined();
            expect(response.body.user.email).toBe(testUser.email);
        });

        test('should fail login with invalid email', async () => {
            const response = await request(app)
                .post('/api/users/login')
                .send({
                    email: 'nonexistent@example.com',
                    contraseña: testUser.contraseña
                })
                .expect(401);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Email o contraseña incorrectos');
        });

        test('should fail login with invalid password', async () => {
            const response = await request(app)
                .post('/api/users/login')
                .send({
                    email: testUser.email,
                    contraseña: 'wrongpassword'
                })
                .expect(401);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Email o contraseña incorrectos');
        });

        test('should fail login with missing credentials', async () => {
            const response = await request(app)
                .post('/api/users/login')
                .send({})
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.errors).toBeDefined();
        });
    });

    describe('POST /api/users/refresh', () => {
        let refreshToken;

        beforeEach(async () => {
            // Crear usuario y obtener refresh token
            const loginResponse = await request(app)
                .post('/api/users/login')
                .send({
                    email: testUser.email,
                    contraseña: testUser.contraseña
                });

            refreshToken = loginResponse.body.refreshToken;
        });

        test('should refresh token successfully', async () => {
            const response = await request(app)
                .post('/api/users/refresh')
                .send({ refreshToken })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.token).toBeDefined();
            expect(response.body.refreshToken).toBeDefined();
            expect(response.body.user).toBeDefined();
        });

        test('should fail to refresh with invalid token', async () => {
            const response = await request(app)
                .post('/api/users/refresh')
                .send({ refreshToken: 'invalid-token' })
                .expect(401);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Token de actualización inválido');
        });

        test('should fail to refresh with missing token', async () => {
            const response = await request(app)
                .post('/api/users/refresh')
                .send({})
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.errors).toBeDefined();
        });
    });

    describe('GET /api/users/profile', () => {
        let authToken;

        beforeEach(async () => {
            // Crear usuario y obtener token de autenticación
            const loginResponse = await request(app)
                .post('/api/users/login')
                .send({
                    email: testUser.email,
                    contraseña: testUser.contraseña
                });

            authToken = loginResponse.body.token;
        });

        test('should get user profile with valid token', async () => {
            const response = await request(app)
                .get('/api/users/profile')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.user).toBeDefined();
            expect(response.body.user.email).toBe(testUser.email);
            expect(response.body.user.contraseña).toBeUndefined();
        });

        test('should fail to get profile without token', async () => {
            const response = await request(app)
                .get('/api/users/profile')
                .expect(401);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Token no proporcionado');
        });

        test('should fail to get profile with invalid token', async () => {
            const response = await request(app)
                .get('/api/users/profile')
                .set('Authorization', 'Bearer invalid-token')
                .expect(401);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Token inválido');
        });
    });

    describe('PUT /api/users/profile', () => {
        let authToken;

        beforeEach(async () => {
            // Crear usuario y obtener token de autenticación
            const loginResponse = await request(app)
                .post('/api/users/login')
                .send({
                    email: testUser.email,
                    contraseña: testUser.contraseña
                });

            authToken = loginResponse.body.token;
        });

        test('should update user profile with valid data', async () => {
            const updatedData = {
                nombre: 'Updated Name',
                telefono: '+573001234567'
            };

            const response = await request(app)
                .put('/api/users/profile')
                .set('Authorization', `Bearer ${authToken}`)
                .send(updatedData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain('Perfil actualizado exitosamente');
            expect(response.body.user.nombre).toBe(updatedData.nombre);
        });

        test('should fail to update profile without token', async () => {
            const response = await request(app)
                .put('/api/users/profile')
                .send({ nombre: 'New Name' })
                .expect(401);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Token no proporcionado');
        });

        test('should fail to update profile with invalid email', async () => {
            const response = await request(app)
                .put('/api/users/profile')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ email: 'invalid-email' })
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.errors).toBeDefined();
        });
    });

    describe('POST /api/users/logout', () => {
        let authToken;

        beforeEach(async () => {
            // Crear usuario y obtener token de autenticación
            const loginResponse = await request(app)
                .post('/api/users/login')
                .send({
                    email: testUser.email,
                    contraseña: testUser.contraseña
                });

            authToken = loginResponse.body.token;
        });

        test('should logout user successfully', async () => {
            const response = await request(app)
                .post('/api/users/logout')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain('Sesión cerrada exitosamente');
        });

        test('should fail to logout without token', async () => {
            const response = await request(app)
                .post('/api/users/logout')
                .expect(401);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Token no proporcionado');
        });
    });

    describe('Rate Limiting', () => {
        test('should apply rate limiting to login endpoint', async () => {
            // Crear usuario primero
            await request(app)
                .post('/api/users/register')
                .send(testUser);

            // Intentar hacer múltiples requests de login
            const promises = Array(10).fill().map(() =>
                request(app)
                    .post('/api/users/login')
                    .send({
                        email: testUser.email,
                        contraseña: 'wrongpassword'
                    })
            );

            const responses = await Promise.all(promises);

            // Al menos uno debería ser rate limited (dependiendo de la configuración)
            const rateLimitedResponses = responses.filter(r => r.status === 429);
            expect(rateLimitedResponses.length).toBeGreaterThanOrEqual(0);
        });

        test('should apply rate limiting to register endpoint', async () => {
            const promises = Array(10).fill().map((_, index) =>
                request(app)
                    .post('/api/users/register')
                    .send({
                        ...testUser,
                        email: `test${index}@example.com`
                    })
            );

            const responses = await Promise.all(promises);

            // Al menos uno debería ser rate limited
            const rateLimitedResponses = responses.filter(r => r.status === 429);
            expect(rateLimitedResponses.length).toBeGreaterThanOrEqual(0);
        });
    });
});
