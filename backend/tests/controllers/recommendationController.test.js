/**
 * Pruebas unitarias para recommendationController.js
 * Enfoque en funcionalidades de recomendaciones: personalizadas, similares, populares
 */

import {
    getUserRecommendations,
    getMyRecommendations,
    getSimilarProducts,
    getPopularProducts,
    getTrendingProducts,
    updateRecommendationFeedback
} from '../../src/controllers/recommendationController.js';

import recommendationService from '../../src/services/recommendationService.js';

// Mock del servicio de recomendaciones
jest.mock('../../src/services/recommendationService.js');

describe('Recommendation Controller', () => {
    let mockReq, mockRes;

    beforeEach(() => {
        mockReq = {
            params: {},
            query: {},
            user: {},
            body: {}
        };

        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };

        // Limpiar mocks
        jest.clearAllMocks();
    });

    describe('getUserRecommendations', () => {
        it('debería obtener recomendaciones para un usuario específico', async () => {
            // Arrange
            mockReq.params.userId = 'user123';
            mockReq.query.limit = '8';

            const mockRecommendations = [
                {
                    _id: 'product1',
                    name: 'Proteína Premium',
                    brand: 'SuperGains',
                    price: 150000,
                    categories: ['proteina'],
                    score: 0.95,
                    reason: 'Basado en historial de compras'
                },
                {
                    _id: 'product2',
                    name: 'Creatina Monohidrato',
                    brand: 'SuperGains',
                    price: 89900,
                    categories: ['creatina'],
                    score: 0.88,
                    reason: 'Productos complementarios'
                }
            ];

            recommendationService.getUserBasedRecommendations.mockResolvedValue(mockRecommendations);

            // Act
            await getUserRecommendations(mockReq, mockRes);

            // Assert
            expect(recommendationService.getUserBasedRecommendations).toHaveBeenCalledWith(
                'user123',
                8
            );
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                count: 2,
                data: mockRecommendations
            });
        });

        it('debería usar límite por defecto si no se especifica', async () => {
            // Arrange
            mockReq.params.userId = 'user123';
            mockReq.query = {}; // Sin límite especificado

            const mockRecommendations = [];
            recommendationService.getUserBasedRecommendations.mockResolvedValue(mockRecommendations);

            // Act
            await getUserRecommendations(mockReq, mockRes);

            // Assert
            expect(recommendationService.getUserBasedRecommendations).toHaveBeenCalledWith(
                'user123',
                10 // Límite por defecto
            );
        });

        it('debería manejar errores del servicio correctamente', async () => {
            // Arrange
            mockReq.params.userId = 'user123';

            const error = new Error('Error en servicio de recomendaciones');
            recommendationService.getUserBasedRecommendations.mockRejectedValue(error);

            // Act
            await getUserRecommendations(mockReq, mockRes);

            // Assert
            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                message: 'Error al obtener recomendaciones del usuario',
                error: error.message
            });
        });
    });

    describe('getMyRecommendations', () => {
        it('debería obtener recomendaciones para el usuario autenticado', async () => {
            // Arrange
            mockReq.user = { _id: 'user456' };
            mockReq.query.limit = '5';

            const mockRecommendations = [
                {
                    _id: 'product3',
                    name: 'BCAA Complex',
                    brand: 'SuperGains',
                    price: 120000,
                    categories: ['aminoacidos'],
                    score: 0.92
                }
            ];

            recommendationService.getUserBasedRecommendations.mockResolvedValue(mockRecommendations);

            // Act
            await getMyRecommendations(mockReq, mockRes);

            // Assert
            expect(recommendationService.getUserBasedRecommendations).toHaveBeenCalledWith(
                'user456',
                5
            );
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                count: 1,
                data: mockRecommendations
            });
        });

        it('debería manejar cuando el usuario no está autenticado', async () => {
            // Arrange
            mockReq.user = null;
            mockReq.query = {};

            // Act
            await getMyRecommendations(mockReq, mockRes);

            // Assert
            expect(mockRes.status).toHaveBeenCalledWith(500);
        });
    });

    describe('getSimilarProducts', () => {
        it('debería obtener productos similares a uno dado', async () => {
            // Arrange
            mockReq.params.productId = 'product123';
            mockReq.query.limit = '6';

            const mockSimilarProducts = [
                {
                    _id: 'product4',
                    name: 'Proteína de Caseína',
                    brand: 'SuperGains',
                    price: 160000,
                    categories: ['proteina'],
                    similarityScore: 0.89
                },
                {
                    _id: 'product5',
                    name: 'Proteína de Soja',
                    brand: 'SuperGains',
                    price: 140000,
                    categories: ['proteina'],
                    similarityScore: 0.76
                }
            ];

            recommendationService.getItemBasedRecommendations.mockResolvedValue(mockSimilarProducts);

            // Act
            await getSimilarProducts(mockReq, mockRes);

            // Assert
            expect(recommendationService.getItemBasedRecommendations).toHaveBeenCalledWith(
                'product123',
                6
            );
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                count: 2,
                data: mockSimilarProducts
            });
        });

        it('debería usar límite por defecto para productos similares', async () => {
            // Arrange
            mockReq.params.productId = 'product123';
            mockReq.query = {}; // Sin límite

            recommendationService.getItemBasedRecommendations.mockResolvedValue([]);

            // Act
            await getSimilarProducts(mockReq, mockRes);

            // Assert
            expect(recommendationService.getItemBasedRecommendations).toHaveBeenCalledWith(
                'product123',
                5 // Límite por defecto
            );
        });
    });

    describe('getPopularProducts', () => {
        it('debería obtener productos populares', async () => {
            // Arrange
            mockReq.query = { limit: '12' };

            const mockPopularProducts = [
                {
                    _id: 'product6',
                    name: 'Whey Protein Isolate',
                    brand: 'SuperGains',
                    price: 180000,
                    categories: ['proteina'],
                    popularityScore: 0.98,
                    salesCount: 1250
                },
                {
                    _id: 'product7',
                    name: 'Creatina Monohidrato',
                    brand: 'SuperGains',
                    price: 89900,
                    categories: ['creatina'],
                    popularityScore: 0.95,
                    salesCount: 980
                }
            ];

            recommendationService.getPopularProducts.mockResolvedValue(mockPopularProducts);

            // Act
            await getPopularProducts(mockReq, mockRes);

            // Assert
            expect(recommendationService.getPopularProducts).toHaveBeenCalledWith(12);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                count: 2,
                data: mockPopularProducts
            });
        });

        it('debería manejar parámetros opcionales de popularidad', async () => {
            // Arrange
            mockReq.query = {
                limit: '15',
                category: 'proteina',
                timeRange: '30days'
            };

            recommendationService.getPopularProducts.mockResolvedValue([]);

            // Act
            await getPopularProducts(mockReq, mockRes);

            // Assert
            expect(recommendationService.getPopularProducts).toHaveBeenCalledWith(15);
        });
    });

    describe('getTrendingProducts', () => {
        it('debería obtener productos en tendencia', async () => {
            // Arrange
            mockReq.query = { limit: '8' };

            const mockTrendingProducts = [
                {
                    _id: 'product8',
                    name: 'Pre-Workout Energy',
                    brand: 'SuperGains',
                    price: 95000,
                    categories: ['preworkout'],
                    trendScore: 0.94,
                    weekGrowth: 45
                }
            ];

            recommendationService.getTrendingProducts.mockResolvedValue(mockTrendingProducts);

            // Act
            await getTrendingProducts(mockReq, mockRes);

            // Assert
            expect(recommendationService.getTrendingProducts).toHaveBeenCalledWith(8);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                count: 1,
                data: mockTrendingProducts
            });
        });
    });

    describe('updateRecommendationFeedback', () => {
        it('debería actualizar feedback de recomendación', async () => {
            // Arrange
            mockReq.user = { _id: 'user789' };
            mockReq.body = {
                productId: 'product123',
                rating: 5,
                feedback: 'Excelente producto!',
                recommendationType: 'user_based'
            };

            const mockFeedbackResult = {
                _id: 'feedback123',
                user: 'user789',
                product: 'product123',
                rating: 5,
                createdAt: new Date()
            };

            recommendationService.addFeedback.mockResolvedValue(mockFeedbackResult);

            // Act
            await updateRecommendationFeedback(mockReq, mockRes);

            // Assert
            expect(recommendationService.addFeedback).toHaveBeenCalledWith({
                user: 'user789',
                product: 'product123',
                rating: 5,
                feedback: 'Excelente producto!',
                recommendationType: 'user_based'
            });
            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                message: 'Feedback registrado exitosamente',
                data: mockFeedbackResult
            });
        });

        it('debería validar que el rating esté en rango válido', async () => {
            // Arrange
            mockReq.user = { _id: 'user789' };
            mockReq.body = {
                productId: 'product123',
                rating: 6, // Rating inválido (debe ser 1-5)
                feedback: 'Test'
            };

            // Act
            await updateRecommendationFeedback(mockReq, mockRes);

            // Assert
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: 'Rating debe estar entre 1 y 5'
            });
        });

        it('debería requerir datos mínimos', async () => {
            // Arrange
            mockReq.user = { _id: 'user789' };
            mockReq.body = {
                // productId faltante
                rating: 4
            };

            // Act
            await updateRecommendationFeedback(mockReq, mockRes);

            // Assert
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: 'Producto y rating son requeridos'
            });
        });
    });

    describe('Casos de error generales', () => {
        it('debería manejar errores de parsing de parámetros', async () => {
            // Arrange
            mockReq.params.userId = 'invalid-user-id';
            mockReq.query.limit = 'invalid-limit';

            recommendationService.getUserBasedRecommendations.mockResolvedValue([]);

            // Act
            await getUserRecommendations(mockReq, mockRes);

            // Assert
            // Debería usar el límite por defecto cuando el parsing falla
            expect(recommendationService.getUserBasedRecommendations).toHaveBeenCalledWith(
                'invalid-user-id',
                10 // NaN se convierte a 10 por el fallback
            );
        });

        it('debería manejar respuestas vacías del servicio', async () => {
            // Arrange
            mockReq.params.userId = 'user123';
            recommendationService.getUserBasedRecommendations.mockResolvedValue([]);

            // Act
            await getUserRecommendations(mockReq, mockRes);

            // Assert
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                count: 0,
                data: []
            });
        });
    });
});
