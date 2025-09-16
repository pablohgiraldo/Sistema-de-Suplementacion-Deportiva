import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../../src/models/User.js';
import { registrarUsuario, iniciarSesion, obtenerPerfil } from '../../src/controllers/userController.js';

// Create test app
const app = express();
app.use(express.json());

// Mock routes
app.post('/register', registrarUsuario);
app.post('/login', iniciarSesion);
app.get('/profile', obtenerPerfil);

describe('User Controller', () => {
  describe('POST /register', () => {
    test('should register a new user successfully', async () => {
      const userData = {
        nombre: 'Test User',
        email: 'test@example.com',
        contraseña: 'password123',
        confirmarContraseña: 'password123'
      };

      const response = await request(app)
        .post('/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.nombre).toBe(userData.nombre);
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user.contraseña).toBeUndefined();
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
    });

    test('should return error for missing required fields', async () => {
      const userData = {
        email: 'test@example.com',
        contraseña: 'password123'
      };

      const response = await request(app)
        .post('/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('El nombre es requerido');
    });

    test('should return error for invalid email format', async () => {
      const userData = {
        nombre: 'Test User',
        email: 'invalid-email',
        contraseña: 'password123',
        confirmarContraseña: 'password123'
      };

      const response = await request(app)
        .post('/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Por favor ingresa un email válido');
    });

    test('should return error for password mismatch', async () => {
      const userData = {
        nombre: 'Test User',
        email: 'test@example.com',
        contraseña: 'password123',
        confirmarContraseña: 'differentpassword'
      };

      const response = await request(app)
        .post('/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Las contraseñas no coinciden');
    });

    test('should return error for duplicate email', async () => {
      const userData = {
        nombre: 'Test User',
        email: 'test@example.com',
        contraseña: 'password123',
        confirmarContraseña: 'password123'
      };

      // Register first user
      await request(app)
        .post('/register')
        .send(userData)
        .expect(201);

      // Try to register with same email
      const response = await request(app)
        .post('/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('El email ya está registrado');
    });

    test('should return error for weak password', async () => {
      const userData = {
        nombre: 'Test User',
        email: 'test@example.com',
        contraseña: '123',
        confirmarContraseña: '123'
      };

      const response = await request(app)
        .post('/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('La contraseña debe tener al menos 6 caracteres');
    });
  });

  describe('POST /login', () => {
    beforeEach(async () => {
      // Create a test user for login tests
      const userData = {
        nombre: 'Test User',
        email: 'test@example.com',
        contraseña: 'password123'
      };

      const user = new User(userData);
      await user.save();
    });

    test('should login successfully with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        contraseña: 'password123'
      };

      const response = await request(app)
        .post('/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(loginData.email);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
    });

    test('should return error for invalid email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        contraseña: 'password123'
      };

      const response = await request(app)
        .post('/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Credenciales inválidas');
    });

    test('should return error for invalid password', async () => {
      const loginData = {
        email: 'test@example.com',
        contraseña: 'wrongpassword'
      };

      const response = await request(app)
        .post('/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Credenciales inválidas');
    });

    test('should return error for missing email', async () => {
      const loginData = {
        contraseña: 'password123'
      };

      const response = await request(app)
        .post('/login')
        .send(loginData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('El email es requerido');
    });

    test('should return error for missing password', async () => {
      const loginData = {
        email: 'test@example.com'
      };

      const response = await request(app)
        .post('/login')
        .send(loginData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('La contraseña es requerida');
    });

    test('should return error for inactive user', async () => {
      // Create inactive user
      const userData = {
        nombre: 'Inactive User',
        email: 'inactive@example.com',
        contraseña: 'password123',
        activo: false
      };

      const user = new User(userData);
      await user.save();

      const loginData = {
        email: 'inactive@example.com',
        contraseña: 'password123'
      };

      const response = await request(app)
        .post('/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Usuario inactivo');
    });
  });

  describe('GET /profile', () => {
    let testUser;
    let accessToken;

    beforeEach(async () => {
      // Create test user
      const userData = {
        nombre: 'Test User',
        email: 'test@example.com',
        contraseña: 'password123'
      };

      testUser = new User(userData);
      await testUser.save();

      // Generate token
      accessToken = jwt.sign(
        { userId: testUser._id, role: testUser.rol },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );
    });

    test('should get user profile with valid token', async () => {
      const response = await request(app)
        .get('/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data.user.nombre).toBe(testUser.nombre);
      expect(response.body.data.user.contraseña).toBeUndefined();
    });

    test('should return error for missing token', async () => {
      const response = await request(app)
        .get('/profile')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Token de acceso requerido');
    });

    test('should return error for invalid token', async () => {
      const response = await request(app)
        .get('/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Token inválido');
    });

    test('should return error for expired token', async () => {
      // Create expired token
      const expiredToken = jwt.sign(
        { userId: testUser._id, role: testUser.rol },
        process.env.JWT_SECRET,
        { expiresIn: '-1h' }
      );

      const response = await request(app)
        .get('/profile')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Token expirado');
    });

    test('should return error for non-existent user', async () => {
      // Create token for non-existent user
      const fakeUserId = new mongoose.Types.ObjectId();
      const fakeToken = jwt.sign(
        { userId: fakeUserId, role: 'usuario' },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      const response = await request(app)
        .get('/profile')
        .set('Authorization', `Bearer ${fakeToken}`)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Token inválido');
    });
  });
});
