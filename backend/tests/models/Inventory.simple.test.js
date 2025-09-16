import mongoose from 'mongoose';
import Inventory from '../../src/models/Inventory.js';
import Product from '../../src/models/Product.js';

describe('Inventory Model - Simple Tests', () => {
    let testProduct;

    beforeEach(async () => {
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
        test('should create a valid inventory record', async () => {
            const inventoryData = {
                product: testProduct._id,
                currentStock: 100,
                minStock: 10,
                maxStock: 500,
                status: 'active'
            };

            const inventory = new Inventory(inventoryData);
            const savedInventory = await inventory.save();

            expect(savedInventory._id).toBeDefined();
            expect(savedInventory.product.toString()).toBe(testProduct._id.toString());
            expect(savedInventory.currentStock).toBe(inventoryData.currentStock);
            expect(savedInventory.minStock).toBe(inventoryData.minStock);
            expect(savedInventory.maxStock).toBe(inventoryData.maxStock);
            expect(savedInventory.status).toBe(inventoryData.status);
        });

        test('should set default values', async () => {
            const inventoryData = {
                product: testProduct._id,
                currentStock: 100
            };

            const inventory = new Inventory(inventoryData);
            const savedInventory = await inventory.save();

            expect(savedInventory.minStock).toBe(5);
            expect(savedInventory.maxStock).toBe(100);
            expect(savedInventory.reservedStock).toBe(0);
            expect(savedInventory.totalSold).toBe(0);
            expect(savedInventory.status).toBe('active');
        });

        test('should require product field', async () => {
            const inventoryData = {
                currentStock: 100,
                minStock: 10,
                maxStock: 500
            };

            const inventory = new Inventory(inventoryData);
            await expect(inventory.save()).rejects.toThrow();
        });

        test('should use default currentStock value', async () => {
            const inventoryData = {
                product: testProduct._id,
                minStock: 10,
                maxStock: 500
            };

            const inventory = new Inventory(inventoryData);
            const savedInventory = await inventory.save();

            expect(savedInventory.currentStock).toBe(0);
        });
    });

    describe('Virtual Properties', () => {
        test('should calculate availableStock correctly', async () => {
            const inventoryData = {
                product: testProduct._id,
                currentStock: 100,
                reservedStock: 20
            };

            const inventory = new Inventory(inventoryData);
            await inventory.save();

            expect(inventory.availableStock).toBe(80);
        });

        test('should calculate stockStatus correctly', async () => {
            const inventoryData = {
                product: testProduct._id,
                currentStock: 100,
                minStock: 10,
                maxStock: 500
            };

            const inventory = new Inventory(inventoryData);
            await inventory.save();

            expect(inventory.stockStatus).toBe('Normal');

            inventory.currentStock = 5;
            await inventory.save();

            expect(inventory.stockStatus).toBe('Stock bajo');

            inventory.currentStock = 0;
            await inventory.save();

            expect(inventory.stockStatus).toBe('Agotado');
        });
    });

    describe('Instance Methods', () => {
        test('should reserve stock correctly', async () => {
            const inventoryData = {
                product: testProduct._id,
                currentStock: 100,
                reservedStock: 0
            };

            const inventory = new Inventory(inventoryData);
            await inventory.save();

            await inventory.reserveStock(20);

            expect(inventory.reservedStock).toBe(20);
            expect(inventory.availableStock).toBe(80);
        });

        test('should release stock correctly', async () => {
            const inventoryData = {
                product: testProduct._id,
                currentStock: 100,
                reservedStock: 20
            };

            const inventory = new Inventory(inventoryData);
            await inventory.save();

            await inventory.releaseStock(10);

            expect(inventory.reservedStock).toBe(10);
            expect(inventory.availableStock).toBe(90);
        });

        test('should sell stock correctly', async () => {
            const inventoryData = {
                product: testProduct._id,
                currentStock: 100,
                reservedStock: 20,
                totalSold: 0
            };

            const inventory = new Inventory(inventoryData);
            await inventory.save();

            await inventory.sellStock(10);

            expect(inventory.currentStock).toBe(90);
            expect(inventory.reservedStock).toBe(10);
            expect(inventory.totalSold).toBe(10);
        });
    });
});
