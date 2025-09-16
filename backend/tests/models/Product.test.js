import mongoose from 'mongoose';
import Product from '../../src/models/Product.js';

describe('Product Model', () => {
  describe('Schema Validation', () => {
    test('should create a valid product', async () => {
      const productData = {
        name: 'Test Product',
        brand: 'Test Brand',
        price: 29.99,
        stock: 100,
        description: 'Test product description',
        categories: ['supplements', 'protein'],
        imageUrl: 'https://example.com/image.jpg'
      };

      const product = new Product(productData);
      const savedProduct = await product.save();

      expect(savedProduct._id).toBeDefined();
      expect(savedProduct.name).toBe(productData.name);
      expect(savedProduct.brand).toBe(productData.brand);
      expect(savedProduct.price).toBe(productData.price);
      expect(savedProduct.stock).toBe(productData.stock);
      expect(savedProduct.description).toBe(productData.description);
      expect(savedProduct.categories).toEqual(productData.categories);
      expect(savedProduct.imageUrl).toBe(productData.imageUrl);
    });

    test('should require name field', async () => {
      const productData = {
        brand: 'Test Brand',
        price: 29.99,
        stock: 100
      };

      const product = new Product(productData);
      await expect(product.save()).rejects.toThrow();
    });

    test('should require brand field', async () => {
      const productData = {
        name: 'Test Product',
        price: 29.99,
        stock: 100
      };

      const product = new Product(productData);
      await expect(product.save()).rejects.toThrow();
    });

    test('should require price field', async () => {
      const productData = {
        name: 'Test Product',
        brand: 'Test Brand',
        stock: 100
      };

      const product = new Product(productData);
      await expect(product.save()).rejects.toThrow();
    });

    test('should require stock field', async () => {
      const productData = {
        name: 'Test Product',
        brand: 'Test Brand',
        price: 29.99
      };

      const product = new Product(productData);
      await expect(product.save()).rejects.toThrow();
    });

    test('should validate price is positive', async () => {
      const productData = {
        name: 'Test Product',
        brand: 'Test Brand',
        price: -10,
        stock: 100
      };

      const product = new Product(productData);
      await expect(product.save()).rejects.toThrow();
    });

    test('should validate stock is non-negative', async () => {
      const productData = {
        name: 'Test Product',
        brand: 'Test Brand',
        price: 29.99,
        stock: -10
      };

      const product = new Product(productData);
      await expect(product.save()).rejects.toThrow();
    });

    test('should validate price is a number', async () => {
      const productData = {
        name: 'Test Product',
        brand: 'Test Brand',
        price: 'not-a-number',
        stock: 100
      };

      const product = new Product(productData);
      await expect(product.save()).rejects.toThrow();
    });

    test('should validate stock is a number', async () => {
      const productData = {
        name: 'Test Product',
        brand: 'Test Brand',
        price: 29.99,
        stock: 'not-a-number'
      };

      const product = new Product(productData);
      await expect(product.save()).rejects.toThrow();
    });

    test('should set default values', async () => {
      const productData = {
        name: 'Test Product',
        brand: 'Test Brand',
        price: 29.99,
        stock: 100
      };

      const product = new Product(productData);
      const savedProduct = await product.save();

      expect(savedProduct.stock).toBe(100);
      expect(savedProduct.categories).toEqual([]);
      expect(savedProduct.isActive).toBe(true);
    });
  });

  describe('Virtual Properties', () => {
    test('should calculate isInStock correctly', async () => {
      const productData = {
        name: 'Test Product',
        brand: 'Test Brand',
        price: 29.99,
        stock: 10
      };

      const product = new Product(productData);
      await product.save();

      expect(product.isInStock).toBe(true);

      product.stock = 0;
      await product.save();

      expect(product.isInStock).toBe(false);
    });

    test('should calculate stockStatus correctly', async () => {
      const productData = {
        name: 'Test Product',
        brand: 'Test Brand',
        price: 29.99,
        stock: 50
      };

      const product = new Product(productData);
      await product.save();

      expect(product.stockStatus).toBe('Disponible');

      product.stock = 5;
      await product.save();

      expect(product.stockStatus).toBe('Stock bajo');

      product.stock = 0;
      await product.save();

      expect(product.stockStatus).toBe('Agotado');
    });
  });

  describe('Query Methods', () => {
    beforeEach(async () => {
      // Create test products
      const products = [
        {
          name: 'Product 1',
          brand: 'Brand A',
          price: 29.99,
          stock: 100,
          categories: ['supplements']
        },
        {
          name: 'Product 2',
          brand: 'Brand B',
          price: 49.99,
          stock: 0,
          categories: ['protein']
        },
        {
          name: 'Product 3',
          brand: 'Brand A',
          price: 19.99,
          stock: 5,
          categories: ['supplements', 'vitamins']
        }
      ];

      for (const productData of products) {
        const product = new Product(productData);
        await product.save();
      }
    });

    test('should find products by brand', async () => {
      const brandAProducts = await Product.find({ brand: 'Brand A' });
      expect(brandAProducts).toHaveLength(2);
    });

    test('should find products by category', async () => {
      const supplementProducts = await Product.find({ categories: 'supplements' });
      expect(supplementProducts).toHaveLength(2);
    });

    test('should find products in stock', async () => {
      const inStockProducts = await Product.find({ stock: { $gt: 0 } });
      expect(inStockProducts).toHaveLength(2);
    });

    test('should find products by price range', async () => {
      const expensiveProducts = await Product.find({ price: { $gte: 40 } });
      expect(expensiveProducts).toHaveLength(1);
      expect(expensiveProducts[0].name).toBe('Product 2');
    });

    test('should find products with low stock', async () => {
      const lowStockProducts = await Product.find({ stock: { $lte: 10, $gt: 0 } });
      expect(lowStockProducts).toHaveLength(1);
      expect(lowStockProducts[0].name).toBe('Product 3');
    });
  });

  describe('Update Operations', () => {
    test('should update product stock', async () => {
      const productData = {
        name: 'Test Product',
        brand: 'Test Brand',
        price: 29.99,
        stock: 100
      };

      const product = new Product(productData);
      await product.save();

      product.stock = 50;
      await product.save();

      const updatedProduct = await Product.findById(product._id);
      expect(updatedProduct.stock).toBe(50);
    });

    test('should update product price', async () => {
      const productData = {
        name: 'Test Product',
        brand: 'Test Brand',
        price: 29.99,
        stock: 100
      };

      const product = new Product(productData);
      await product.save();

      product.price = 39.99;
      await product.save();

      const updatedProduct = await Product.findById(product._id);
      expect(updatedProduct.price).toBe(39.99);
    });

    test('should update product categories', async () => {
      const productData = {
        name: 'Test Product',
        brand: 'Test Brand',
        price: 29.99,
        stock: 100,
        categories: ['supplements']
      };

      const product = new Product(productData);
      await product.save();

      product.categories = ['supplements', 'protein', 'vitamins'];
      await product.save();

      const updatedProduct = await Product.findById(product._id);
      expect(updatedProduct.categories).toEqual(['supplements', 'protein', 'vitamins']);
    });
  });
});
