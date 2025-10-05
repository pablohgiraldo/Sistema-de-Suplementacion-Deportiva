import mongoose from 'mongoose';
import AlertConfig from '../../src/models/AlertConfig.js';
import Product from '../../src/models/Product.js';

describe('AlertConfig Model - Comprehensive Tests', () => {
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

    const createValidAlertConfigData = () => ({
        product: testProduct._id,
        lowStockThreshold: 10,
        criticalStockThreshold: 5,
        outOfStockThreshold: 0,
        emailAlerts: {
            enabled: true,
            lowStock: true,
            criticalStock: true,
            outOfStock: true,
            recipients: ['admin@example.com', 'manager@example.com']
        },
        appAlerts: {
            enabled: true,
            lowStock: true,
            criticalStock: true,
            outOfStock: true
        },
        alertFrequency: 'immediate',
        status: 'active'
    });

    describe('Schema Validation', () => {
        test('should create a valid alert config with all fields', async () => {
            const configData = createValidAlertConfigData();
            const config = new AlertConfig(configData);
            const savedConfig = await config.save();

            expect(savedConfig._id).toBeDefined();
            expect(savedConfig.product.toString()).toBe(testProduct._id.toString());
            expect(savedConfig.lowStockThreshold).toBe(10);
            expect(savedConfig.criticalStockThreshold).toBe(5);
            expect(savedConfig.outOfStockThreshold).toBe(0);
            expect(savedConfig.emailAlerts.enabled).toBe(true);
            expect(savedConfig.emailAlerts.recipients).toHaveLength(2);
            expect(savedConfig.appAlerts.enabled).toBe(true);
            expect(savedConfig.alertFrequency).toBe('immediate');
            expect(savedConfig.status).toBe('active');
            expect(savedConfig.createdAt).toBeDefined();
            expect(savedConfig.updatedAt).toBeDefined();
        });

        test('should create alert config with default values', async () => {
            const config = new AlertConfig({
                product: testProduct._id
            });
            const savedConfig = await config.save();

            expect(savedConfig.lowStockThreshold).toBe(10);
            expect(savedConfig.criticalStockThreshold).toBe(5);
            expect(savedConfig.outOfStockThreshold).toBe(0);
            expect(savedConfig.emailAlerts.enabled).toBe(true);
            expect(savedConfig.appAlerts.enabled).toBe(true);
            expect(savedConfig.webhookAlerts.enabled).toBe(false);
            expect(savedConfig.alertFrequency).toBe('immediate');
            expect(savedConfig.autoRestock.enabled).toBe(false);
            expect(savedConfig.status).toBe('active');
        });

        test('should require product field', async () => {
            const config = new AlertConfig({
                lowStockThreshold: 10
            });

            await expect(config.save()).rejects.toThrow();
        });

        test('should ensure unique product per alert config', async () => {
            const config1 = new AlertConfig(createValidAlertConfigData());
            await config1.save();

            const config2 = new AlertConfig(createValidAlertConfigData());
            await expect(config2.save()).rejects.toThrow();
        });

        test('should validate threshold minimum values', async () => {
            const config = new AlertConfig({
                product: testProduct._id,
                lowStockThreshold: -1
            });

            await expect(config.save()).rejects.toThrow();
        });

        test('should validate email recipients format', async () => {
            const config = new AlertConfig({
                product: testProduct._id,
                emailAlerts: {
                    enabled: true,
                    recipients: ['invalid-email', 'admin@example.com']
                }
            });

            await expect(config.save()).rejects.toThrow();
        });

        test('should validate webhook URL format', async () => {
            const config = new AlertConfig({
                product: testProduct._id,
                webhookAlerts: {
                    enabled: true,
                    url: 'invalid-url'
                }
            });

            await expect(config.save()).rejects.toThrow();
        });

        test('should accept valid webhook URL', async () => {
            const config = new AlertConfig({
                product: testProduct._id,
                webhookAlerts: {
                    enabled: true,
                    url: 'https://api.example.com/webhook'
                }
            });

            const savedConfig = await config.save();
            expect(savedConfig.webhookAlerts.url).toBe('https://api.example.com/webhook');
        });

        test('should validate alert frequency enum', async () => {
            const config = new AlertConfig({
                product: testProduct._id,
                alertFrequency: 'invalid_frequency'
            });

            await expect(config.save()).rejects.toThrow();
        });

        test('should validate status enum', async () => {
            const config = new AlertConfig({
                product: testProduct._id,
                status: 'invalid_status'
            });

            await expect(config.save()).rejects.toThrow();
        });

        test('should validate webhook events enum', async () => {
            const config = new AlertConfig({
                product: testProduct._id,
                webhookAlerts: {
                    enabled: true,
                    url: 'https://api.example.com/webhook',
                    events: ['invalid_event']
                }
            });

            await expect(config.save()).rejects.toThrow();
        });

        test('should validate notes length', async () => {
            const config = new AlertConfig({
                product: testProduct._id,
                notes: 'A'.repeat(501) // Exceeds max length
            });

            await expect(config.save()).rejects.toThrow();
        });

        test('should validate supplier name length', async () => {
            const config = new AlertConfig({
                product: testProduct._id,
                autoRestock: {
                    enabled: true,
                    supplier: 'A'.repeat(101) // Exceeds max length
                }
            });

            await expect(config.save()).rejects.toThrow();
        });
    });

    describe('Virtual Properties', () => {
        let config;

        beforeEach(async () => {
            const configData = createValidAlertConfigData();
            config = new AlertConfig(configData);
            await config.save();
        });

        test('should determine if alerts are active', () => {
            expect(config.hasActiveAlerts).toBe(true);

            config.emailAlerts.enabled = false;
            config.appAlerts.enabled = false;
            config.webhookAlerts.enabled = false;
            expect(config.hasActiveAlerts).toBe(false);

            config.webhookAlerts.enabled = true;
            expect(config.hasActiveAlerts).toBe(true);
        });

        test('should return thresholds object', () => {
            const thresholds = config.thresholds;

            expect(thresholds).toEqual({
                outOfStock: 0,
                critical: 5,
                low: 10
            });
        });
    });

    describe('Alert Methods', () => {
        let config;

        beforeEach(async () => {
            const configData = createValidAlertConfigData();
            config = new AlertConfig(configData);
            await config.save();
        });

        describe('shouldSendAlert method', () => {
            test('should send alert when conditions are met', () => {
                expect(config.shouldSendAlert('low_stock', 8)).toBe(true);
                expect(config.shouldSendAlert('critical_stock', 3)).toBe(true);
                expect(config.shouldSendAlert('out_of_stock', 0)).toBe(true);
            });

            test('should not send alert when disabled', () => {
                config.emailAlerts.lowStock = false;
                config.appAlerts.lowStock = false;

                expect(config.shouldSendAlert('low_stock', 8)).toBe(false);
            });

            test('should not send alert when no alerts are active', () => {
                config.emailAlerts.enabled = false;
                config.appAlerts.enabled = false;
                config.webhookAlerts.enabled = false;

                expect(config.shouldSendAlert('low_stock', 8)).toBe(false);
            });

            test('should respect hourly frequency', () => {
                config.alertFrequency = 'hourly';
                config.lastAlertsSent = {
                    lowStock: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
                };

                expect(config.shouldSendAlert('low_stock', 8)).toBe(false);

                config.lastAlertsSent.lowStock = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2 hours ago
                expect(config.shouldSendAlert('low_stock', 8)).toBe(true);
            });

            test('should respect daily frequency', () => {
                config.alertFrequency = 'daily';
                config.lastAlertsSent = {
                    lowStock: new Date(Date.now() - 12 * 60 * 60 * 1000) // 12 hours ago
                };

                expect(config.shouldSendAlert('low_stock', 8)).toBe(false);

                config.lastAlertsSent.lowStock = new Date(Date.now() - 25 * 60 * 60 * 1000); // 25 hours ago
                expect(config.shouldSendAlert('low_stock', 8)).toBe(true);
            });

            test('should respect weekly frequency', () => {
                config.alertFrequency = 'weekly';
                config.lastAlertsSent = {
                    lowStock: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
                };

                expect(config.shouldSendAlert('low_stock', 8)).toBe(false);

                config.lastAlertsSent.lowStock = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000); // 8 days ago
                expect(config.shouldSendAlert('low_stock', 8)).toBe(true);
            });

            test('should always send for immediate frequency', () => {
                config.alertFrequency = 'immediate';
                config.lastAlertsSent = {
                    lowStock: new Date() // Just now
                };

                expect(config.shouldSendAlert('low_stock', 8)).toBe(true);
            });
        });

        describe('updateLastAlertSent method', () => {
            test('should update last alert sent timestamp', async () => {
                const beforeUpdate = config.lastAlertsSent;
                await config.updateLastAlertSent('low_stock');

                expect(config.lastAlertsSent.lowStock).toBeDefined();
                expect(config.lastAlertsSent.lowStock).not.toEqual(beforeUpdate?.lowStock);
            });

            test('should handle different alert types', async () => {
                await config.updateLastAlertSent('critical_stock');
                await config.updateLastAlertSent('out_of_stock');

                expect(config.lastAlertsSent.criticalStock).toBeDefined();
                expect(config.lastAlertsSent.outOfStock).toBeDefined();
            });
        });
    });

    describe('Static Methods', () => {
        beforeEach(async () => {
            // Create multiple alert configs for testing
            const products = [];
            for (let i = 0; i < 3; i++) {
                const product = new Product({
                    name: `Product ${i}`,
                    price: 29.99 + i * 10,
                    stock: 100
                });
                products.push(await product.save());
            }

            const configs = [
                { product: products[0]._id, status: 'active', lowStockThreshold: 10 },
                { product: products[1]._id, status: 'inactive', lowStockThreshold: 5 },
                { product: products[2]._id, status: 'active', lowStockThreshold: 15 }
            ];

            for (const configData of configs) {
                const config = new AlertConfig(configData);
                await config.save();
            }
        });

        describe('getActiveConfigs method', () => {
            test('should return only active configurations', async () => {
                const activeConfigs = await AlertConfig.getActiveConfigs();

                expect(activeConfigs.length).toBeGreaterThan(0);
                activeConfigs.forEach(config => {
                    expect(config.status).toBe('active');
                    expect(config.product).toBeDefined();
                });
            });
        });

        describe('getProductsNeedingAlerts method', () => {
            test('should return products that need alerts based on current stock', async () => {
                const productsNeedingAlerts = await AlertConfig.getProductsNeedingAlerts(8);

                expect(productsNeedingAlerts.length).toBeGreaterThan(0);
                productsNeedingAlerts.forEach(config => {
                    expect(config.status).toBe('active');
                    expect(
                        config.lowStockThreshold >= 8 ||
                        config.criticalStockThreshold >= 8 ||
                        config.outOfStockThreshold >= 8
                    ).toBe(true);
                    expect(config.product).toBeDefined();
                });
            });

            test('should return empty array when no products need alerts', async () => {
                const productsNeedingAlerts = await AlertConfig.getProductsNeedingAlerts(100);

                expect(productsNeedingAlerts.length).toBe(0);
            });
        });
    });

    describe('Integration Tests', () => {
        test('should populate product reference', async () => {
            const config = new AlertConfig(createValidAlertConfigData());
            await config.save();

            const populatedConfig = await AlertConfig.findById(config._id).populate('product');
            expect(populatedConfig.product.name).toBe(testProduct.name);
            expect(populatedConfig.product.price).toBe(testProduct.price);
        });

        test('should maintain alert state through operations', async () => {
            const config = new AlertConfig(createValidAlertConfigData());
            await config.save();

            // Send alert
            const shouldSend = config.shouldSendAlert('low_stock', 8);
            expect(shouldSend).toBe(true);

            // Update last sent
            await config.updateLastAlertSent('low_stock');

            // Should not send again immediately for non-immediate frequency
            config.alertFrequency = 'hourly';
            const shouldSendAgain = config.shouldSendAlert('low_stock', 8);
            expect(shouldSendAgain).toBe(false);
        });
    });

    describe('Edge Cases', () => {
        test('should handle zero thresholds', async () => {
            const config = new AlertConfig({
                product: testProduct._id,
                lowStockThreshold: 0,
                criticalStockThreshold: 0,
                outOfStockThreshold: 0
            });

            const savedConfig = await config.save();
            expect(savedConfig.thresholds).toEqual({
                outOfStock: 0,
                critical: 0,
                low: 0
            });
        });

        test('should handle empty email recipients', async () => {
            const config = new AlertConfig({
                product: testProduct._id,
                emailAlerts: {
                    enabled: true,
                    recipients: []
                }
            });

            const savedConfig = await config.save();
            expect(savedConfig.emailAlerts.recipients).toEqual([]);
        });

        test('should handle very high thresholds', async () => {
            const config = new AlertConfig({
                product: testProduct._id,
                lowStockThreshold: 1000,
                criticalStockThreshold: 500,
                outOfStockThreshold: 100
            });

            const savedConfig = await config.save();
            expect(savedConfig.lowStockThreshold).toBe(1000);
            expect(savedConfig.criticalStockThreshold).toBe(500);
            expect(savedConfig.outOfStockThreshold).toBe(100);
        });

        test('should handle disabled auto-restock', async () => {
            const config = new AlertConfig({
                product: testProduct._id,
                autoRestock: {
                    enabled: false,
                    quantity: 0
                }
            });

            const savedConfig = await config.save();
            expect(savedConfig.autoRestock.enabled).toBe(false);
            expect(savedConfig.autoRestock.quantity).toBe(0);
        });

        test('should handle suspended status', async () => {
            const config = new AlertConfig({
                product: testProduct._id,
                status: 'suspended'
            });

            const savedConfig = await config.save();
            expect(savedConfig.status).toBe('suspended');
        });
    });
});
