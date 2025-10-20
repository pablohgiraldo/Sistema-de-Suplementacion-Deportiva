/**
 * Pruebas unitarias para orderController.js
 * Enfoque en funcionalidades de checkout: creación, validación, procesamiento de órdenes
 */

import {
    createOrder,
    getOrders,
    getOrderById,
    updateOrderStatus,
    cancelOrder,
    getOrderStatus
} from '../../src/controllers/orderController.js';

import Order from '../../src/models/Order.js';
import Cart from '../../src/models/Cart.js';
import Inventory from '../../src/models/Inventory.js';
import Product from '../../src/models/Product.js';
import User from '../../src/models/User.js';
import { syncCustomerAfterOrder } from '../../src/services/customerSyncService.js';
import webhookService from '../../src/services/webhookService.js';
import notificationService from '../../src/services/notificationService.js';

// Mock de modelos y servicios
jest.mock('../../src/models/Order.js');
jest.mock('../../src/models/Cart.js');
jest.mock('../../src/models/Inventory.js');
jest.mock('../../src/models/Product.js');
jest.mock('../../src/models/User.js');
jest.mock('../../src/services/customerSyncService.js');
jest.mock('../../src/services/webhookService.js');
jest.mock('../../src/services/notificationService.js');

describe('Order Controller', () => {
    let mockReq, mockRes;

    beforeEach(() => {
        mockReq = {
            user: { id: 'user123' },
            body: {},
            params: {},
            query: {}
        };

        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };

        // Configurar mocks básicos para Order
        Order.find = jest.fn();
        Order.findOne = jest.fn();
        Order.findById = jest.fn();
        Order.findByIdAndUpdate = jest.fn();
        Order.countDocuments = jest.fn();
        Order.mockImplementation = jest.fn();

        // Configurar mocks básicos para Cart
        Cart.findOne = jest.fn();
        
        // Configurar mocks básicos para Inventory
        Inventory.findOne = jest.fn();
        Inventory.findOneAndUpdate = jest.fn();

        // Configurar mocks básicos para User
        User.findById = jest.fn();

        // Limpiar mocks
        jest.clearAllMocks();
    });

    describe('createOrder', () => {
        beforeEach(() => {
            // Mock básico para Cart.findOne
            Cart.findOne = jest.fn();
            Inventory.findOne = jest.fn();
        });

        it('debería crear una orden exitosamente con carrito válido', async () => {
            // Arrange
            const mockCart = {
                items: [
                    {
                        product: { _id: 'product1', name: 'Producto 1' },
                        quantity: 2,
                        price: 50000
                    },
                    {
                        product: { _id: 'product2', name: 'Producto 2' },
                        quantity: 1,
                        price: 75000
                    }
                ]
            };

            const mockInventory1 = { availableStock: 10 };
            const mockInventory2 = { availableStock: 5 };

            mockReq.body = {
                paymentMethod: 'credit_card',
                shippingAddress: {
                    street: 'Calle 123 #45-67',
                    city: 'Bogotá',
                    zipCode: '110111'
                },
                cardNumber: '4111 1111 1111 1111'
            };

            Inventory.findOne
                .mockResolvedValueOnce(mockInventory1)
                .mockResolvedValueOnce(mockInventory2);
                
            Inventory.findOneAndUpdate.mockResolvedValue({ success: true });

            const mockOrder = {
                _id: 'order123',
                user: 'user123',
                total: 178750,
                status: 'pending',
                orderNumber: 'ORD-123',
                items: mockCart.items,
                itemCount: 3,
                paymentStatus: 'pending',
                createdAt: new Date(),
                validateOrderData: jest.fn().mockReturnValue([]),
                save: jest.fn().mockResolvedValue(),
                populate: jest.fn().mockResolvedValue(),
                toObject: jest.fn().mockReturnValue({}),
                getOrderSummary: jest.fn().mockReturnValue({})
            };

            Order.mockImplementation(() => mockOrder);
            
            // Mock cart.clearCart()
            const mockCartWithClear = {
                ...mockCart,
                clearCart: jest.fn().mockResolvedValue()
            };
            
            Cart.findOne.mockReturnValue({
                populate: jest.fn().mockResolvedValue(mockCartWithClear)
            });

            syncCustomerAfterOrder.mockResolvedValue({ success: true });
            webhookService.triggerEvent.mockResolvedValue({ success: true });
            notificationService.sendOrderConfirmation.mockResolvedValue({ success: true });

            // Act
            await createOrder(mockReq, mockRes);

            // Assert
            expect(Cart.findOne).toHaveBeenCalledWith({ user: 'user123' });
            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    message: 'Orden creada exitosamente'
                })
            );
        });

        it('debería retornar error si faltan datos requeridos', async () => {
            // Arrange
            mockReq.body = {
                // paymentMethod faltante
                shippingAddress: {
                    street: 'Calle 123',
                    city: 'Bogotá'
                }
            };

            // Act
            await createOrder(mockReq, mockRes);

            // Assert
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: 'Método de pago y dirección de envío son requeridos'
            });
        });

        it('debería retornar error si el carrito está vacío', async () => {
            // Arrange
            mockReq.body = {
                paymentMethod: 'credit_card',
                shippingAddress: {
                    street: 'Calle 123',
                    city: 'Bogotá'
                }
            };

            Cart.findOne.mockReturnValue({
                populate: jest.fn().mockResolvedValue({ items: [] })
            });

            // Act
            await createOrder(mockReq, mockRes);

            // Assert
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: 'El carrito está vacío. Agrega productos al carrito antes de crear una orden.'
            });
        });

        it('debería validar stock disponible antes de crear la orden', async () => {
            // Arrange
            const mockCart = {
                items: [
                    {
                        product: { _id: 'product1', name: 'Producto 1' },
                        quantity: 10,
                        price: 50000
                    }
                ]
            };

            mockReq.body = {
                paymentMethod: 'credit_card',
                shippingAddress: {
                    street: 'Calle 123',
                    city: 'Bogotá'
                }
            };

            Cart.findOne.mockReturnValue({
                populate: jest.fn().mockResolvedValue(mockCart)
            });

            // Stock insuficiente
            Inventory.findOne.mockResolvedValue({ availableStock: 5 });

            // Act
            await createOrder(mockReq, mockRes);

            // Assert
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: 'Stock insuficiente para algunos productos',
                details: expect.arrayContaining([
                    expect.objectContaining({
                        product: 'Producto 1',
                        requested: 10,
                        available: 5
                    })
                ])
            });
        });

        it('debería calcular correctamente totales, impuestos y envío', async () => {
            // Arrange
            const mockCart = {
                items: [
                    {
                        product: { _id: 'product1', name: 'Producto 1' },
                        quantity: 2,
                        price: 100000 // $100 USD
                    }
                ]
            };

            mockReq.body = {
                paymentMethod: 'credit_card',
                shippingAddress: {
                    street: 'Calle 123',
                    city: 'Bogotá'
                }
            };

            Cart.findOne.mockReturnValue({
                populate: jest.fn().mockResolvedValue(mockCart)
            });

            Inventory.findOne.mockResolvedValue({ availableStock: 10 });

            const mockOrder = {
                _id: 'order123',
                user: 'user123',
                total: 0,
                save: jest.fn().mockResolvedValue({})
            };

            Order.mockImplementation((orderData) => {
                mockOrder.total = orderData.total;
                return {
                    ...mockOrder,
                    validateOrderData: () => [],
                    save: jest.fn().mockResolvedValue(mockOrder)
                };
            });

            syncCustomerAfterOrder.mockResolvedValue({ success: true });
            webhookService.triggerEvent.mockResolvedValue({ success: true });
            notificationService.sendOrderConfirmation.mockResolvedValue({ success: true });

            // Act
            await createOrder(mockReq, mockRes);

            // Assert
            // Subtotal: 200000, Tax: 38000 (19%), Shipping: 2500, Total: 240500
            expect(mockOrder.total).toBeCloseTo(240500, 0);
        });

        it('debería detectar marca de tarjeta correctamente', async () => {
            // Arrange
            const mockCart = {
                items: [
                    {
                        product: { _id: 'product1', name: 'Producto 1' },
                        quantity: 1,
                        price: 50000
                    }
                ]
            };

            mockReq.body = {
                paymentMethod: 'credit_card',
                shippingAddress: {
                    street: 'Calle 123',
                    city: 'Bogotá'
                },
                cardNumber: '4111 1111 1111 1111' // Visa
            };

            Cart.findOne.mockReturnValue({
                populate: jest.fn().mockResolvedValue(mockCart)
            });

            Inventory.findOne.mockResolvedValue({ availableStock: 10 });

            const mockOrder = {
                _id: 'order123',
                user: 'user123',
                paymentDetails: {},
                save: jest.fn().mockResolvedValue({})
            };

            Order.mockImplementation((orderData) => {
                mockOrder.paymentDetails = orderData.paymentDetails;
                return {
                    ...mockOrder,
                    validateOrderData: () => [],
                    save: jest.fn().mockResolvedValue(mockOrder)
                };
            });

            syncCustomerAfterOrder.mockResolvedValue({ success: true });
            webhookService.triggerEvent.mockResolvedValue({ success: true });
            notificationService.sendOrderConfirmation.mockResolvedValue({ success: true });

            // Act
            await createOrder(mockReq, mockRes);

            // Assert
            expect(mockOrder.paymentDetails.cardBrand).toBe('visa');
            expect(mockOrder.paymentDetails.cardLastFour).toBe('1111');
        });
    });

    describe('getOrders', () => {
        it('debería obtener órdenes del usuario autenticado', async () => {
            // Arrange
            const mockOrders = [
                {
                    _id: 'order1',
                    orderNumber: 'ORD-001',
                    total: 150000,
                    status: 'completed',
                    createdAt: new Date()
                },
                {
                    _id: 'order2',
                    orderNumber: 'ORD-002',
                    total: 200000,
                    status: 'pending',
                    createdAt: new Date()
                }
            ];

            // Mock para la cadena completa de métodos de getOrders (Order.find().populate().populate().sort().skip().limit())
            const mockPopulate1 = jest.fn().mockReturnThis();
            const mockPopulate2 = jest.fn().mockReturnThis();
            const mockSort = jest.fn().mockReturnThis();
            const mockSkip = jest.fn().mockReturnThis();
            const mockLimit = jest.fn().mockResolvedValue(mockOrders);

            const mockQuery = {
                populate: jest.fn()
                    .mockReturnValueOnce({ populate: mockPopulate2 })
                    .mockReturnValue({ sort: mockSort })
            };
            
            Order.find.mockReturnValue(mockQuery);
            mockPopulate2.mockReturnValue({ sort: mockSort });
            mockSort.mockReturnValue({ skip: mockSkip });
            mockSkip.mockReturnValue({ limit: mockLimit });

            Order.countDocuments.mockResolvedValue(2);

            mockReq.query = { page: 1, limit: 10 };

            // Act
            await getOrders(mockReq, mockRes);

            // Assert
            expect(Order.find).toHaveBeenCalledWith({ user: 'user123' });
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: mockOrders,
                    pagination: expect.any(Object)
                })
            );
        });

        it('debería filtrar órdenes por estado', async () => {
            // Arrange
            mockReq.query = { status: 'completed', page: 1, limit: 10 };

            const mockOrders = [{
                _id: 'order1',
                orderNumber: 'ORD-001',
                status: 'completed'
            }];

            // Mock para la cadena completa de métodos de getOrders (similar al test anterior)
            const mockPopulate1 = jest.fn().mockReturnThis();
            const mockPopulate2 = jest.fn().mockReturnThis();
            const mockSort = jest.fn().mockReturnThis();
            const mockSkip = jest.fn().mockReturnThis();
            const mockLimit = jest.fn().mockResolvedValue(mockOrders);

            const mockQuery = {
                populate: jest.fn()
                    .mockReturnValueOnce({ populate: mockPopulate2 })
                    .mockReturnValue({ sort: mockSort })
            };
            
            Order.find.mockReturnValue(mockQuery);
            mockPopulate2.mockReturnValue({ sort: mockSort });
            mockSort.mockReturnValue({ skip: mockSkip });
            mockSkip.mockReturnValue({ limit: mockLimit });

            Order.countDocuments.mockResolvedValue(1);

            // Act
            await getOrders(mockReq, mockRes);

            // Assert
            expect(Order.find).toHaveBeenCalledWith({
                user: 'user123',
                status: 'completed'
            });
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: mockOrders,
                    pagination: expect.any(Object)
                })
            );
        });
    });

    describe('getOrderById', () => {
        it('debería obtener una orden específica por ID', async () => {
            // Arrange
            mockReq.params.id = 'order123';

            const mockOrder = {
                _id: 'order123',
                orderNumber: 'ORD-001',
                user: { _id: 'user123', toString: () => 'user123' },
                total: 150000,
                status: 'completed',
                items: []
            };

            // Mock para Order.findById con cadena de métodos
            const mockPopulate1 = jest.fn().mockReturnThis();
            const mockPopulate2 = jest.fn().mockReturnThis();
            const mockPopulate3 = jest.fn().mockResolvedValue(mockOrder);

            Order.findById.mockReturnValue({
                populate: mockPopulate1
            });
            mockPopulate1.mockReturnValue({
                populate: mockPopulate2
            });
            mockPopulate2.mockReturnValue({
                populate: mockPopulate3
            });

            // Act
            await getOrderById(mockReq, mockRes);

            // Assert
            expect(Order.findById).toHaveBeenCalledWith('order123');
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                data: mockOrder
            });
        });

        it('debería retornar 404 si la orden no existe', async () => {
            // Arrange
            mockReq.params.id = 'nonexistent';

            // Mock para Order.findById retornando null
            const mockPopulate1 = jest.fn().mockReturnThis();
            const mockPopulate2 = jest.fn().mockReturnThis();
            const mockPopulate3 = jest.fn().mockResolvedValue(null);

            Order.findById.mockReturnValue({
                populate: mockPopulate1
            });
            mockPopulate1.mockReturnValue({
                populate: mockPopulate2
            });
            mockPopulate2.mockReturnValue({
                populate: mockPopulate3
            });

            // Act
            await getOrderById(mockReq, mockRes);

            // Assert
            expect(Order.findById).toHaveBeenCalledWith('nonexistent');
            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: 'Orden no encontrada'
            });
        });
    });

    describe('updateOrderStatus', () => {
        it('debería actualizar el estado de una orden', async () => {
            // Arrange
            mockReq.params.id = 'order123';
            mockReq.body = { status: 'shipped' };
            mockReq.user = { id: 'user123', rol: 'admin' }; // Admin puede actualizar

            const mockOrder = {
                _id: 'order123',
                status: 'pending',
                user: 'user123',
                items: [],
                orderNumber: 'ORD-001',
                total: 150000,
                trackingNumber: null,
                carrier: null,
                trackingUrl: null,
                shippingAddress: {},
                updateStatus: jest.fn().mockResolvedValue(),
                populate: jest.fn().mockResolvedValue(),
                save: jest.fn().mockResolvedValue()
            };

            Order.findById.mockResolvedValue(mockOrder);
            
            // Mock servicios
            syncCustomerAfterOrder.mockResolvedValue({ success: true });
            webhookService.triggerEvent.mockResolvedValue({ success: true });
            notificationService.addToQueue.mockResolvedValue({ success: true });

            // Mock User.findById para el email
            User.findById.mockResolvedValue({
                email: 'test@example.com',
                nombre: 'Test User'
            });

            // Act
            await updateOrderStatus(mockReq, mockRes);

            // Assert
            expect(Order.findById).toHaveBeenCalledWith('order123');
            expect(mockOrder.updateStatus).toHaveBeenCalledWith('shipped', 'user123');
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                message: 'Estado de orden actualizado exitosamente',
                data: mockOrder
            });
        });

        it('debería retornar 404 si la orden no existe', async () => {
            // Arrange
            mockReq.params.id = 'nonexistent';
            mockReq.body = { status: 'shipped' };
            mockReq.user = { id: 'user123', rol: 'admin' };

            Order.findById.mockResolvedValue(null);

            // Act
            await updateOrderStatus(mockReq, mockRes);

            // Assert
            expect(Order.findById).toHaveBeenCalledWith('nonexistent');
            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: 'Orden no encontrada'
            });
        });
    });

    describe('cancelOrder', () => {
        it('debería cancelar una orden pendiente', async () => {
            // Arrange
            mockReq.params.id = 'order123';
            mockReq.body = { reason: 'Customer requested cancellation' };
            mockReq.user = { id: 'user123', rol: 'usuario' };

            const mockOrder = {
                _id: 'order123',
                status: 'pending',
                user: 'user123',
                items: [],
                orderNumber: 'ORD-001',
                updateStatus: jest.fn().mockResolvedValue(),
                populate: jest.fn().mockResolvedValue()
            };

            Order.findById.mockResolvedValue(mockOrder);
            syncCustomerAfterOrder.mockResolvedValue({ success: true });
            Inventory.findOneAndUpdate.mockResolvedValue({ success: true });

            // Act
            await cancelOrder(mockReq, mockRes);

            // Assert
            expect(Order.findById).toHaveBeenCalledWith('order123');
            expect(mockOrder.updateStatus).toHaveBeenCalledWith('cancelled', 'user123');
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                message: 'Orden cancelada exitosamente',
                data: mockOrder
            });
        });

        it('debería retornar error si la orden no puede ser cancelada', async () => {
            // Arrange
            mockReq.params.id = 'order123';
            mockReq.body = { reason: 'Test cancellation' };
            mockReq.user = { id: 'user123', rol: 'usuario' };

            const mockOrder = {
                _id: 'order123',
                status: 'shipped', // Ya no está pendiente
                user: 'user123'
            };

            Order.findById.mockResolvedValue(mockOrder);

            // Act
            await cancelOrder(mockReq, mockRes);

            // Assert
            expect(Order.findById).toHaveBeenCalledWith('order123');
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: 'Solo se pueden cancelar órdenes pendientes o en procesamiento'
            });
        });
    });
});
