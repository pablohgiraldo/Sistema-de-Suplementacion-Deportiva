import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import User from '../../src/models/User.js';
import Product from '../../src/models/Product.js';
import Inventory from '../../src/models/Inventory.js';
import {
  getInventories,
  getInventoryById,
  createInventory,
  updateInventory,
  deleteInventory,
  restockProduct,
  getInventoryStats
} from '../../src/controllers/inventoryController.js';

// Create test app
const app = express();
app.use(express.json());

// Mock routes
app.get('/inventory', getInventories);
app.get('/inventory/:id', getInventoryById);
app.post('/inventory', createInventory);
app.put('/inventory/:id', updateInventory);
app.delete('/inventory/:id', deleteInventory);
app.post('/inventory/:id/restock', restockProduct);
app.get('/inventory/stats', getInventoryStats);

describe('Inventory Controller', () => {
  let testUser;
  let testProduct;
  let testInventory;
  let accessToken;

  beforeEach(async () => {
    // Create test user
    const userData = {
      nombre: 'Test User',
      email: 'test@example.com',
      contraseña: 'password123',
      rol: 'admin'
    };

    testUser = new User(userData);
    await testUser.save();

    // Generate token
    accessToken = jwt.sign(
      { userId: testUser._id, role: testUser.rol },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

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

    testInventory = new Inventory(inventoryData);
    await testInventory.save();
  });

  describe('GET /inventory', () => {
    test('should get all inventories successfully', async () => {
      const response = await request(app)
        .get('/inventory')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].product.name).toBe('Test Product');
      expect(response.body.totalCount).toBe(1);
    });

    test('should filter inventories by status', async () => {
      // Create inactive inventory
      const inactiveProduct = new Product({
        name: 'Inactive Product',
        brand: 'Test Brand',
        price: 19.99,
        stock: 50
      });
      await inactiveProduct.save();

      const inactiveInventory = new Inventory({
        product: inactiveProduct._id,
        currentStock: 50,
        minStock: 10,
        maxStock: 200,
        status: 'inactive'
      });
      await inactiveInventory.save();

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
      expect(response.body.page).toBe(1);
      expect(response.body.totalPages).toBe(1);
    });

    test('should sort inventories correctly', async () => {
      // Create another inventory
      const anotherProduct = new Product({
        name: 'Another Product',
        brand: 'Test Brand',
        price: 39.99,
        stock: 200
      });
      await anotherProduct.save();

      const anotherInventory = new Inventory({
        product: anotherProduct._id,
        currentStock: 200,
        minStock: 20,
        maxStock: 600,
        status: 'active'
      });
      await anotherInventory.save();

      const response = await request(app)
        .get('/inventory?sortBy=currentStock&order=desc')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].currentStock).toBe(200);
      expect(response.body.data[1].currentStock).toBe(100);
    });
  });

  describe('GET /inventory/:id', () => {
    test('should get inventory by id successfully', async () => {
      const response = await request(app)
        .get(`/inventory/${testInventory._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id.toString()).toBe(testInventory._id.toString());
      expect(response.body.data.product.name).toBe('Test Product');
    });

    test('should return error for non-existent inventory', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/inventory/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Registro de inventario no encontrado');
    });

    test('should return error for invalid id format', async () => {
      const response = await request(app)
        .get('/inventory/invalid-id')
        .expect(500);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /inventory', () => {
    test('should create inventory successfully', async () => {
      const newProduct = new Product({
        name: 'New Product',
        brand: 'Test Brand',
        price: 49.99,
        stock: 200
      });
      await newProduct.save();

      const inventoryData = {
        productId: newProduct._id,
        currentStock: 200,
        minStock: 20,
        maxStock: 600,
        status: 'active'
      };

      const response = await request(app)
        .post('/inventory')
        .send(inventoryData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.product.toString()).toBe(newProduct._id.toString());
      expect(response.body.data.currentStock).toBe(200);
    });

    test('should return error for duplicate product inventory', async () => {
      const inventoryData = {
        productId: testProduct._id,
        currentStock: 150,
        minStock: 15,
        maxStock: 400
      };

      const response = await request(app)
        .post('/inventory')
        .send(inventoryData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Ya existe un registro de inventario para este producto');
    });

    test('should return error for non-existent product', async () => {
      const fakeProductId = new mongoose.Types.ObjectId();
      const inventoryData = {
        productId: fakeProductId,
        currentStock: 150,
        minStock: 15,
        maxStock: 400
      };

      const response = await request(app)
        .post('/inventory')
        .send(inventoryData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /inventory/:id', () => {
    test('should update inventory successfully', async () => {
      const updateData = {
        currentStock: 150,
        minStock: 20,
        maxStock: 600
      };

      const response = await request(app)
        .put(`/inventory/${testInventory._id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.currentStock).toBe(150);
      expect(response.body.data.minStock).toBe(20);
      expect(response.body.data.maxStock).toBe(600);
    });

    test('should return error for non-existent inventory', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const updateData = {
        currentStock: 150
      };

      const response = await request(app)
        .put(`/inventory/${fakeId}`)
        .send(updateData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Registro de inventario no encontrado');
    });
  });

  describe('DELETE /inventory/:id', () => {
    test('should delete inventory successfully', async () => {
      const response = await request(app)
        .delete(`/inventory/${testInventory._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Registro de inventario eliminado');

      // Verify inventory is deleted
      const deletedInventory = await Inventory.findById(testInventory._id);
      expect(deletedInventory).toBeNull();
    });

    test('should return error for non-existent inventory', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .delete(`/inventory/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Registro de inventario no encontrado');
    });
  });

  describe('POST /inventory/:id/restock', () => {
    test('should restock inventory successfully', async () => {
      const restockData = {
        quantity: 50
      };

      const response = await request(app)
        .post(`/inventory/${testInventory._id}/restock`)
        .send(restockData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Stock reabastecido');
      expect(response.body.data.currentStock).toBe(150);
    });

    test('should return error for negative quantity', async () => {
      const restockData = {
        quantity: -10
      };

      const response = await request(app)
        .post(`/inventory/${testInventory._id}/restock`)
        .send(restockData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('La cantidad a reabastecer debe ser positiva');
    });

    test('should return error for non-existent inventory', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const restockData = {
        quantity: 50
      };

      const response = await request(app)
        .post(`/inventory/${fakeId}/restock`)
        .send(restockData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Registro de inventario no encontrado');
    });
  });

  describe('GET /inventory/stats', () => {
    test('should get inventory stats successfully', async () => {
      const response = await request(app)
        .get('/inventory/stats')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalProducts).toBe(1);
      expect(response.body.data.totalCurrentStock).toBe(100);
      expect(response.body.data.totalReservedStock).toBe(0);
      expect(response.body.data.totalAvailableStock).toBe(100);
      expect(response.body.data.totalSold).toBe(0);
      expect(response.body.data.lowStockCount).toBe(0);
      expect(response.body.data.outOfStockCount).toBe(0);
    });

    test('should calculate stats correctly with multiple inventories', async () => {
      // Create another inventory
      const anotherProduct = new Product({
        name: 'Another Product',
        brand: 'Test Brand',
        price: 39.99,
        stock: 200
      });
      await anotherProduct.save();

      const anotherInventory = new Inventory({
        product: anotherProduct._id,
        currentStock: 200,
        minStock: 20,
        maxStock: 600,
        status: 'active'
      });
      await anotherInventory.save();

      const response = await request(app)
        .get('/inventory/stats')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalProducts).toBe(2);
      expect(response.body.data.totalCurrentStock).toBe(300);
      expect(response.body.data.totalAvailableStock).toBe(300);
    });
  });
});
