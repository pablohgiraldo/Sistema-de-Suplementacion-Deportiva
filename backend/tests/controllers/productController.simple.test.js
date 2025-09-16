import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import Product from '../../src/models/Product.js';
import { getProducts } from '../../src/controllers/productController.js';

// Create test app
const app = express();
app.use(express.json());

// Mock routes
app.get('/products', getProducts);

describe('Product Controller - Simple Tests', () => {
  beforeEach(async () => {
    // Create test products
    const products = [
      {
        name: 'Product 1',
        brand: 'Brand A',
        price: 29.99,
        stock: 100,
        description: 'Test product 1'
      },
      {
        name: 'Product 2',
        brand: 'Brand B',
        price: 49.99,
        stock: 50,
        description: 'Test product 2'
      }
    ];

    for (const productData of products) {
      const product = new Product(productData);
      await product.save();
    }
  });

  describe('GET /products', () => {
    test('should get all products successfully', async () => {
      const response = await request(app)
        .get('/products')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    test('should filter products by brand', async () => {
      const response = await request(app)
        .get('/products?brand=Brand A')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].brand).toBe('Brand A');
    });

    test('should filter products by price range', async () => {
      const response = await request(app)
        .get('/products?minPrice=25&maxPrice=60')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      // Check that all returned products are within price range
      response.body.data.forEach(product => {
        expect(product.price).toBeGreaterThanOrEqual(25);
        expect(product.price).toBeLessThanOrEqual(60);
      });
    });

    test('should search products by name', async () => {
      const response = await request(app)
        .get('/products?search=Product 1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      // Check that at least one product contains the search term
      const hasMatchingProduct = response.body.data.some(product => 
        product.name.includes('Product 1')
      );
      expect(hasMatchingProduct).toBe(true);
    });

    test('should paginate products correctly', async () => {
      const response = await request(app)
        .get('/products?limit=1&page=1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
    });

    test('should sort products correctly', async () => {
      const response = await request(app)
        .get('/products?sortBy=price&order=asc')
        .expect(200);

      expect(response.body.success).toBe(true);
      if (response.body.data.length > 0) {
        // Check that products are sorted by price in ascending order
        const prices = response.body.data.map(p => p.price);
        const sortedPrices = [...prices].sort((a, b) => a - b);
        expect(prices).toEqual(sortedPrices);
      }
    });
  });
});
