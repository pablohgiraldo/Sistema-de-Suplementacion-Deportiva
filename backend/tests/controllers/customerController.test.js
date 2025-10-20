/**
 * Pruebas unitarias para customerController.js
 * Enfoque en funcionalidades CRM: segmentación, análisis, gestión de clientes
 */

import {
    getCustomers,
    getCustomerById,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    getCustomerAnalytics,
    segmentCustomers,
    updateCustomerStatus
} from '../../src/controllers/customerController.js';

import Customer from '../../src/models/Customer.js';
import User from '../../src/models/User.js';
import Order from '../../src/models/Order.js';

// Mock de modelos
jest.mock('../../src/models/Customer.js');
jest.mock('../../src/models/User.js');
jest.mock('../../src/models/Order.js');

describe('Customer Controller', () => {
    let mockReq, mockRes;

    beforeEach(() => {
        mockReq = {
            query: {},
            params: {},
            body: {}
        };
        
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };

        // Limpiar mocks
        jest.clearAllMocks();
    });

    describe('getCustomers', () => {
        it('debería obtener todos los clientes con parámetros por defecto', async () => {
            // Arrange
            const mockCustomers = [
                {
                    _id: 'customer1',
                    user: { _id: 'user1', nombre: 'Cliente 1', email: 'cliente1@test.com' },
                    lifetimeValue: 500000,
                    segment: 'high_value'
                },
                {
                    _id: 'customer2',
                    user: { _id: 'user2', nombre: 'Cliente 2', email: 'cliente2@test.com' },
                    lifetimeValue: 200000,
                    segment: 'regular'
                }
            ];

            Customer.find.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    sort: jest.fn().mockReturnValue({
                        skip: jest.fn().mockReturnValue({
                            limit: jest.fn().mockResolvedValue(mockCustomers)
                        })
                    })
                })
            });

            Customer.countDocuments.mockResolvedValue(2);

            // Act
            await getCustomers(mockReq, mockRes);

            // Assert
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                data: mockCustomers,
                pagination: {
                    page: 1,
                    limit: 20,
                    total: 2,
                    pages: 1
                }
            });
        });

        it('debería filtrar clientes por segmento', async () => {
            // Arrange
            mockReq.query = { segment: 'high_value', page: 1, limit: 10 };
            
            const mockFilteredCustomers = [{
                _id: 'customer1',
                user: { _id: 'user1', nombre: 'Cliente VIP', email: 'vip@test.com' },
                lifetimeValue: 1000000,
                segment: 'high_value'
            }];

            Customer.find.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    sort: jest.fn().mockReturnValue({
                        skip: jest.fn().mockReturnValue({
                            limit: jest.fn().mockResolvedValue(mockFilteredCustomers)
                        })
                    })
                })
            });

            Customer.countDocuments.mockResolvedValue(1);

            // Act
            await getCustomers(mockReq, mockRes);

            // Assert
            expect(Customer.find).toHaveBeenCalledWith(
                expect.objectContaining({
                    segment: 'high_value'
                })
            );
            expect(mockRes.status).toHaveBeenCalledWith(200);
        });

        it('debería buscar clientes por término de búsqueda', async () => {
            // Arrange
            mockReq.query = { search: 'test@email.com', page: 1, limit: 10 };
            
            const mockUsers = [{ _id: 'user1' }];
            User.find.mockReturnValue({
                select: jest.fn().mockResolvedValue(mockUsers)
            });

            const mockCustomers = [];
            Customer.find.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    sort: jest.fn().mockReturnValue({
                        skip: jest.fn().mockReturnValue({
                            limit: jest.fn().mockResolvedValue(mockCustomers)
                        })
                    })
                })
            });

            Customer.countDocuments.mockResolvedValue(0);

            // Act
            await getCustomers(mockReq, mockRes);

            // Assert
            expect(User.find).toHaveBeenCalledWith({
                $or: [
                    { nombre: { $regex: 'test@email.com', $options: 'i' } },
                    { email: { $regex: 'test@email.com', $options: 'i' } }
                ]
            });
            expect(Customer.find).toHaveBeenCalledWith(
                expect.objectContaining({
                    $or: expect.any(Array)
                })
            );
        });

        it('debería manejar errores correctamente', async () => {
            // Arrange
            const error = new Error('Database connection error');
            Customer.find.mockImplementation(() => {
                throw error;
            });

            // Act
            await getCustomers(mockReq, mockRes);

            // Assert
            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: 'Error al obtener la lista de clientes'
            });
        });
    });

    describe('getCustomerById', () => {
        it('debería obtener un cliente por ID con datos completos', async () => {
            // Arrange
            mockReq.params.id = 'customer123';
            
            const mockCustomer = {
                _id: 'customer123',
                user: { _id: 'user123', nombre: 'Cliente Test', email: 'test@test.com' },
                lifetimeValue: 300000,
                orders: [],
                wishlistInfo: []
            };

            Customer.findById.mockReturnValue({
                populate: jest.fn()
                    .mockReturnValueOnce({
                        populate: jest.fn()
                            .mockReturnValueOnce({
                                populate: jest.fn().mockResolvedValue(mockCustomer)
                            })
                    })
            });

            // Act
            await getCustomerById(mockReq, mockRes);

            // Assert
            expect(Customer.findById).toHaveBeenCalledWith('customer123');
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                data: mockCustomer
            });
        });

        it('debería retornar 404 si el cliente no existe', async () => {
            // Arrange
            mockReq.params.id = 'nonexistent';
            Customer.findById.mockReturnValue({
                populate: jest.fn()
                    .mockReturnValueOnce({
                        populate: jest.fn()
                            .mockReturnValueOnce({
                                populate: jest.fn().mockResolvedValue(null)
                            })
                    })
            });

            // Act
            await getCustomerById(mockReq, mockRes);

            // Assert
            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: 'Cliente no encontrado'
            });
        });
    });

    describe('createCustomer', () => {
        it('debería crear un nuevo cliente exitosamente', async () => {
            // Arrange
            const customerData = {
                user: 'user123',
                contactInfo: {
                    phone: '3001234567',
                    address: {
                        street: 'Calle 123',
                        city: 'Bogotá'
                    }
                },
                source: 'website'
            };

            mockReq.body = customerData;
            
            const mockNewCustomer = {
                _id: 'newCustomer123',
                ...customerData,
                customerCode: 'CUST-001',
                lifetimeValue: 0
            };

            Customer.mockImplementation(() => mockNewCustomer);
            Customer.prototype.save = jest.fn().mockResolvedValue(mockNewCustomer);

            // Act
            await createCustomer(mockReq, mockRes);

            // Assert
            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                message: 'Cliente creado exitosamente',
                data: mockNewCustomer
            });
        });

        it('debería validar datos requeridos', async () => {
            // Arrange
            mockReq.body = {}; // Datos vacíos

            // Act
            await createCustomer(mockReq, mockRes);

            // Assert
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: 'Usuario y información de contacto son requeridos'
            });
        });
    });

    describe('updateCustomer', () => {
        it('debería actualizar un cliente existente', async () => {
            // Arrange
            mockReq.params.id = 'customer123';
            mockReq.body = {
                contactInfo: {
                    phone: '3007654321',
                    address: {
                        street: 'Nueva Calle 456',
                        city: 'Medellín'
                    }
                }
            };

            const mockUpdatedCustomer = {
                _id: 'customer123',
                contactInfo: mockReq.body.contactInfo
            };

            Customer.findByIdAndUpdate.mockResolvedValue(mockUpdatedCustomer);

            // Act
            await updateCustomer(mockReq, mockRes);

            // Assert
            expect(Customer.findByIdAndUpdate).toHaveBeenCalledWith(
                'customer123',
                mockReq.body,
                { new: true, runValidators: true }
            );
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                message: 'Cliente actualizado exitosamente',
                data: mockUpdatedCustomer
            });
        });

        it('debería retornar 404 si el cliente a actualizar no existe', async () => {
            // Arrange
            mockReq.params.id = 'nonexistent';
            mockReq.body = { contactInfo: { phone: '123' } };
            
            Customer.findByIdAndUpdate.mockResolvedValue(null);

            // Act
            await updateCustomer(mockReq, mockRes);

            // Assert
            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: 'Cliente no encontrado'
            });
        });
    });

    describe('segmentCustomers', () => {
        it('debería segmentar clientes correctamente', async () => {
            // Arrange
            const mockSegmentation = [
                { segment: 'high_value', count: 15, totalValue: 5000000 },
                { segment: 'regular', count: 45, totalValue: 2000000 },
                { segment: 'new', count: 25, totalValue: 500000 }
            ];

            Customer.aggregate.mockResolvedValue(mockSegmentation);

            // Act
            await segmentCustomers(mockReq, mockRes);

            // Assert
            expect(Customer.aggregate).toHaveBeenCalled();
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                data: mockSegmentation
            });
        });
    });

    describe('getCustomerAnalytics', () => {
        it('debería obtener analytics de clientes', async () => {
            // Arrange
            const mockAnalytics = {
                totalCustomers: 100,
                newCustomers: 15,
                highValueCustomers: 20,
                averageLifetimeValue: 250000,
                churnRiskCustomers: 8
            };

            Customer.countDocuments
                .mockResolvedValueOnce(100) // totalCustomers
                .mockResolvedValueOnce(15)  // newCustomers
                .mockResolvedValueOnce(20); // highValueCustomers

            Customer.aggregate.mockResolvedValue([
                { _id: null, avgLifetimeValue: 250000 }
            ]);

            Customer.countDocuments.mockResolvedValue(8); // churnRiskCustomers

            // Act
            await getCustomerAnalytics(mockReq, mockRes);

            // Assert
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                data: expect.objectContaining({
                    totalCustomers: expect.any(Number),
                    newCustomers: expect.any(Number),
                    highValueCustomers: expect.any(Number)
                })
            });
        });
    });
});
