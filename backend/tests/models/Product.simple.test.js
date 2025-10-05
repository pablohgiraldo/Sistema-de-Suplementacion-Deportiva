import mongoose from 'mongoose';
import Product from '../../src/models/Product.js';

describe('Product Model - Comprehensive Tests', () => {
    describe('Schema Validation', () => {
        test('should create a valid product with all required fields', async () => {
            const productData = {
                name: 'Test Product',
                price: 29.99,
                stock: 100,
                description: 'A test product',
                brand: 'Test Brand',
                categories: ['Electronics', 'Gadgets']
            };

            const product = new Product(productData);
            const savedProduct = await product.save();

            expect(savedProduct._id).toBeDefined();
            expect(savedProduct.name).toBe(productData.name);
            expect(savedProduct.price).toBe(productData.price);
            expect(savedProduct.stock).toBe(productData.stock);
            expect(savedProduct.description).toBe(productData.description);
            expect(savedProduct.brand).toBe(productData.brand);
            expect(savedProduct.categories).toEqual(productData.categories);
            expect(savedProduct.createdAt).toBeDefined();
            expect(savedProduct.updatedAt).toBeDefined();
        });

        test('should create a product with minimal required fields', async () => {
            const productData = {
                name: 'Minimal Product',
                price: 19.99
            };

            const product = new Product(productData);
            const savedProduct = await product.save();

            expect(savedProduct._id).toBeDefined();
            expect(savedProduct.name).toBe(productData.name);
            expect(savedProduct.price).toBe(productData.price);
            expect(savedProduct.stock).toBe(0); // default value
            expect(savedProduct.categories).toEqual([]);
        });

        test('should require name field', async () => {
            const productData = {
                price: 29.99,
                stock: 100
            };

            const product = new Product(productData);
            await expect(product.save()).rejects.toThrow();
        });

        test('should require price field', async () => {
            const productData = {
                name: 'Test Product',
                stock: 100
            };

            const product = new Product(productData);
            await expect(product.save()).rejects.toThrow();
        });

        test('should validate name length', async () => {
            const productData = {
                name: 'A'.repeat(101), // Exceeds max length
                price: 29.99
            };

            const product = new Product(productData);
            await expect(product.save()).rejects.toThrow();
        });

        test('should validate brand length', async () => {
            const productData = {
                name: 'Test Product',
                price: 29.99,
                brand: 'A'.repeat(51) // Exceeds max length
            };

            const product = new Product(productData);
            await expect(product.save()).rejects.toThrow();
        });

        test('should validate price range', async () => {
            const negativePriceProduct = new Product({
                name: 'Negative Price Product',
                price: -10
            });
            await expect(negativePriceProduct.save()).rejects.toThrow();

            const highPriceProduct = new Product({
                name: 'High Price Product',
                price: 10001 // Exceeds max price
            });
            await expect(highPriceProduct.save()).rejects.toThrow();
        });

        test('should validate stock range', async () => {
            const negativeStockProduct = new Product({
                name: 'Negative Stock Product',
                price: 29.99,
                stock: -5
            });
            await expect(negativeStockProduct.save()).rejects.toThrow();
        });

        test('should validate description length', async () => {
            const productData = {
                name: 'Test Product',
                price: 29.99,
                description: 'A'.repeat(501) // Exceeds max length
            };

            const product = new Product(productData);
            await expect(product.save()).rejects.toThrow();
        });

        test('should validate categories count', async () => {
            const productData = {
                name: 'Test Product',
                price: 29.99,
                categories: Array(11).fill('Category') // Exceeds max count
            };

            const product = new Product(productData);
            await expect(product.save()).rejects.toThrow();
        });

        test('should validate image URL format', async () => {
            const productData = {
                name: 'Test Product',
                price: 29.99,
                imageUrl: 'invalid-url' // Invalid URL format
            };

            const product = new Product(productData);
            await expect(product.save()).rejects.toThrow();
        });

        test('should accept valid image URL', async () => {
            const productData = {
                name: 'Test Product',
                price: 29.99,
                imageUrl: 'https://example.com/image.jpg'
            };

            const product = new Product(productData);
            const savedProduct = await product.save();
            expect(savedProduct.imageUrl).toBe(productData.imageUrl);
        });

        test('should accept empty image URL', async () => {
            const productData = {
                name: 'Test Product',
                price: 29.99,
                imageUrl: ''
            };

            const product = new Product(productData);
            const savedProduct = await product.save();
            expect(savedProduct.imageUrl).toBe('');
        });
    });

    describe('Virtual Properties', () => {
        test('should format price correctly', async () => {
            const product = new Product({
                name: 'Test Product',
                price: 29.99
            });
            await product.save();

            expect(product.formattedPrice).toBe('$29.99');
        });

        test('should format zero price correctly', async () => {
            const product = new Product({
                name: 'Free Product',
                price: 0
            });
            await product.save();

            expect(product.formattedPrice).toBe('$0.00');
        });

        test('should show stock status as available', async () => {
            const product = new Product({
                name: 'Available Product',
                price: 29.99,
                stock: 50
            });
            await product.save();

            expect(product.stockStatus).toBe('Disponible');
        });

        test('should show stock status as low stock', async () => {
            const product = new Product({
                name: 'Low Stock Product',
                price: 29.99,
                stock: 5
            });
            await product.save();

            expect(product.stockStatus).toBe('Stock bajo');
        });

        test('should show stock status as out of stock', async () => {
            const product = new Product({
                name: 'Out of Stock Product',
                price: 29.99,
                stock: 0
            });
            await product.save();

            expect(product.stockStatus).toBe('Agotado');
        });
    });

    describe('Text Search Index', () => {
        beforeEach(async () => {
            // Create test products for search testing
            const products = [
                {
                    name: 'iPhone 15 Pro',
                    description: 'Latest Apple smartphone',
                    brand: 'Apple',
                    categories: ['Electronics', 'Smartphones'],
                    price: 999.99,
                    stock: 10
                },
                {
                    name: 'Samsung Galaxy S24',
                    description: 'Android smartphone with great camera',
                    brand: 'Samsung',
                    categories: ['Electronics', 'Smartphones'],
                    price: 899.99,
                    stock: 15
                },
                {
                    name: 'MacBook Pro M3',
                    description: 'Powerful laptop for professionals',
                    brand: 'Apple',
                    categories: ['Electronics', 'Laptops'],
                    price: 1999.99,
                    stock: 5
                }
            ];

            for (const productData of products) {
                const product = new Product(productData);
                await product.save();
            }
        });

        test('should find products by text search', async () => {
            const results = await Product.find({
                $text: { $search: 'iPhone Apple' }
            });

            expect(results.length).toBeGreaterThan(0);
            expect(results.some(p => p.name.includes('iPhone'))).toBe(true);
        });

        test('should find products by brand search', async () => {
            const results = await Product.find({
                $text: { $search: 'Samsung' }
            });

            expect(results.length).toBeGreaterThan(0);
            expect(results.some(p => p.brand === 'Samsung')).toBe(true);
        });

        test('should find products by category search', async () => {
            const results = await Product.find({
                $text: { $search: 'Smartphones' }
            });

            expect(results.length).toBeGreaterThan(0);
            expect(results.every(p => p.categories.includes('Smartphones'))).toBe(true);
        });
    });

    describe('Index Performance', () => {
        test('should use price index for sorting', async () => {
            // Create products with different prices
            const products = [
                { name: 'Cheap Product', price: 10.99, stock: 100 },
                { name: 'Expensive Product', price: 999.99, stock: 5 },
                { name: 'Medium Product', price: 49.99, stock: 50 }
            ];

            for (const productData of products) {
                const product = new Product(productData);
                await product.save();
            }

            const sortedProducts = await Product.find().sort({ price: 1 });
            expect(sortedProducts[0].price).toBe(10.99);
            expect(sortedProducts[sortedProducts.length - 1].price).toBe(999.99);
        });

        test('should use brand index for filtering', async () => {
            const products = [
                { name: 'Apple Product', price: 999.99, brand: 'Apple', stock: 10 },
                { name: 'Samsung Product', price: 899.99, brand: 'Samsung', stock: 15 }
            ];

            for (const productData of products) {
                const product = new Product(productData);
                await product.save();
            }

            const appleProducts = await Product.find({ brand: 'Apple' });
            expect(appleProducts.length).toBe(1);
            expect(appleProducts[0].brand).toBe('Apple');
        });

        test('should use stock index for filtering', async () => {
            const products = [
                { name: 'In Stock Product', price: 29.99, stock: 100 },
                { name: 'Low Stock Product', price: 49.99, stock: 5 }
            ];

            for (const productData of products) {
                const product = new Product(productData);
                await product.save();
            }

            const lowStockProducts = await Product.find({ stock: { $lt: 10 } });
            expect(lowStockProducts.length).toBe(1);
            expect(lowStockProducts[0].name).toBe('Low Stock Product');
        });
    });

    describe('Data Integrity', () => {
        test('should handle special characters in name', async () => {
            const productData = {
                name: 'Producto con acentos ñáéíóú',
                price: 29.99
            };

            const product = new Product(productData);
            const savedProduct = await product.save();
            expect(savedProduct.name).toBe(productData.name);
        });

        test('should trim whitespace in name', async () => {
            const productData = {
                name: '  Test Product  ',
                price: 29.99
            };

            const product = new Product(productData);
            const savedProduct = await product.save();
            expect(savedProduct.name).toBe('Test Product');
        });

        test('should handle decimal prices correctly', async () => {
            const productData = {
                name: 'Decimal Price Product',
                price: 29.999 // Should be rounded
            };

            const product = new Product(productData);
            const savedProduct = await product.save();
            expect(savedProduct.price).toBe(29.999);
        });

        test('should preserve categories array order', async () => {
            const productData = {
                name: 'Category Test Product',
                price: 29.99,
                categories: ['Electronics', 'Computers', 'Laptops']
            };

            const product = new Product(productData);
            const savedProduct = await product.save();
            expect(savedProduct.categories).toEqual(['Electronics', 'Computers', 'Laptops']);
        });
    });
});
