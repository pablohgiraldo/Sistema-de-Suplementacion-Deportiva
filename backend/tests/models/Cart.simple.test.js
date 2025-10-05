import mongoose from 'mongoose';
import Cart from '../../src/models/Cart.js';
import User from '../../src/models/User.js';
import Product from '../../src/models/Product.js';

describe('Cart Model - Comprehensive Tests', () => {
    let testUser;
    let testProduct1;
    let testProduct2;

    beforeEach(async () => {
        // Create test user with unique email
        testUser = new User({
            nombre: 'Test User',
            email: `test-${Date.now()}@example.com`,
            contraseña: 'password123'
        });
        await testUser.save();

        // Create test products
        testProduct1 = new Product({
            name: 'Test Product 1',
            price: 29.99,
            stock: 100
        });
        await testProduct1.save();

        testProduct2 = new Product({
            name: 'Test Product 2',
            price: 49.99,
            stock: 50
        });
        await testProduct2.save();
    });

    describe('Schema Validation', () => {
        test('should create a valid cart with user', async () => {
            const cart = new Cart({
                user: testUser._id,
                items: []
            });

            const savedCart = await cart.save();

            expect(savedCart._id).toBeDefined();
            expect(savedCart.user.toString()).toBe(testUser._id.toString());
            expect(savedCart.items).toEqual([]);
            expect(savedCart.total).toBe(0);
            expect(savedCart.createdAt).toBeDefined();
            expect(savedCart.updatedAt).toBeDefined();
        });

        test('should require user field', async () => {
            const cart = new Cart({
                items: []
            });

            await expect(cart.save()).rejects.toThrow();
        });

        test('should ensure unique user per cart', async () => {
            const cart1 = new Cart({
                user: testUser._id,
                items: []
            });
            await cart1.save();

            const cart2 = new Cart({
                user: testUser._id,
                items: []
            });

            await expect(cart2.save()).rejects.toThrow();
        });

        test('should validate cart item structure', async () => {
            const cart = new Cart({
                user: testUser._id,
                items: [{
                    product: testProduct1._id,
                    quantity: 2,
                    price: 29.99
                }]
            });

            const savedCart = await cart.save();

            expect(savedCart.items).toHaveLength(1);
            expect(savedCart.items[0].product.toString()).toBe(testProduct1._id.toString());
            expect(savedCart.items[0].quantity).toBe(2);
            expect(savedCart.items[0].price).toBe(29.99);
        });

        test('should require product in cart item', async () => {
            const cart = new Cart({
                user: testUser._id,
                items: [{
                    quantity: 2,
                    price: 29.99
                }]
            });

            await expect(cart.save()).rejects.toThrow();
        });

        test('should require quantity in cart item', async () => {
            const cart = new Cart({
                user: testUser._id,
                items: [{
                    product: testProduct1._id,
                    price: 29.99
                }]
            });

            await expect(cart.save()).rejects.toThrow();
        });

        test('should require price in cart item', async () => {
            const cart = new Cart({
                user: testUser._id,
                items: [{
                    product: testProduct1._id,
                    quantity: 2
                }]
            });

            await expect(cart.save()).rejects.toThrow();
        });

        test('should validate quantity range', async () => {
            const cart = new Cart({
                user: testUser._id,
                items: [{
                    product: testProduct1._id,
                    quantity: 0, // Below minimum
                    price: 29.99
                }]
            });

            await expect(cart.save()).rejects.toThrow();
        });

        test('should validate maximum quantity', async () => {
            const cart = new Cart({
                user: testUser._id,
                items: [{
                    product: testProduct1._id,
                    quantity: 101, // Above maximum
                    price: 29.99
                }]
            });

            await expect(cart.save()).rejects.toThrow();
        });

        test('should validate price range', async () => {
            const cart = new Cart({
                user: testUser._id,
                items: [{
                    product: testProduct1._id,
                    quantity: 2,
                    price: -10 // Negative price
                }]
            });

            await expect(cart.save()).rejects.toThrow();
        });

        test('should validate total range', async () => {
            const cart = new Cart({
                user: testUser._id,
                items: [],
                total: -10 // Negative total
            });

            await expect(cart.save()).rejects.toThrow();
        });
    });

    describe('Virtual Properties', () => {
        test('should calculate item count correctly', async () => {
            const cart = new Cart({
                user: testUser._id,
                items: [
                    {
                        product: testProduct1._id,
                        quantity: 2,
                        price: 29.99
                    },
                    {
                        product: testProduct2._id,
                        quantity: 3,
                        price: 49.99
                    }
                ]
            });

            await cart.save();

            expect(cart.itemCount).toBe(5);
        });

        test('should show empty cart correctly', async () => {
            const emptyCart = new Cart({
                user: testUser._id,
                items: []
            });

            await emptyCart.save();

            expect(emptyCart.isEmpty).toBe(true);

            const nonEmptyCart = new Cart({
                user: new mongoose.Types.ObjectId(),
                items: [{
                    product: testProduct1._id,
                    quantity: 1,
                    price: 29.99
                }]
            });

            await nonEmptyCart.save();

            expect(nonEmptyCart.isEmpty).toBe(false);
        });
    });

    describe('Pre-save Middleware', () => {
        test('should calculate total automatically', async () => {
            const cart = new Cart({
                user: testUser._id,
                items: [
                    {
                        product: testProduct1._id,
                        quantity: 2,
                        price: 29.99
                    },
                    {
                        product: testProduct2._id,
                        quantity: 1,
                        price: 49.99
                    }
                ]
            });

            const savedCart = await cart.save();

            const expectedTotal = (2 * 29.99) + (1 * 49.99);
            expect(savedCart.total).toBeCloseTo(expectedTotal, 2);
        });

        test('should handle empty cart total', async () => {
            const cart = new Cart({
                user: testUser._id,
                items: []
            });

            const savedCart = await cart.save();

            expect(savedCart.total).toBe(0);
        });
    });

    describe('Cart Methods', () => {
        let cart;

        beforeEach(async () => {
            cart = new Cart({
                user: testUser._id,
                items: []
            });
            await cart.save();
        });

        describe('addItem method', () => {
            test('should add new item to cart', async () => {
                await cart.addItem(testProduct1._id, 2, 29.99);

                expect(cart.items).toHaveLength(1);
                expect(cart.items[0].product.toString()).toBe(testProduct1._id.toString());
                expect(cart.items[0].quantity).toBe(2);
                expect(cart.items[0].price).toBe(29.99);
            });

            test('should update quantity for existing item', async () => {
                await cart.addItem(testProduct1._id, 2, 29.99);
                await cart.addItem(testProduct1._id, 3, 29.99);

                expect(cart.items).toHaveLength(1);
                expect(cart.items[0].quantity).toBe(5);
            });

            test('should add multiple different items', async () => {
                await cart.addItem(testProduct1._id, 2, 29.99);
                await cart.addItem(testProduct2._id, 1, 49.99);

                expect(cart.items).toHaveLength(2);
            });
        });

        describe('removeItem method', () => {
            beforeEach(async () => {
                await cart.addItem(testProduct1._id, 2, 29.99);
                await cart.addItem(testProduct2._id, 1, 49.99);
            });

            test('should remove existing item', async () => {
                await cart.removeItem(testProduct1._id);

                expect(cart.items).toHaveLength(1);
                expect(cart.items[0].product.toString()).toBe(testProduct2._id.toString());
            });

            test('should handle removing non-existent item', async () => {
                const nonExistentId = new mongoose.Types.ObjectId();
                await cart.removeItem(nonExistentId);

                expect(cart.items).toHaveLength(2);
            });
        });

        describe('updateQuantity method', () => {
            beforeEach(async () => {
                await cart.addItem(testProduct1._id, 2, 29.99);
            });

            test('should update quantity for existing item', async () => {
                await cart.updateQuantity(testProduct1._id, 5);

                expect(cart.items[0].quantity).toBe(5);
            });

            test('should remove item when quantity is 0', async () => {
                await cart.updateQuantity(testProduct1._id, 0);

                expect(cart.items).toHaveLength(0);
            });

            test('should remove item when quantity is negative', async () => {
                await cart.updateQuantity(testProduct1._id, -1);

                expect(cart.items).toHaveLength(0);
            });

            test('should handle updating non-existent item', async () => {
                const nonExistentId = new mongoose.Types.ObjectId();
                await cart.updateQuantity(nonExistentId, 5);

                expect(cart.items).toHaveLength(1);
                expect(cart.items[0].quantity).toBe(2);
            });
        });

        describe('clearCart method', () => {
            beforeEach(async () => {
                await cart.addItem(testProduct1._id, 2, 29.99);
                await cart.addItem(testProduct2._id, 1, 49.99);
            });

            test('should clear all items and reset total', async () => {
                await cart.clearCart();

                expect(cart.items).toHaveLength(0);
                expect(cart.total).toBe(0);
            });
        });
    });

    describe('Cart Integration Tests', () => {
        test('should populate user reference', async () => {
            const cart = new Cart({
                user: testUser._id,
                items: []
            });
            await cart.save();

            const populatedCart = await Cart.findById(cart._id).populate('user');
            expect(populatedCart.user.nombre).toBe(testUser.nombre);
            expect(populatedCart.user.email).toBe(testUser.email);
        });

        test('should populate product references in items', async () => {
            const cart = new Cart({
                user: testUser._id,
                items: [{
                    product: testProduct1._id,
                    quantity: 2,
                    price: 29.99
                }]
            });
            await cart.save();

            const populatedCart = await Cart.findById(cart._id).populate('items.product');
            expect(populatedCart.items[0].product.name).toBe(testProduct1.name);
            expect(populatedCart.items[0].product.price).toBe(testProduct1.price);
        });

        test('should maintain data consistency after operations', async () => {
            const cart = new Cart({
                user: testUser._id,
                items: []
            });
            await cart.save();

            // Add items
            await cart.addItem(testProduct1._id, 2, 29.99);
            await cart.addItem(testProduct2._id, 1, 49.99);

            // Verify total is calculated correctly
            const expectedTotal = (2 * 29.99) + (1 * 49.99);
            expect(cart.total).toBeCloseTo(expectedTotal, 2);

            // Update quantity
            await cart.updateQuantity(testProduct1._id, 3);
            const newExpectedTotal = (3 * 29.99) + (1 * 49.99);
            expect(cart.total).toBeCloseTo(newExpectedTotal, 2);

            // Remove item
            await cart.removeItem(testProduct2._id);
            const finalExpectedTotal = 3 * 29.99;
            expect(cart.total).toBeCloseTo(finalExpectedTotal, 2);
        });
    });

    describe('Edge Cases', () => {
        test('should handle very large quantities', async () => {
            const cart = new Cart({
                user: testUser._id,
                items: [{
                    product: testProduct1._id,
                    quantity: 100, // Maximum allowed
                    price: 29.99
                }]
            });

            const savedCart = await cart.save();
            expect(savedCart.items[0].quantity).toBe(100);
            expect(savedCart.total).toBeCloseTo(100 * 29.99, 2);
        });

        test('should handle decimal prices', async () => {
            const cart = new Cart({
                user: testUser._id,
                items: [{
                    product: testProduct1._id,
                    quantity: 2,
                    price: 29.999
                }]
            });

            const savedCart = await cart.save();
            expect(savedCart.items[0].price).toBe(29.999);
            expect(savedCart.total).toBeCloseTo(2 * 29.999, 2);
        });

        test('should handle multiple operations in sequence', async () => {
            const cart = new Cart({
                user: testUser._id,
                items: []
            });
            await cart.save();

            // Add, update, remove, add again
            await cart.addItem(testProduct1._id, 2, 29.99);
            await cart.updateQuantity(testProduct1._id, 5);
            await cart.removeItem(testProduct1._id);
            await cart.addItem(testProduct2._id, 1, 49.99);

            expect(cart.items).toHaveLength(1);
            expect(cart.items[0].product.toString()).toBe(testProduct2._id.toString());
            expect(cart.total).toBeCloseTo(49.99, 2);
        });
    });
});