import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import User from '../../src/models/User.js';
import authMiddleware from '../../src/middleware/authMiddleware.js';

// Create test app
const app = express();
app.use(express.json());

// Mock protected route
app.get('/protected', authMiddleware, (req, res) => {
  res.json({
    success: true,
    message: 'Access granted',
    user: {
      id: req.user._id,
      email: req.user.email,
      role: req.userRole
    }
  });
});

describe('Auth Middleware', () => {
  let testUser;
  let validToken;
  let expiredToken;
  let invalidToken;

  beforeEach(async () => {
    // Create test user
    const userData = {
      nombre: 'Test User',
      email: 'test@example.com',
      contraseña: 'password123',
      rol: 'usuario'
    };

    testUser = new User(userData);
    await testUser.save();

    // Generate valid token
    validToken = jwt.sign(
      { userId: testUser._id, role: testUser.rol },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Generate expired token
    expiredToken = jwt.sign(
      { userId: testUser._id, role: testUser.rol },
      process.env.JWT_SECRET,
      { expiresIn: '-1h' }
    );

    // Generate invalid token
    invalidToken = 'invalid-token-format';
  });

  describe('Valid Token', () => {
    test('should allow access with valid token', async () => {
      const response = await request(app)
        .get('/protected')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Access granted');
      expect(response.body.user.id).toBe(testUser._id.toString());
      expect(response.body.user.email).toBe(testUser.email);
      expect(response.body.user.role).toBe(testUser.rol);
    });

    test('should set req.user and req.userId correctly', async () => {
      const response = await request(app)
        .get('/protected')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(response.body.user.id).toBe(testUser._id.toString());
      expect(response.body.user.email).toBe(testUser.email);
    });
  });

  describe('Missing Token', () => {
    test('should deny access without token', async () => {
      const response = await request(app)
        .get('/protected')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Token de acceso requerido');
    });

    test('should deny access with empty Authorization header', async () => {
      const response = await request(app)
        .get('/protected')
        .set('Authorization', '')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Token de acceso requerido');
    });

    test('should deny access without Authorization header', async () => {
      const response = await request(app)
        .get('/protected')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Token de acceso requerido');
    });
  });

  describe('Invalid Token', () => {
    test('should deny access with invalid token format', async () => {
      const response = await request(app)
        .get('/protected')
        .set('Authorization', `Bearer ${invalidToken}`)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Token inválido');
    });

    test('should deny access with malformed Bearer token', async () => {
      const response = await request(app)
        .get('/protected')
        .set('Authorization', 'Bearer')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Token de acceso requerido');
    });

    test('should deny access with token without Bearer prefix', async () => {
      const response = await request(app)
        .get('/protected')
        .set('Authorization', validToken)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Token de acceso requerido');
    });
  });

  describe('Expired Token', () => {
    test('should deny access with expired token', async () => {
      const response = await request(app)
        .get('/protected')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Token expirado');
    });
  });

  describe('Non-existent User', () => {
    test('should deny access when user does not exist', async () => {
      // Create token for non-existent user
      const fakeUserId = new mongoose.Types.ObjectId();
      const fakeToken = jwt.sign(
        { userId: fakeUserId, role: 'usuario' },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      const response = await request(app)
        .get('/protected')
        .set('Authorization', `Bearer ${fakeToken}`)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Token inválido');
    });
  });

  describe('Inactive User', () => {
    test('should deny access for inactive user', async () => {
      // Create inactive user
      const inactiveUserData = {
        nombre: 'Inactive User',
        email: 'inactive@example.com',
        contraseña: 'password123',
        activo: false
      };

      const inactiveUser = new User(inactiveUserData);
      await inactiveUser.save();

      const inactiveToken = jwt.sign(
        { userId: inactiveUser._id, role: inactiveUser.rol },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      const response = await request(app)
        .get('/protected')
        .set('Authorization', `Bearer ${inactiveToken}`)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Usuario inactivo');
    });
  });

  describe('Token with Invalid Secret', () => {
    test('should deny access with token signed with wrong secret', async () => {
      const wrongSecretToken = jwt.sign(
        { userId: testUser._id, role: testUser.rol },
        'wrong-secret',
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      const response = await request(app)
        .get('/protected')
        .set('Authorization', `Bearer ${wrongSecretToken}`)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Token inválido');
    });
  });

  describe('Token with Missing Claims', () => {
    test('should deny access with token missing userId', async () => {
      const tokenWithoutUserId = jwt.sign(
        { role: testUser.rol },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      const response = await request(app)
        .get('/protected')
        .set('Authorization', `Bearer ${tokenWithoutUserId}`)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Token inválido');
    });

    test('should deny access with token missing role', async () => {
      const tokenWithoutRole = jwt.sign(
        { userId: testUser._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      const response = await request(app)
        .get('/protected')
        .set('Authorization', `Bearer ${tokenWithoutRole}`)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Token inválido');
    });
  });

  describe('Edge Cases', () => {
    test('should handle multiple Authorization headers', async () => {
      const response = await request(app)
        .get('/protected')
        .set('Authorization', `Bearer ${validToken}`)
        .set('Authorization', `Bearer ${invalidToken}`)
        .expect(200);

      // Should use the first valid token
      expect(response.body.success).toBe(true);
    });

    test('should handle Authorization header with extra spaces', async () => {
      const response = await request(app)
        .get('/protected')
        .set('Authorization', `  Bearer   ${validToken}  `)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    test('should handle case-insensitive Authorization header', async () => {
      const response = await request(app)
        .get('/protected')
        .set('authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });
});
