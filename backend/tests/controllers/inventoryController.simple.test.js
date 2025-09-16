import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import Product from '../../src/models/Product.js';
import Inventory from '../../src/models/Inventory.js';
import { getInventories, getInventoryStats } from '../../src/controllers/inventoryController.js';

// Create test app
const app = express();
app.use(express.json());

// Mock routes
app.get('/inventory', getInventories);
app.get('/inventory/stats', getInventoryStats);

describe('Inventory Controller - Simple Tests', () => {
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

    // Create test inventory
    const inventoryData = {
      product: testProduct._id,
      currentStock: 100,
      minStock: 10,
      maxStock: 500,
      status: 'active'
    };
    const inventory = new Inventory(inventoryData);
    await inventory.save();
  });

  describe('GET /inventory', () => {
    test('should get all inventories successfully', async () => {
      const response = await request(app)
        .get('/inventory')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.totalCount).toBe(1);
    });

    test('should filter inventories by status', async () => {
      const response = await request(app)
        .get('/inventory?status=active')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].status).toBe('active');
    });

    test('should paginate inventories correctly', async () => {
      const response = await request(app)
        .get('/inventory?limit=1&page=1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
    });
  });

  describe('GET /inventory/stats', () => {
    test('should get inventory stats successfully', async () => {
      const response = await request(app)
        .get('/inventory/stats')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.general).toBeDefined();
      expect(response.body.data.general.totalProducts).toBeDefined();
    });
  });
});
