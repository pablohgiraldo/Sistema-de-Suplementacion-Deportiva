/**
 * Pruebas enfocadas en el fallback de recomendaciones personalizadas.
 * Verifica que usuarios sin historial reciban productos populares.
 */

import recommendationService from '../../src/services/recommendationService.js';
import Order from '../../src/models/Order.js';

jest.mock('../../src/models/Order.js');

describe('Recommendation Service – fallback de recomendaciones', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    function mockOrderFindWithResult(result) {
        const lean = jest.fn().mockResolvedValue(result);
        const select = jest.fn().mockReturnValue({ lean });
        Order.find.mockReturnValue({ select });
        return { select, lean };
    }

    it('usa productos populares cuando el usuario no tiene historial', async () => {
        // Arrange
        mockOrderFindWithResult([]);

        const popularFallback = [
            {
                _id: 'popular1',
                name: 'Producto Popular',
                recommendationReason: 'Producto popular',
                recommendationScore: 50
            }
        ];

        Order.aggregate.mockResolvedValue(popularFallback);

        // Act
        const recommendations = await recommendationService.getUserBasedRecommendations('user123', 5);

        // Assert
        expect(Order.find).toHaveBeenCalledWith({
            user: 'user123',
            status: { $in: ['pending', 'processing', 'shipped', 'delivered'] }
        });
        expect(Order.aggregate).toHaveBeenCalledTimes(1);
        expect(recommendations).toEqual(popularFallback);
    });
});

