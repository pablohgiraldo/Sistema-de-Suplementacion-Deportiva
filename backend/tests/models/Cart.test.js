import mongoose from 'mongoose';
import Cart from '../../src/models/Cart.js';
import User from '../../src/models/User.js';
import Product from '../../src/models/Product.js';

describe('Cart Model', () => {
  let testUser;
  let testProduct;

  beforeEach(async () => {
    // Create test user
    const userData = {
      nombre: 'Test User',
      email: 'test@example.com',
      contraseña: 'password123'
    };

    testUser = new User(userData);
    await testUser.save();

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

  describe('Schema Validation', () => {
    test('should create a valid cart', async () => {
      const cartData = {
        user: testUser._id,
        items: [
          {
            product: testProduct._id,
            quantity: 2,
            price: 29.99
          }
        ],
        total: 59.98
      };

      const cart = new Cart(cartData);
      const savedCart = await cart.save();

      expect(savedCart._id).toBeDefined();
      expect(savedCart.user.toString()).toBe(testUser._id.toString());
      expect(savedCart.items).toHaveLength(1);
      expect(savedCart.total).toBe(59.98);
    });

    test('should require user field', async () => {
      const cartData = {
        items: [
          {
            product: testProduct._id,
            quantity: 2,
            price: 29.99
          }
        ],
        total: 59.98
      };

      const cart = new Cart(cartData);
      await expect(cart.save()).rejects.toThrow();
    });

    test('should validate items array', async () => {
      const cartData = {
        user: testUser._id,
        items: 'not-an-array',
        total: 59.98
      };

      const cart = new Cart(cartData);
      await expect(cart.save()).rejects.toThrow();
    });

    test('should validate item structure', async () => {
      const cartData = {
        user: testUser._id,
        items: [
          {
            // Missing required fields
            quantity: 2
          }
        ],
        total: 59.98
      };

      const cart = new Cart(cartData);
      await expect(cart.save()).rejects.toThrow();
    });

    test('should validate quantity is positive', async () => {
      const cartData = {
        user: testUser._id,
        items: [
          {
            product: testProduct._id,
            quantity: -1,
            price: 29.99
          }
        ],
        total: 59.98
      };

      const cart = new Cart(cartData);
      await expect(cart.save()).rejects.toThrow();
    });

    test('should validate price is positive', async () => {
      const cartData = {
        user: testUser._id,
        items: [
          {
            product: testProduct._id,
            quantity: 2,
            price: -29.99
          }
        ],
        total: 59.98
      };

      const cart = new Cart(cartData);
      await expect(cart.save()).rejects.toThrow();
    });

    test('should set default values', async () => {
      const cartData = {
        user: testUser._id,
        items: [
          {
            product: testProduct._id,
            quantity: 2,
            price: 29.99
          }
        ]
      };

      const cart = new Cart(cartData);
      const savedCart = await cart.save();

      expect(savedCart.items).toHaveLength(1);
      expect(savedCart.total).toBe(59.98);
    });
  });

  describe('Virtual Properties', () => {
    test('should calculate itemCount correctly', async () => {
      const cartData = {
        user: testUser._id,
        items: [
          {
            product: testProduct._id,
            quantity: 2,
            price: 29.99
          }
        ]
      };

      const cart = new Cart(cartData);
      await cart.save();

      expect(cart.itemCount).toBe(2);
    });

    test('should calculate isEmpty correctly', async () => {
      const cartData = {
        user: testUser._id,
        items: []
      };

      const cart = new Cart(cartData);
      await cart.save();

      expect(cart.isEmpty).toBe(true);

      cart.items.push({
        product: testProduct._id,
        quantity: 1,
        price: 29.99
      });
      await cart.save();

      expect(cart.isEmpty).toBe(false);
    });
  });

  describe('Instance Methods', () => {
    test('should add item to cart', async () => {
      const cartData = {
        user: testUser._id,
        items: []
      };

      const cart = new Cart(cartData);
      await cart.save();

      await cart.addItem(testProduct._id, 2, 29.99);

      expect(cart.items).toHaveLength(1);
      expect(cart.items[0].product.toString()).toBe(testProduct._id.toString());
      expect(cart.items[0].quantity).toBe(2);
      expect(cart.items[0].price).toBe(29.99);
    });

    test('should update existing item quantity', async () => {
      const cartData = {
        user: testUser._id,
        items: [
          {
            product: testProduct._id,
            quantity: 2,
            price: 29.99
          }
        ]
      };

      const cart = new Cart(cartData);
      await cart.save();

      await cart.addItem(testProduct._id, 3, 29.99);

      expect(cart.items).toHaveLength(1);
      expect(cart.items[0].quantity).toBe(5);
    });

    test('should remove item from cart', async () => {
      const cartData = {
        user: testUser._id,
        items: [
          {
            product: testProduct._id,
            quantity: 2,
            price: 29.99
          }
        ]
      };

      const cart = new Cart(cartData);
      await cart.save();

      await cart.removeItem(testProduct._id);

      expect(cart.items).toHaveLength(0);
    });

    test('should update item quantity', async () => {
      const cartData = {
        user: testUser._id,
        items: [
          {
            product: testProduct._id,
            quantity: 2,
            price: 29.99
          }
        ]
      };

      const cart = new Cart(cartData);
      await cart.save();

      await cart.updateQuantity(testProduct._id, 5);

      expect(cart.items[0].quantity).toBe(5);
    });

    test('should remove item when quantity is 0', async () => {
      const cartData = {
        user: testUser._id,
        items: [
          {
            product: testProduct._id,
            quantity: 2,
            price: 29.99
          }
        ]
      };

      const cart = new Cart(cartData);
      await cart.save();

      await cart.updateQuantity(testProduct._id, 0);

      expect(cart.items).toHaveLength(0);
    });

    test('should clear cart', async () => {
      const cartData = {
        user: testUser._id,
        items: [
          {
            product: testProduct._id,
            quantity: 2,
            price: 29.99
          }
        ]
      };

      const cart = new Cart(cartData);
      await cart.save();

      await cart.clearCart();

      expect(cart.items).toHaveLength(0);
      expect(cart.total).toBe(0);
    });

    test('should calculate total correctly', async () => {
      const cartData = {
        user: testUser._id,
        items: [
          {
            product: testProduct._id,
            quantity: 2,
            price: 29.99
          }
        ]
      };

      const cart = new Cart(cartData);
      await cart.save();

      expect(cart.total).toBe(59.98);
    });
  });

  describe('Query Methods', () => {
    beforeEach(async () => {
      // Create test carts
      const carts = [
        {
          user: testUser._id,
          items: [
            {
              product: testProduct._id,
              quantity: 2,
              price: 29.99
            }
          ],
          total: 59.98
        }
      ];

      for (const cartData of carts) {
        const cart = new Cart(cartData);
        await cart.save();
      }
    });

    test('should find cart by user', async () => {
      const cart = await Cart.findOne({ user: testUser._id });
      expect(cart).toBeDefined();
      expect(cart.user.toString()).toBe(testUser._id.toString());
    });

    test('should populate user and product references', async () => {
      const cart = await Cart.findOne({ user: testUser._id })
        .populate('user', 'nombre email')
        .populate('items.product', 'name brand price');

      expect(cart.user.nombre).toBe('Test User');
      expect(cart.items[0].product.name).toBe('Test Product');
    });
  });

  describe('Update Operations', () => {
    test('should update cart total when items change', async () => {
      const cartData = {
        user: testUser._id,
        items: [
          {
            product: testProduct._id,
            quantity: 2,
            price: 29.99
          }
        ],
        total: 59.98
      };

      const cart = new Cart(cartData);
      await cart.save();

      cart.items[0].quantity = 3;
      await cart.save();

      expect(cart.total).toBe(89.97);
    });

    test('should maintain cart consistency', async () => {
      const cartData = {
        user: testUser._id,
        items: []
      };

      const cart = new Cart(cartData);
      await cart.save();

      // Add multiple items
      await cart.addItem(testProduct._id, 2, 29.99);

      expect(cart.items).toHaveLength(1);
      expect(cart.total).toBe(59.98);

      // Add another product
      const anotherProduct = new Product({
        name: 'Another Product',
        brand: 'Another Brand',
        price: 19.99,
        stock: 50
      });
      await anotherProduct.save();

      await cart.addItem(anotherProduct._id, 1, 19.99);

      expect(cart.items).toHaveLength(2);
      expect(cart.total).toBe(79.97);
    });
  });
});
