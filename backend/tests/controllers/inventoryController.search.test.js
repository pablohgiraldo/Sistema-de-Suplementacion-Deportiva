import request from 'supertest';
import express from 'express';
import Product from '../../src/models/Product.js';
import Inventory from '../../src/models/Inventory.js';
import { getInventories } from '../../src/controllers/inventoryController.js';

const app = express();
app.use(express.json());
app.get('/inventory', getInventories);

const createInventoryRecord = async ({ name, brand, categories = [], description = '' }) => {
    const product = await Product.create({
        name,
        brand,
        price: 99.99,
        categories,
        description
    });

    const inventory = new Inventory({
        product: product._id,
        minStock: 5,
        maxStock: 200,
        reservedStock: 1,
        channels: {
            physical: { stock: 8, location: 'Central' },
            digital: { stock: 4, platform: 'website' }
        },
        status: 'active'
    });

    await inventory.save();
    return { product, inventory };
};

describe('GET /inventory search filter', () => {
    beforeEach(async () => {
        await createInventoryRecord({
            name: 'Whey Protein Deluxe',
            brand: 'SuperGains',
            categories: ['proteína', 'suplemento'],
            description: 'Proteína premium de suero de leche.'
        });

        await createInventoryRecord({
            name: 'Creatina Monohidratada',
            brand: 'PowerLifts',
            categories: ['creatina'],
            description: 'Creatina micronizada para fuerza y resistencia.'
        });
    });

    test('should return inventory items that match the search term across product fields', async () => {
        const response = await request(app)
            .get('/inventory?search=whey')
            .expect(200);

        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data).toHaveLength(1);
        expect(response.body.data[0].product.name).toBe('Whey Protein Deluxe');
    });

    test('should return empty results when no product matches search term', async () => {
        const response = await request(app)
            .get('/inventory?search=glutamina')
            .expect(200);

        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data).toHaveLength(0);
        expect(response.body.totalCount).toBe(0);
        expect(response.body.pagination.totalPages).toBe(0);
    });
});

