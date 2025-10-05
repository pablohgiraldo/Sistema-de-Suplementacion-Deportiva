import mongoose from 'mongoose';
import Inventory from '../../src/models/Inventory.js';
import Product from '../../src/models/Product.js';

describe('Inventory Model - Comprehensive Tests', () => {
    let testProduct;

    beforeEach(async () => {
        // Create test product
        testProduct = new Product({
            name: 'Test Product',
            price: 29.99,
            stock: 100
        });
        await testProduct.save();
    });

    const createValidInventoryData = () => ({
        product: testProduct._id,
        currentStock: 50,
        minStock: 10,
        maxStock: 100,
        reservedStock: 5,
        status: 'active'
    });

    describe('Schema Validation', () => {
        test('should create a valid inventory record', async () => {
            const inventoryData = createValidInventoryData();
            const inventory = new Inventory(inventoryData);
            const savedInventory = await inventory.save();

            expect(savedInventory._id).toBeDefined();
            expect(savedInventory.product.toString()).toBe(testProduct._id.toString());
            expect(savedInventory.currentStock).toBe(50);
            expect(savedInventory.minStock).toBe(10);
            expect(savedInventory.maxStock).toBe(100);
            expect(savedInventory.reservedStock).toBe(5);
            expect(savedInventory.availableStock).toBe(45); // currentStock - reservedStock
            expect(savedInventory.status).toBe('active');
            expect(savedInventory.lastRestocked).toBeDefined();
            expect(savedInventory.totalSold).toBe(0);
            expect(savedInventory.createdAt).toBeDefined();
            expect(savedInventory.updatedAt).toBeDefined();
        });

        test('should create inventory with default values', async () => {
            const inventory = new Inventory({
                product: testProduct._id
            });
            const savedInventory = await inventory.save();

            expect(savedInventory.currentStock).toBe(0);
            expect(savedInventory.minStock).toBe(5);
            expect(savedInventory.maxStock).toBe(100);
            expect(savedInventory.reservedStock).toBe(0);
            expect(savedInventory.availableStock).toBe(0);
            expect(savedInventory.status).toBe('out_of_stock'); // 0 stock = out_of_stock
            expect(savedInventory.totalSold).toBe(0);
        });

        test('should require product field', async () => {
            const inventory = new Inventory({
                currentStock: 50
            });

            await expect(inventory.save()).rejects.toThrow();
        });

        test('should ensure unique product per inventory record', async () => {
            const inventory1 = new Inventory(createValidInventoryData());
            await inventory1.save();

            const inventory2 = new Inventory(createValidInventoryData());
            await expect(inventory2.save()).rejects.toThrow();
        });

        test('should validate currentStock minimum value', async () => {
            const inventory = new Inventory({
                product: testProduct._id,
                currentStock: -5
            });

            await expect(inventory.save()).rejects.toThrow();
        });

        test('should validate minStock minimum value', async () => {
            const inventory = new Inventory({
                product: testProduct._id,
                minStock: -1
            });

            await expect(inventory.save()).rejects.toThrow();
        });

        test('should validate maxStock minimum value', async () => {
            const inventory = new Inventory({
                product: testProduct._id,
                maxStock: -1
            });

            await expect(inventory.save()).rejects.toThrow();
        });

        test('should validate reservedStock minimum value', async () => {
            const inventory = new Inventory({
                product: testProduct._id,
                reservedStock: -1
            });

            await expect(inventory.save()).rejects.toThrow();
        });

        test('should validate status enum', async () => {
            const inventory = new Inventory({
                product: testProduct._id,
                status: 'invalid_status'
            });

            await expect(inventory.save()).rejects.toThrow();
        });

        test('should validate notes length', async () => {
            const inventory = new Inventory({
                product: testProduct._id,
                notes: 'A'.repeat(501) // Exceeds max length
            });

            await expect(inventory.save()).rejects.toThrow();
        });
    });

    describe('Virtual Properties', () => {
        let inventory;

        beforeEach(async () => {
            const inventoryData = createValidInventoryData();
            inventory = new Inventory(inventoryData);
            await inventory.save();
        });

        test('should determine stock status correctly', () => {
            expect(inventory.stockStatus).toBe('Normal');

            inventory.currentStock = 5; // Below minStock
            expect(inventory.stockStatus).toBe('Stock bajo');

            inventory.currentStock = 0;
            expect(inventory.stockStatus).toBe('Agotado');

            inventory.currentStock = 100; // At maxStock
            expect(inventory.stockStatus).toBe('Stock alto');

            inventory.currentStock = 150; // Above maxStock
            expect(inventory.stockStatus).toBe('Stock alto');
        });

        test('should determine if restock is needed', () => {
            expect(inventory.needsRestock).toBe(false);

            inventory.currentStock = 5; // Below minStock
            expect(inventory.needsRestock).toBe(true);

            inventory.currentStock = 0;
            expect(inventory.needsRestock).toBe(true);
        });

        test('should determine if product is available', () => {
            expect(inventory.isAvailable).toBe(true);

            inventory.status = 'inactive';
            expect(inventory.isAvailable).toBe(false);

            inventory.status = 'active';
            inventory.availableStock = 0;
            expect(inventory.isAvailable).toBe(false);
        });
    });

    describe('Pre-save Middleware', () => {
        test('should calculate available stock automatically', async () => {
            const inventory = new Inventory({
                product: testProduct._id,
                currentStock: 100,
                reservedStock: 20
            });

            const savedInventory = await inventory.save();
            expect(savedInventory.availableStock).toBe(80);
        });

        test('should update status to out_of_stock when stock is 0', async () => {
            const inventory = new Inventory({
                product: testProduct._id,
                currentStock: 0,
                status: 'active'
            });

            const savedInventory = await inventory.save();
            expect(savedInventory.status).toBe('out_of_stock');
        });

        test('should update status to active when stock is restored', async () => {
            const inventory = new Inventory({
                product: testProduct._id,
                currentStock: 0,
                status: 'out_of_stock'
            });
            await inventory.save();

            inventory.currentStock = 10;
            const savedInventory = await inventory.save();
            expect(savedInventory.status).toBe('active');
        });
    });

    describe('Inventory Methods', () => {
        let inventory;

        beforeEach(async () => {
            const inventoryData = createValidInventoryData();
            inventory = new Inventory(inventoryData);
            await inventory.save();
        });

        describe('reserveStock method', () => {
            test('should reserve stock successfully', async () => {
                await inventory.reserveStock(10);

                expect(inventory.reservedStock).toBe(15); // 5 + 10
                expect(inventory.availableStock).toBe(35); // 50 - 15
            });

            test('should throw error when insufficient stock', async () => {
                await expect(inventory.reserveStock(50)).rejects.toThrow('Stock insuficiente');
            });

            test('should handle exact available stock', async () => {
                await inventory.reserveStock(45); // Available stock

                expect(inventory.reservedStock).toBe(50); // 5 + 45
                expect(inventory.availableStock).toBe(0);
            });
        });

        describe('releaseStock method', () => {
            test('should release reserved stock', async () => {
                await inventory.releaseStock(3);

                expect(inventory.reservedStock).toBe(2); // 5 - 3
                expect(inventory.availableStock).toBe(48); // 50 - 2
            });

            test('should handle releasing more than reserved', async () => {
                await inventory.releaseStock(10); // More than reserved

                expect(inventory.reservedStock).toBe(0);
                expect(inventory.availableStock).toBe(50);
            });
        });

        describe('sellStock method', () => {
            test('should sell stock successfully', async () => {
                await inventory.sellStock(10);

                expect(inventory.currentStock).toBe(40); // 50 - 10
                expect(inventory.reservedStock).toBe(0); // Should reduce reserved if any
                expect(inventory.availableStock).toBe(40);
                expect(inventory.totalSold).toBe(10);
                expect(inventory.lastSold).toBeDefined();
            });

            test('should throw error when insufficient available stock', async () => {
                await expect(inventory.sellStock(50)).rejects.toThrow('Stock insuficiente');
            });

            test('should handle selling with reserved stock', async () => {
                await inventory.reserveStock(10);
                await inventory.sellStock(5);

                expect(inventory.currentStock).toBe(45); // 50 - 5
                expect(inventory.reservedStock).toBe(5); // 15 - 10 (reduced by sold amount)
                expect(inventory.totalSold).toBe(5);
            });
        });

        describe('restock method', () => {
            test('should restock successfully', async () => {
                const restockDate = new Date();
                await inventory.restock(30, 'Monthly restock');

                expect(inventory.currentStock).toBe(80); // 50 + 30
                expect(inventory.availableStock).toBe(75); // 80 - 5 (reserved)
                expect(inventory.lastRestocked).toBeDefined();
                expect(inventory.notes).toBe('Monthly restock');
            });

            test('should restock without notes', async () => {
                await inventory.restock(20);

                expect(inventory.currentStock).toBe(70);
                expect(inventory.notes).toBeUndefined();
            });

            test('should change status from out_of_stock to active', async () => {
                inventory.currentStock = 0;
                inventory.status = 'out_of_stock';
                await inventory.save();

                await inventory.restock(20);

                expect(inventory.status).toBe('active');
            });
        });
    });

    describe('Static Methods', () => {
        beforeEach(async () => {
            // Create multiple inventory records for testing
            const products = [];
            for (let i = 0; i < 3; i++) {
                const product = new Product({
                    name: `Product ${i}`,
                    price: 29.99 + i * 10,
                    stock: 100
                });
                products.push(await product.save());
            }

            const inventories = [
                { product: products[0]._id, currentStock: 5, minStock: 10, status: 'active' },
                { product: products[1]._id, currentStock: 0, minStock: 5, status: 'active' },
                { product: products[2]._id, currentStock: 20, minStock: 5, status: 'active' }
            ];

            for (const inventoryData of inventories) {
                const inventory = new Inventory(inventoryData);
                await inventory.save();
            }
        });

        describe('getLowStockProducts method', () => {
            test('should return products with low stock', async () => {
                const lowStockProducts = await Inventory.getLowStockProducts();

                expect(lowStockProducts.length).toBeGreaterThan(0);
                lowStockProducts.forEach(inventory => {
                    expect(inventory.currentStock).toBeLessThanOrEqual(inventory.minStock);
                    expect(inventory.status).toBe('active');
                    expect(inventory.product).toBeDefined();
                });
            });
        });

        describe('getOutOfStockProducts method', () => {
            test('should return out of stock products', async () => {
                const outOfStockProducts = await Inventory.getOutOfStockProducts();

                expect(outOfStockProducts.length).toBeGreaterThan(0);
                outOfStockProducts.forEach(inventory => {
                    expect(inventory.currentStock).toBe(0);
                    expect(inventory.status).toBe('active');
                    expect(inventory.product).toBeDefined();
                });
            });
        });
    });

    describe('Integration Tests', () => {
        test('should populate product reference', async () => {
            const inventory = new Inventory(createValidInventoryData());
            await inventory.save();

            const populatedInventory = await Inventory.findById(inventory._id).populate('product');
            expect(populatedInventory.product.name).toBe(testProduct.name);
            expect(populatedInventory.product.price).toBe(testProduct.price);
        });

        test('should maintain data consistency through operations', async () => {
            const inventory = new Inventory({
                product: testProduct._id,
                currentStock: 100,
                minStock: 10,
                maxStock: 200,
                reservedStock: 0
            });
            await inventory.save();

            // Reserve stock
            await inventory.reserveStock(20);
            expect(inventory.availableStock).toBe(80);

            // Sell some stock
            await inventory.sellStock(15);
            expect(inventory.currentStock).toBe(85);
            expect(inventory.availableStock).toBe(65);
            expect(inventory.totalSold).toBe(15);

            // Release some reserved stock
            await inventory.releaseStock(5);
            expect(inventory.availableStock).toBe(70);

            // Restock
            await inventory.restock(50);
            expect(inventory.currentStock).toBe(135);
            expect(inventory.availableStock).toBe(120);
        });
    });

    describe('Edge Cases', () => {
        test('should handle zero stock operations', async () => {
            const inventory = new Inventory({
                product: testProduct._id,
                currentStock: 0,
                minStock: 5,
                maxStock: 100
            });
            await inventory.save();

            expect(inventory.availableStock).toBe(0);
            expect(inventory.stockStatus).toBe('Agotado');
            expect(inventory.needsRestock).toBe(true);
            expect(inventory.isAvailable).toBe(false);
        });

        test('should handle maximum stock values', async () => {
            const inventory = new Inventory({
                product: testProduct._id,
                currentStock: 1000,
                minStock: 100,
                maxStock: 1000
            });
            await inventory.save();

            expect(inventory.stockStatus).toBe('Stock alto');
            expect(inventory.isAvailable).toBe(true);
        });

        test('should handle decimal stock values', async () => {
            const inventory = new Inventory({
                product: testProduct._id,
                currentStock: 50.5,
                reservedStock: 10.25
            });
            await inventory.save();

            expect(inventory.availableStock).toBeCloseTo(40.25, 2);
        });
    });
});