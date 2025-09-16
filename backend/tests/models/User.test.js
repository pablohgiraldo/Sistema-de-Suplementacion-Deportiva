import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../../src/models/User.js';

describe('User Model', () => {
  describe('Schema Validation', () => {
    test('should create a valid user', async () => {
      const userData = {
        nombre: 'Test User',
        email: 'test@example.com',
        contraseña: 'password123',
        rol: 'usuario'
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser._id).toBeDefined();
      expect(savedUser.nombre).toBe(userData.nombre);
      expect(savedUser.email).toBe(userData.email);
      expect(savedUser.rol).toBe(userData.rol);
      expect(savedUser.activo).toBe(true);
      expect(savedUser.fechaCreacion).toBeDefined();
    });

    test('should require nombre field', async () => {
      const userData = {
        email: 'test@example.com',
        contraseña: 'password123'
      };

      const user = new User(userData);
      await expect(user.save()).rejects.toThrow();
    });

    test('should require email field', async () => {
      const userData = {
        nombre: 'Test User',
        contraseña: 'password123'
      };

      const user = new User(userData);
      await expect(user.save()).rejects.toThrow();
    });

    test('should require contraseña field', async () => {
      const userData = {
        nombre: 'Test User',
        email: 'test@example.com'
      };

      const user = new User(userData);
      await expect(user.save()).rejects.toThrow();
    });

    test('should validate email format', async () => {
      const userData = {
        nombre: 'Test User',
        email: 'invalid-email',
        contraseña: 'password123'
      };

      const user = new User(userData);
      await expect(user.save()).rejects.toThrow();
    });

    test('should enforce unique email', async () => {
      const userData = {
        nombre: 'Test User',
        email: 'test@example.com',
        contraseña: 'password123'
      };

      const user1 = new User(userData);
      await user1.save();

      const user2 = new User(userData);
      await expect(user2.save()).rejects.toThrow();
    });

    test('should validate rol enum', async () => {
      const userData = {
        nombre: 'Test User',
        email: 'test@example.com',
        contraseña: 'password123',
        rol: 'invalid-role'
      };

      const user = new User(userData);
      await expect(user.save()).rejects.toThrow();
    });

    test('should set default values', async () => {
      const userData = {
        nombre: 'Test User',
        email: 'test@example.com',
        contraseña: 'password123'
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser.rol).toBe('usuario');
      expect(savedUser.activo).toBe(true);
      expect(savedUser.fechaCreacion).toBeDefined();
    });
  });

  describe('Password Hashing', () => {
    test('should hash password before saving', async () => {
      const userData = {
        nombre: 'Test User',
        email: 'test@example.com',
        contraseña: 'password123'
      };

      const user = new User(userData);
      await user.save();

      expect(user.contraseña).not.toBe('password123');
      expect(user.contraseña).toMatch(/^\$2[ayb]\$.{56}$/); // bcrypt hash pattern
    });

    test('should not hash password if not modified', async () => {
      const userData = {
        nombre: 'Test User',
        email: 'test@example.com',
        contraseña: 'password123'
      };

      const user = new User(userData);
      await user.save();
      const originalHash = user.contraseña;

      // Update non-password field
      user.nombre = 'Updated Name';
      await user.save();

      expect(user.contraseña).toBe(originalHash);
    });

    test('should hash password when modified', async () => {
      const userData = {
        nombre: 'Test User',
        email: 'test@example.com',
        contraseña: 'password123'
      };

      const user = new User(userData);
      await user.save();
      const originalHash = user.contraseña;

      // Update password
      user.contraseña = 'newpassword123';
      await user.save();

      expect(user.contraseña).not.toBe(originalHash);
      expect(user.contraseña).not.toBe('newpassword123');
    });
  });

  describe('Instance Methods', () => {
    test('should compare password correctly', async () => {
      const userData = {
        nombre: 'Test User',
        email: 'test@example.com',
        contraseña: 'password123'
      };

      const user = new User(userData);
      await user.save();

      // Test correct password
      const isMatch = await user.compararContraseña('password123');
      expect(isMatch).toBe(true);

      // Test incorrect password
      const isNotMatch = await user.compararContraseña('wrongpassword');
      expect(isNotMatch).toBe(false);
    });
  });

  describe('Query Methods', () => {
    beforeEach(async () => {
      // Create test users
      const users = [
        {
          nombre: 'User 1',
          email: 'user1@example.com',
          contraseña: 'password123',
          rol: 'usuario'
        },
        {
          nombre: 'User 2',
          email: 'user2@example.com',
          contraseña: 'password123',
          rol: 'admin'
        },
        {
          nombre: 'User 3',
          email: 'user3@example.com',
          contraseña: 'password123',
          rol: 'usuario',
          activo: false
        }
      ];

      for (const userData of users) {
        const user = new User(userData);
        await user.save();
      }
    });

    test('should find user by email', async () => {
      const user = await User.findOne({ email: 'user1@example.com' });
      expect(user).toBeDefined();
      expect(user.nombre).toBe('User 1');
    });

    test('should find active users', async () => {
      const activeUsers = await User.find({ activo: true });
      expect(activeUsers).toHaveLength(2);
    });

    test('should find users by role', async () => {
      const adminUsers = await User.find({ rol: 'admin' });
      expect(adminUsers).toHaveLength(1);
      expect(adminUsers[0].email).toBe('user2@example.com');
    });
  });
});
