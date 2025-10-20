/**
 * Pruebas unitarias para customerSyncService.js
 * Enfoque en sincronización de datos CRM y métricas de clientes
 */

import {
    syncCustomerAfterOrder,
    createCustomerFromUser,
    updateCustomerMetrics,
    calculateCustomerSegment
} from '../../src/services/customerSyncService.js';

import Customer from '../../src/models/Customer.js';
import User from '../../src/models/User.js';
import Order from '../../src/models/Order.js';

// Mock de modelos
jest.mock('../../src/models/Customer.js');
jest.mock('../../src/models/User.js');
jest.mock('../../src/models/Order.js');

describe('Customer Sync Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('syncCustomerAfterOrder', () => {
        it('debería sincronizar customer existente después de una orden', async () => {
            // Arrange
            const userId = 'user123';
            const mockOrder = {
                _id: 'order123',
                orderNumber: 'ORD-001',
                total: 150000,
                items: [
                    { product: 'product1', quantity: 2 },
                    { product: 'product2', quantity: 1 }
                ],
                paymentStatus: 'paid',
                status: 'completed'
            };

            const mockCustomer = {
                _id: 'customer123',
                user: userId,
                lifetimeValue: 300000,
                updateMetricsFromOrders: jest.fn().mockResolvedValue(),
                addInteraction: jest.fn(),
                earnLoyaltyPoints: jest.fn().mockResolvedValue({ success: true })
            };

            Customer.findOne.mockResolvedValue(mockCustomer);

            // Act
            const result = await syncCustomerAfterOrder(userId, mockOrder);

            // Assert
            expect(Customer.findOne).toHaveBeenCalledWith({ user: userId });
            expect(mockCustomer.updateMetricsFromOrders).toHaveBeenCalled();
            expect(mockCustomer.addInteraction).toHaveBeenCalledWith(
                'Compra',
                'Orden ORD-001 - $150.00 USD',
                expect.objectContaining({
                    orderId: 'order123',
                    orderNumber: 'ORD-001',
                    total: 150000,
                    items: 3
                })
            );
            expect(mockCustomer.earnLoyaltyPoints).toHaveBeenCalledWith(150000, 'order123');
            expect(result).toEqual({ success: true });
        });

        it('debería crear nuevo customer si no existe', async () => {
            // Arrange
            const userId = 'newUser456';
            const mockOrder = {
                _id: 'order456',
                orderNumber: 'ORD-002',
                total: 75000,
                paymentStatus: 'paid',
                status: 'completed',
                items: []
            };

            const mockNewCustomer = {
                _id: 'newCustomer456',
                user: userId,
                lifetimeValue: 0,
                updateMetricsFromOrders: jest.fn().mockResolvedValue(),
                addInteraction: jest.fn(),
                earnLoyaltyPoints: jest.fn().mockResolvedValue({ success: true })
            };

            Customer.findOne.mockResolvedValue(null); // No existe customer
            Customer.create = jest.fn().mockResolvedValue(mockNewCustomer);
            User.findById.mockResolvedValue({
                _id: userId,
                nombre: 'Usuario Nuevo',
                email: 'nuevo@test.com'
            });

            // Act
            const result = await syncCustomerAfterOrder(userId, mockOrder);

            // Assert
            expect(Customer.findOne).toHaveBeenCalledWith({ user: userId });
            expect(User.findById).toHaveBeenCalledWith(userId);
            expect(Customer.create).toHaveBeenCalled();
            expect(result).toEqual({ success: true });
        });

        it('debería manejar órdenes no pagadas sin acumular puntos', async () => {
            // Arrange
            const userId = 'user123';
            const mockOrder = {
                _id: 'order789',
                orderNumber: 'ORD-003',
                total: 50000,
                paymentStatus: 'pending', // No pagada
                status: 'pending',
                items: []
            };

            const mockCustomer = {
                _id: 'customer123',
                user: userId,
                updateMetricsFromOrders: jest.fn().mockResolvedValue(),
                addInteraction: jest.fn(),
                earnLoyaltyPoints: jest.fn()
            };

            Customer.findOne.mockResolvedValue(mockCustomer);

            // Act
            await syncCustomerAfterOrder(userId, mockOrder);

            // Assert
            expect(mockCustomer.addInteraction).toHaveBeenCalled();
            expect(mockCustomer.earnLoyaltyPoints).not.toHaveBeenCalled();
        });

        it('debería manejar órdenes canceladas sin acumular puntos', async () => {
            // Arrange
            const userId = 'user123';
            const mockOrder = {
                _id: 'order999',
                orderNumber: 'ORD-004',
                total: 30000,
                paymentStatus: 'paid',
                status: 'cancelled', // Cancelada
                items: []
            };

            const mockCustomer = {
                _id: 'customer123',
                user: userId,
                updateMetricsFromOrders: jest.fn().mockResolvedValue(),
                addInteraction: jest.fn(),
                earnLoyaltyPoints: jest.fn()
            };

            Customer.findOne.mockResolvedValue(mockCustomer);

            // Act
            await syncCustomerAfterOrder(userId, mockOrder);

            // Assert
            expect(mockCustomer.addInteraction).toHaveBeenCalled();
            expect(mockCustomer.earnLoyaltyPoints).not.toHaveBeenCalled();
        });
    });

    describe('createCustomerFromUser', () => {
        it('debería crear customer desde datos de usuario', async () => {
            // Arrange
            const userId = 'user123';
            const mockUser = {
                _id: userId,
                nombre: 'Cliente Test',
                email: 'cliente@test.com',
                fechaCreacion: new Date()
            };

            const mockNewCustomer = {
                _id: 'customer123',
                user: userId,
                customerCode: 'CUST-001',
                lifetimeValue: 0,
                source: 'automatic'
            };

            User.findById.mockResolvedValue(mockUser);
            Customer.create.mockResolvedValue(mockNewCustomer);

            // Act
            const result = await createCustomerFromUser(userId);

            // Assert
            expect(User.findById).toHaveBeenCalledWith(userId);
            expect(Customer.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    user: userId,
                    contactInfo: expect.any(Object),
                    source: 'automatic'
                })
            );
            expect(result).toEqual(mockNewCustomer);
        });

        it('debería manejar usuario no encontrado', async () => {
            // Arrange
            const userId = 'nonexistent';
            User.findById.mockResolvedValue(null);

            // Act & Assert
            await expect(createCustomerFromUser(userId)).rejects.toThrow('Usuario no encontrado');
        });
    });

    describe('updateCustomerMetrics', () => {
        it('debería actualizar métricas de customer correctamente', async () => {
            // Arrange
            const customerId = 'customer123';
            const mockCustomer = {
                _id: customerId,
                updateMetricsFromOrders: jest.fn().mockResolvedValue(),
                save: jest.fn().mockResolvedValue()
            };

            Customer.findById.mockResolvedValue(mockCustomer);

            // Act
            await updateCustomerMetrics(customerId);

            // Assert
            expect(Customer.findById).toHaveBeenCalledWith(customerId);
            expect(mockCustomer.updateMetricsFromOrders).toHaveBeenCalled();
            expect(mockCustomer.save).toHaveBeenCalled();
        });

        it('debería manejar customer no encontrado', async () => {
            // Arrange
            const customerId = 'nonexistent';
            Customer.findById.mockResolvedValue(null);

            // Act & Assert
            await expect(updateCustomerMetrics(customerId)).rejects.toThrow('Customer no encontrado');
        });
    });

    describe('calculateCustomerSegment', () => {
        it('debería calcular segmento high_value para clientes de alto valor', async () => {
            // Arrange
            const customerData = {
                lifetimeValue: 500000,
                orderCount: 8,
                averageOrderValue: 62500
            };

            // Act
            const segment = calculateCustomerSegment(customerData);

            // Assert
            expect(segment).toBe('high_value');
        });

        it('debería calcular segmento regular para clientes promedio', async () => {
            // Arrange
            const customerData = {
                lifetimeValue: 150000,
                orderCount: 3,
                averageOrderValue: 50000
            };

            // Act
            const segment = calculateCustomerSegment(customerData);

            // Assert
            expect(segment).toBe('regular');
        });

        it('debería calcular segmento new para clientes nuevos', async () => {
            // Arrange
            const customerData = {
                lifetimeValue: 50000,
                orderCount: 1,
                averageOrderValue: 50000
            };

            // Act
            const segment = calculateCustomerSegment(customerData);

            // Assert
            expect(segment).toBe('new');
        });

        it('debería calcular segmento at_risk para clientes inactivos', async () => {
            // Arrange
            const customerData = {
                lifetimeValue: 200000,
                orderCount: 5,
                averageOrderValue: 40000,
                daysSinceLastOrder: 120 // Más de 90 días
            };

            // Act
            const segment = calculateCustomerSegment(customerData);

            // Assert
            expect(segment).toBe('at_risk');
        });
    });

    describe('Manejo de errores', () => {
        it('debería manejar errores en sincronización', async () => {
            // Arrange
            const userId = 'user123';
            const mockOrder = { _id: 'order123' };
            const error = new Error('Database error');

            Customer.findOne.mockRejectedValue(error);

            // Act & Assert
            await expect(syncCustomerAfterOrder(userId, mockOrder)).rejects.toThrow('Database error');
        });

        it('debería continuar si hay errores en puntos de lealtad', async () => {
            // Arrange
            const userId = 'user123';
            const mockOrder = {
                _id: 'order123',
                orderNumber: 'ORD-001',
                total: 100000,
                paymentStatus: 'paid',
                status: 'completed',
                items: []
            };

            const mockCustomer = {
                _id: 'customer123',
                updateMetricsFromOrders: jest.fn().mockResolvedValue(),
                addInteraction: jest.fn(),
                earnLoyaltyPoints: jest.fn().mockRejectedValue(new Error('Loyalty error'))
            };

            Customer.findOne.mockResolvedValue(mockCustomer);

            // Act
            const result = await syncCustomerAfterOrder(userId, mockOrder);

            // Assert
            expect(result).toEqual({ success: true }); // Debería continuar a pesar del error
        });
    });

    describe('Casos edge', () => {
        it('debería manejar orden null o undefined', async () => {
            // Arrange
            const userId = 'user123';
            const mockCustomer = {
                _id: 'customer123',
                updateMetricsFromOrders: jest.fn().mockResolvedValue(),
                addInteraction: jest.fn(),
                earnLoyaltyPoints: jest.fn()
            };

            Customer.findOne.mockResolvedValue(mockCustomer);

            // Act
            const result = await syncCustomerAfterOrder(userId, null);

            // Assert
            expect(mockCustomer.updateMetricsFromOrders).toHaveBeenCalled();
            expect(mockCustomer.addInteraction).not.toHaveBeenCalled();
            expect(result).toEqual({ success: true });
        });

        it('debería validar datos requeridos en creación de customer', async () => {
            // Arrange
            const userId = null; // ID inválido

            // Act & Assert
            await expect(createCustomerFromUser(userId)).rejects.toThrow();
        });
    });
});
