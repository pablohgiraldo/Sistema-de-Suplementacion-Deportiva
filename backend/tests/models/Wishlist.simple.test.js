import mongoose from 'mongoose';
import Wishlist from '../../src/models/Wishlist.js';
import User from '../../src/models/User.js';
import Product from '../../src/models/Product.js';

describe('Wishlist Model - Comprehensive Tests', () => {
    let testUser;
    let testProduct1;
    let testProduct2;
    let testProduct3;

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

        testProduct3 = new Product({
            name: 'Test Product 3',
            price: 79.99,
            stock: 25
        });
        await testProduct3.save();
    });

    describe('Schema Validation', () => {
        test('should create a valid wishlist with user', async () => {
            const wishlist = new Wishlist({
                user: testUser._id,
                items: []
            });

            const savedWishlist = await wishlist.save();

            expect(savedWishlist._id).toBeDefined();
            expect(savedWishlist.user.toString()).toBe(testUser._id.toString());
            expect(savedWishlist.items).toEqual([]);
            expect(savedWishlist.itemCount).toBe(0);
            expect(savedWishlist.createdAt).toBeDefined();
            expect(savedWishlist.updatedAt).toBeDefined();
        });

        test('should create wishlist with items', async () => {
            const wishlist = new Wishlist({
                user: testUser._id,
                items: [
                    {
                        product: testProduct1._id,
                        addedAt: new Date()
                    },
                    {
                        product: testProduct2._id,
                        addedAt: new Date()
                    }
                ]
            });

            const savedWishlist = await wishlist.save();

            expect(savedWishlist.items).toHaveLength(2);
            expect(savedWishlist.itemCount).toBe(2);
            expect(savedWishlist.items[0].product.toString()).toBe(testProduct1._id.toString());
            expect(savedWishlist.items[1].product.toString()).toBe(testProduct2._id.toString());
        });

        test('should require user field', async () => {
            const wishlist = new Wishlist({
                items: []
            });

            await expect(wishlist.save()).rejects.toThrow();
        });

        test('should ensure unique user per wishlist', async () => {
            const wishlist1 = new Wishlist({
                user: testUser._id,
                items: []
            });
            await wishlist1.save();

            const wishlist2 = new Wishlist({
                user: testUser._id,
                items: []
            });

            await expect(wishlist2.save()).rejects.toThrow();
        });

        test('should require product in wishlist item', async () => {
            const wishlist = new Wishlist({
                user: testUser._id,
                items: [{
                    addedAt: new Date()
                }]
            });

            await expect(wishlist.save()).rejects.toThrow();
        });

        test('should set default addedAt date', async () => {
            const wishlist = new Wishlist({
                user: testUser._id,
                items: [{
                    product: testProduct1._id
                }]
            });

            const savedWishlist = await wishlist.save();

            expect(savedWishlist.items[0].addedAt).toBeDefined();
            expect(savedWishlist.items[0].addedAt).toBeInstanceOf(Date);
        });
    });

    describe('Virtual Properties', () => {
        test('should calculate item count correctly', async () => {
            const wishlist = new Wishlist({
                user: testUser._id,
                items: [
                    { product: testProduct1._id },
                    { product: testProduct2._id },
                    { product: testProduct3._id }
                ]
            });

            await wishlist.save();

            expect(wishlist.itemCount).toBe(3);
        });

        test('should return zero count for empty wishlist', async () => {
            const wishlist = new Wishlist({
                user: testUser._id,
                items: []
            });

            await wishlist.save();

            expect(wishlist.itemCount).toBe(0);
        });
    });

    describe('Pre-save Middleware', () => {
        test('should update updatedAt timestamp on save', async () => {
            const wishlist = new Wishlist({
                user: testUser._id,
                items: []
            });

            const savedWishlist = await wishlist.save();
            const initialUpdatedAt = savedWishlist.updatedAt;

            // Wait a moment to ensure time difference
            await new Promise(resolve => setTimeout(resolve, 10));

            savedWishlist.items.push({ product: testProduct1._id });
            const updatedWishlist = await savedWishlist.save();

            expect(updatedWishlist.updatedAt.getTime()).toBeGreaterThan(initialUpdatedAt.getTime());
        });
    });

    describe('Wishlist Methods', () => {
        let wishlist;

        beforeEach(async () => {
            wishlist = new Wishlist({
                user: testUser._id,
                items: []
            });
            await wishlist.save();
        });

        describe('addProduct method', () => {
            test('should add new product to wishlist', async () => {
                await wishlist.addProduct(testProduct1._id);

                expect(wishlist.items).toHaveLength(1);
                expect(wishlist.items[0].product.toString()).toBe(testProduct1._id.toString());
                expect(wishlist.items[0].addedAt).toBeDefined();
            });

            test('should not add duplicate products', async () => {
                await wishlist.addProduct(testProduct1._id);
                await wishlist.addProduct(testProduct1._id);

                expect(wishlist.items).toHaveLength(1);
            });

            test('should add multiple different products', async () => {
                await wishlist.addProduct(testProduct1._id);
                await wishlist.addProduct(testProduct2._id);
                await wishlist.addProduct(testProduct3._id);

                expect(wishlist.items).toHaveLength(3);
            });

            test('should maintain chronological order', async () => {
                const firstDate = new Date();
                await wishlist.addProduct(testProduct1._id);

                await new Promise(resolve => setTimeout(resolve, 10));

                const secondDate = new Date();
                await wishlist.addProduct(testProduct2._id);

                expect(wishlist.items[0].addedAt.getTime()).toBeLessThanOrEqual(firstDate.getTime());
                expect(wishlist.items[1].addedAt.getTime()).toBeGreaterThanOrEqual(secondDate.getTime());
            });
        });

        describe('removeProduct method', () => {
            beforeEach(async () => {
                await wishlist.addProduct(testProduct1._id);
                await wishlist.addProduct(testProduct2._id);
                await wishlist.addProduct(testProduct3._id);
            });

            test('should remove existing product', async () => {
                await wishlist.removeProduct(testProduct2._id);

                expect(wishlist.items).toHaveLength(2);
                expect(wishlist.items.some(item => item.product.toString() === testProduct2._id.toString())).toBe(false);
            });

            test('should handle removing non-existent product', async () => {
                const nonExistentId = new mongoose.Types.ObjectId();
                await wishlist.removeProduct(nonExistentId);

                expect(wishlist.items).toHaveLength(3);
            });

            test('should remove first occurrence of duplicate products', async () => {
                // Add duplicate manually
                wishlist.items.push({ product: testProduct1._id, addedAt: new Date() });
                await wishlist.save();

                expect(wishlist.items).toHaveLength(4);

                await wishlist.removeProduct(testProduct1._id);

                expect(wishlist.items).toHaveLength(2);
                expect(wishlist.items.some(item => item.product.toString() === testProduct1._id.toString())).toBe(false);
            });
        });

        describe('hasProduct method', () => {
            beforeEach(async () => {
                await wishlist.addProduct(testProduct1._id);
                await wishlist.addProduct(testProduct2._id);
            });

            test('should return true for existing product', () => {
                expect(wishlist.hasProduct(testProduct1._id)).toBe(true);
                expect(wishlist.hasProduct(testProduct2._id)).toBe(true);
            });

            test('should return false for non-existent product', () => {
                expect(wishlist.hasProduct(testProduct3._id)).toBe(false);

                const nonExistentId = new mongoose.Types.ObjectId();
                expect(wishlist.hasProduct(nonExistentId)).toBe(false);
            });

            test('should handle string and ObjectId comparisons', () => {
                expect(wishlist.hasProduct(testProduct1._id.toString())).toBe(true);
                expect(wishlist.hasProduct(testProduct1._id)).toBe(true);
            });
        });

        describe('clear method', () => {
            beforeEach(async () => {
                await wishlist.addProduct(testProduct1._id);
                await wishlist.addProduct(testProduct2._id);
                await wishlist.addProduct(testProduct3._id);
            });

            test('should clear all items', async () => {
                expect(wishlist.items).toHaveLength(3);

                await wishlist.clear();

                expect(wishlist.items).toHaveLength(0);
                expect(wishlist.itemCount).toBe(0);
            });
        });
    });

    describe('Static Methods', () => {
        describe('getOrCreate method', () => {
            test('should return existing wishlist', async () => {
                const existingWishlist = new Wishlist({
                    user: testUser._id,
                    items: [{ product: testProduct1._id }]
                });
                await existingWishlist.save();

                const retrievedWishlist = await Wishlist.getOrCreate(testUser._id);

                expect(retrievedWishlist._id.toString()).toBe(existingWishlist._id.toString());
                expect(retrievedWishlist.items).toHaveLength(1);
            });

            test('should create new wishlist if none exists', async () => {
                const newUserId = new mongoose.Types.ObjectId();
                const newWishlist = await Wishlist.getOrCreate(newUserId);

                expect(newWishlist._id).toBeDefined();
                expect(newWishlist.user.toString()).toBe(newUserId.toString());
                expect(newWishlist.items).toEqual([]);
            });

            test('should populate product references', async () => {
                const wishlist = new Wishlist({
                    user: testUser._id,
                    items: [{ product: testProduct1._id }]
                });
                await wishlist.save();

                const populatedWishlist = await Wishlist.getOrCreate(testUser._id);

                expect(populatedWishlist.items[0].product.name).toBe(testProduct1.name);
                expect(populatedWishlist.items[0].product.price).toBe(testProduct1.price);
            });
        });
    });

    describe('Integration Tests', () => {
        test('should populate user reference', async () => {
            const wishlist = new Wishlist({
                user: testUser._id,
                items: []
            });
            await wishlist.save();

            const populatedWishlist = await Wishlist.findById(wishlist._id).populate('user');
            expect(populatedWishlist.user.nombre).toBe(testUser.nombre);
            expect(populatedWishlist.user.email).toBe(testUser.email);
        });

        test('should populate product references in items', async () => {
            const wishlist = new Wishlist({
                user: testUser._id,
                items: [
                    { product: testProduct1._id },
                    { product: testProduct2._id }
                ]
            });
            await wishlist.save();

            const populatedWishlist = await Wishlist.findById(wishlist._id).populate('items.product');
            expect(populatedWishlist.items[0].product.name).toBe(testProduct1.name);
            expect(populatedWishlist.items[1].product.name).toBe(testProduct2.name);
        });

        test('should maintain data consistency through operations', async () => {
            const wishlist = new Wishlist({
                user: testUser._id,
                items: []
            });
            await wishlist.save();

            // Add products
            await wishlist.addProduct(testProduct1._id);
            await wishlist.addProduct(testProduct2._id);
            expect(wishlist.itemCount).toBe(2);

            // Check if product exists
            expect(wishlist.hasProduct(testProduct1._id)).toBe(true);
            expect(wishlist.hasProduct(testProduct3._id)).toBe(false);

            // Remove product
            await wishlist.removeProduct(testProduct1._id);
            expect(wishlist.itemCount).toBe(1);
            expect(wishlist.hasProduct(testProduct1._id)).toBe(false);
            expect(wishlist.hasProduct(testProduct2._id)).toBe(true);

            // Clear wishlist
            await wishlist.clear();
            expect(wishlist.itemCount).toBe(0);
            expect(wishlist.hasProduct(testProduct2._id)).toBe(false);
        });
    });

    describe('Edge Cases', () => {
        test('should handle very large wishlist', async () => {
            const wishlist = new Wishlist({
                user: testUser._id,
                items: []
            });

            // Create many products
            const products = [];
            for (let i = 0; i < 50; i++) {
                const product = new Product({
                    name: `Product ${i}`,
                    price: 29.99 + i,
                    stock: 100
                });
                products.push(await product.save());
            }

            // Add all products to wishlist
            for (const product of products) {
                await wishlist.addProduct(product._id);
            }

            expect(wishlist.itemCount).toBe(50);
            expect(wishlist.items.length).toBe(50);
        });

        test('should handle rapid add/remove operations', async () => {
            const wishlist = new Wishlist({
                user: testUser._id,
                items: []
            });
            await wishlist.save();

            // Rapid operations
            await wishlist.addProduct(testProduct1._id);
            await wishlist.addProduct(testProduct2._id);
            await wishlist.removeProduct(testProduct1._id);
            await wishlist.addProduct(testProduct3._id);
            await wishlist.removeProduct(testProduct2._id);

            expect(wishlist.itemCount).toBe(1);
            expect(wishlist.hasProduct(testProduct3._id)).toBe(true);
            expect(wishlist.hasProduct(testProduct1._id)).toBe(false);
            expect(wishlist.hasProduct(testProduct2._id)).toBe(false);
        });

        test('should handle sequential operations', async () => {
            const wishlist = new Wishlist({
                user: testUser._id,
                items: []
            });
            await wishlist.save();

            // Simulate sequential operations to avoid parallel save issues
            await wishlist.addProduct(testProduct1._id);
            await wishlist.addProduct(testProduct2._id);
            await wishlist.addProduct(testProduct3._id);

            expect(wishlist.itemCount).toBe(3);
        });

        test('should handle empty operations gracefully', async () => {
            const wishlist = new Wishlist({
                user: testUser._id,
                items: []
            });
            await wishlist.save();

            // Try to remove from empty wishlist
            await wishlist.removeProduct(testProduct1._id);
            expect(wishlist.itemCount).toBe(0);

            // Try to clear empty wishlist
            await wishlist.clear();
            expect(wishlist.itemCount).toBe(0);
        });

        test('should handle deleted product references', async () => {
            const wishlist = new Wishlist({
                user: testUser._id,
                items: [{ product: testProduct1._id }]
            });
            await wishlist.save();

            // Delete the product
            await Product.findByIdAndDelete(testProduct1._id);

            // Wishlist should still exist but with invalid reference
            const retrievedWishlist = await Wishlist.findById(wishlist._id);
            expect(retrievedWishlist.items).toHaveLength(1);
            expect(retrievedWishlist.hasProduct(testProduct1._id)).toBe(true);
        });
    });
});
