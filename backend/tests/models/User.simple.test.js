import mongoose from 'mongoose';
import User from '../../src/models/User.js';

describe('User Model - Simple Tests', () => {
    describe('Basic Schema Validation', () => {
        test('should create a valid user with required fields', async () => {
            const userData = {
                nombre: 'Test User',
                email: 'test@example.com',
                contraseña: 'password123'
            };

            const user = new User(userData);
            const savedUser = await user.save();

            expect(savedUser._id).toBeDefined();
            expect(savedUser.nombre).toBe(userData.nombre);
            expect(savedUser.email).toBe(userData.email);
            expect(savedUser.rol).toBe('usuario'); // default value
            expect(savedUser.activo).toBe(true); // default value
        });

        test('should hash password before saving', async () => {
            const userData = {
                nombre: 'Test User',
                email: 'test2@example.com',
                contraseña: 'password123'
            };

            const user = new User(userData);
            await user.save();

            expect(user.contraseña).not.toBe('password123');
            expect(user.contraseña).toMatch(/^\$2[ayb]\$.{56}$/); // bcrypt hash pattern
        });

        test('should compare password correctly', async () => {
            const userData = {
                nombre: 'Test User',
                email: 'test3@example.com',
                contraseña: 'password123'
            };

            const user = new User(userData);
            await user.save();

            const isMatch = await user.compararContraseña('password123');
            expect(isMatch).toBe(true);

            const isNotMatch = await user.compararContraseña('wrongpassword');
            expect(isNotMatch).toBe(false);
        });

        test('should require nombre field', async () => {
            const userData = {
                email: 'test4@example.com',
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
                email: 'test5@example.com'
            };

            const user = new User(userData);
            await expect(user.save()).rejects.toThrow();
        });
    });
});
