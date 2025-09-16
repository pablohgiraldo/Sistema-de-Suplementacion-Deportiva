import mongoose from 'mongoose';
import Inventory from '../../src/models/Inventory.js';
import Product from '../../src/models/Product.js';

describe('Inventory Model', () => {
  let testProduct;

  beforeEach(async () => {
    // Create a test product for inventory tests
    const productData = {
      name: 'Test Product',
      brand: 'Test Brand',
      price: 29.99,
      stock: 100
    };

    testProduct = new Product(productData);
    await testProduct.save();
  });

  describe('Schema Validation', () => {
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
      expect(savedInventory.reservedStock).toBe(0);
      expect(savedInventory.totalSold).toBe(0);
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

    test('should require currentStock field', async () => {
      const inventoryData = {
        product: testProduct._id,
        minStock: 10,
        maxStock: 500
      };

      const inventory = new Inventory(inventoryData);
      await expect(inventory.save()).rejects.toThrow();
    });

    test('should validate currentStock is non-negative', async () => {
      const inventoryData = {
        product: testProduct._id,
        currentStock: -10,
        minStock: 10,
        maxStock: 500
      };

      const inventory = new Inventory(inventoryData);
      await expect(inventory.save()).rejects.toThrow();
    });

    test('should validate minStock is non-negative', async () => {
      const inventoryData = {
        product: testProduct._id,
        currentStock: 100,
        minStock: -10,
        maxStock: 500
      };

      const inventory = new Inventory(inventoryData);
      await expect(inventory.save()).rejects.toThrow();
    });

    test('should validate maxStock is non-negative', async () => {
      const inventoryData = {
        product: testProduct._id,
        currentStock: 100,
        minStock: 10,
        maxStock: -10
      };

      const inventory = new Inventory(inventoryData);
      await expect(inventory.save()).rejects.toThrow();
    });

    test('should validate status enum', async () => {
      const inventoryData = {
        product: testProduct._id,
        currentStock: 100,
        minStock: 10,
        maxStock: 500,
        status: 'invalid-status'
      };

      const inventory = new Inventory(inventoryData);
      await expect(inventory.save()).rejects.toThrow();
    });

    test('should enforce unique product constraint', async () => {
      const inventoryData = {
        product: testProduct._id,
        currentStock: 100,
        minStock: 10,
        maxStock: 500
      };

      const inventory1 = new Inventory(inventoryData);
      await inventory1.save();

      const inventory2 = new Inventory(inventoryData);
      await expect(inventory2.save()).rejects.toThrow();
    });

    test('should set default values', async () => {
      const inventoryData = {
        product: testProduct._id,
        currentStock: 100
      };

      const inventory = new Inventory(inventoryData);
      const savedInventory = await inventory.save();

      expect(savedInventory.minStock).toBe(10);
      expect(savedInventory.maxStock).toBe(100);
      expect(savedInventory.reservedStock).toBe(0);
      expect(savedInventory.totalSold).toBe(0);
      expect(savedInventory.status).toBe('active');
      expect(savedInventory.lastRestockDate).toBeDefined();
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

      inventory.currentStock = 600;
      await inventory.save();

      expect(inventory.stockStatus).toBe('Stock alto');
    });

    test('should calculate needsRestock correctly', async () => {
      const inventoryData = {
        product: testProduct._id,
        currentStock: 100,
        minStock: 10
      };

      const inventory = new Inventory(inventoryData);
      await inventory.save();

      expect(inventory.needsRestock).toBe(false);

      inventory.currentStock = 5;
      await inventory.save();

      expect(inventory.needsRestock).toBe(true);
    });

    test('should calculate isAvailable correctly', async () => {
      const inventoryData = {
        product: testProduct._id,
        currentStock: 100,
        reservedStock: 20,
        status: 'active'
      };

      const inventory = new Inventory(inventoryData);
      await inventory.save();

      expect(inventory.isAvailable).toBe(true);

      inventory.status = 'inactive';
      await inventory.save();

      expect(inventory.isAvailable).toBe(false);

      inventory.status = 'active';
      inventory.currentStock = 0;
      await inventory.save();

      expect(inventory.isAvailable).toBe(false);
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

    test('should throw error when reserving more than available', async () => {
      const inventoryData = {
        product: testProduct._id,
        currentStock: 100,
        reservedStock: 0
      };

      const inventory = new Inventory(inventoryData);
      await inventory.save();

      await expect(inventory.reserveStock(150)).rejects.toThrow('Stock insuficiente');
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

    test('should throw error when releasing more than reserved', async () => {
      const inventoryData = {
        product: testProduct._id,
        currentStock: 100,
        reservedStock: 20
      };

      const inventory = new Inventory(inventoryData);
      await inventory.save();

      await expect(inventory.releaseStock(30)).rejects.toThrow('No hay suficiente stock reservado');
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
      expect(inventory.lastSaleDate).toBeDefined();
    });

    test('should throw error when selling more than available', async () => {
      const inventoryData = {
        product: testProduct._id,
        currentStock: 100,
        reservedStock: 0
      };

      const inventory = new Inventory(inventoryData);
      await inventory.save();

      await expect(inventory.sellStock(150)).rejects.toThrow('Stock insuficiente para vender');
    });

    test('should restock correctly', async () => {
      const inventoryData = {
        product: testProduct._id,
        currentStock: 100,
        lastRestockDate: new Date('2023-01-01')
      };

      const inventory = new Inventory(inventoryData);
      await inventory.save();

      const originalDate = inventory.lastRestockDate;
      await inventory.restock(50);

      expect(inventory.currentStock).toBe(150);
      expect(inventory.lastRestockDate.getTime()).toBeGreaterThan(originalDate.getTime());
    });
  });

  describe('Static Methods', () => {
    beforeEach(async () => {
      // Create test products and inventories
      const products = [
        { name: 'Product 1', brand: 'Brand A', price: 29.99, stock: 100 },
        { name: 'Product 2', brand: 'Brand B', price: 49.99, stock: 100 },
        { name: 'Product 3', brand: 'Brand C', price: 19.99, stock: 100 }
      ];

      const createdProducts = [];
      for (const productData of products) {
        const product = new Product(productData);
        await product.save();
        createdProducts.push(product);
      }

      const inventories = [
        {
          product: createdProducts[0]._id,
          currentStock: 100,
          minStock: 10,
          status: 'active'
        },
        {
          product: createdProducts[1]._id,
          currentStock: 5,
          minStock: 10,
          status: 'active'
        },
        {
          product: createdProducts[2]._id,
          currentStock: 0,
          minStock: 10,
          status: 'active'
        }
      ];

      for (const inventoryData of inventories) {
        const inventory = new Inventory(inventoryData);
        await inventory.save();
      }
    });

    test('should find low stock products', async () => {
      const lowStockProducts = await Inventory.getLowStockProducts();
      expect(lowStockProducts).toHaveLength(1);
      expect(lowStockProducts[0].currentStock).toBe(5);
    });

    test('should find out of stock products', async () => {
      const outOfStockProducts = await Inventory.getOutOfStockProducts();
      expect(outOfStockProducts).toHaveLength(1);
      expect(outOfStockProducts[0].currentStock).toBe(0);
    });
  });
});
