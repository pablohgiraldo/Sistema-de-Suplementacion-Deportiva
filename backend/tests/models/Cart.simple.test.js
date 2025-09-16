import mongoose from 'mongoose';
import Cart from '../../src/models/Cart.js';
import User from '../../src/models/User.js';
import Product from '../../src/models/Product.js';

describe('Cart Model - Simple Tests', () => {
    let testUser;
    let testProduct;

    beforeEach(async () => {
        // Create test user
        const userData = {
            nombre: 'Test User',
            email: `test${Date.now()}@example.com`,
            contraseña: 'password123'
        };
        testUser = new User(userData);
        await testUser.save();

        // Create test product
        const productData = {
            name: 'Test Product',
            brand: 'Test Brand',
            price: 29.99,
            stock: 100
        };
        testProduct = new Product(productData);
        await testProduct.save();
    });

    describe('Basic Schema Validation', () => {
        test('should create a valid cart', async () => {
            const cartData = {
                user: testUser._id,
                items: [
                    {
                        product: testProduct._id,
                        quantity: 2,
                        price: 29.99
                    }
                ]
            };

            const cart = new Cart(cartData);
            const savedCart = await cart.save();

            expect(savedCart._id).toBeDefined();
            expect(savedCart.user.toString()).toBe(testUser._id.toString());
            expect(savedCart.items).toHaveLength(1);
            expect(savedCart.total).toBe(59.98);
        });

        test('should calculate total automatically', async () => {
            const cartData = {
                user: testUser._id,
                items: [
                    {
                        product: testProduct._id,
                        quantity: 3,
                        price: 29.99
                    }
                ]
            };

            const cart = new Cart(cartData);
            await cart.save();

            expect(cart.total).toBe(89.97);
        });

        test('should require user field', async () => {
            const cartData = {
                items: [
                    {
                        product: testProduct._id,
                        quantity: 2,
                        price: 29.99
                    }
                ]
            };

            const cart = new Cart(cartData);
            await expect(cart.save()).rejects.toThrow();
        });
    });

    describe('Instance Methods', () => {
        test('should add item to cart', async () => {
            const cartData = {
                user: testUser._id,
                items: []
            };

            const cart = new Cart(cartData);
            await cart.save();

            await cart.addItem(testProduct._id, 2, 29.99);

            expect(cart.items).toHaveLength(1);
            expect(cart.items[0].product.toString()).toBe(testProduct._id.toString());
            expect(cart.items[0].quantity).toBe(2);
            expect(cart.total).toBe(59.98);
        });

        test('should remove item from cart', async () => {
            const cartData = {
                user: testUser._id,
                items: [
                    {
                        product: testProduct._id,
                        quantity: 2,
                        price: 29.99
                    }
                ]
            };

            const cart = new Cart(cartData);
            await cart.save();

            await cart.removeItem(testProduct._id);

            expect(cart.items).toHaveLength(0);
            expect(cart.total).toBe(0);
        });

        test('should clear cart', async () => {
            const cartData = {
                user: testUser._id,
                items: [
                    {
                        product: testProduct._id,
                        quantity: 2,
                        price: 29.99
                    }
                ]
            };

            const cart = new Cart(cartData);
            await cart.save();

            await cart.clearCart();

            expect(cart.items).toHaveLength(0);
            expect(cart.total).toBe(0);
        });
    });
});
