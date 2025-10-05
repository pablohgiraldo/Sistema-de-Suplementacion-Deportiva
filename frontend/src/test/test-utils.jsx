import React from 'react'
import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Crear un QueryClient para testing
const createTestQueryClient = () => new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
        },
    },
})

// Wrapper personalizado para componentes que necesitan providers
const AllTheProviders = ({ children }) => {
    const queryClient = createTestQueryClient()

    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                {children}
            </BrowserRouter>
        </QueryClientProvider>
    )
}

// Función personalizada de render que incluye providers
const customRender = (ui, options) =>
    render(ui, { wrapper: AllTheProviders, ...options })

// Mock de datos para testing
export const mockProducts = [
    {
        _id: '1',
        name: 'Whey Protein',
        brand: 'Optimum Nutrition',
        price: 89.99,
        stock: 50,
        description: 'Proteína de suero de leche de alta calidad',
        imageUrl: 'https://example.com/whey.jpg',
        categories: ['Proteínas', 'Suplementos']
    },
    {
        _id: '2',
        name: 'Creatina Monohidrato',
        brand: 'MuscleTech',
        price: 29.99,
        stock: 25,
        description: 'Creatina monohidrato micronizada',
        imageUrl: 'https://example.com/creatine.jpg',
        categories: ['Creatina', 'Suplementos']
    }
]

export const mockUser = {
    _id: '1',
    nombre: 'Test User',
    email: 'test@example.com',
    rol: 'usuario',
    activo: true
}

export const mockCartItems = [
    {
        product: '1',
        quantity: 2,
        price: 89.99
    },
    {
        product: '2',
        quantity: 1,
        price: 29.99
    }
]

// Mock de funciones de API
export const mockApiFunctions = {
    login: vi.fn().mockResolvedValue({ success: true, token: 'mock-token' }),
    register: vi.fn().mockResolvedValue({ success: true, token: 'mock-token' }),
    getProducts: vi.fn().mockResolvedValue({ success: true, data: mockProducts }),
    addToCart: vi.fn().mockResolvedValue({ success: true }),
    removeFromCart: vi.fn().mockResolvedValue({ success: true }),
    updateCartItem: vi.fn().mockResolvedValue({ success: true }),
    getCart: vi.fn().mockResolvedValue({ success: true, data: mockCartItems }),
    createOrder: vi.fn().mockResolvedValue({ success: true, orderId: 'order-123' }),
    getUserOrders: vi.fn().mockResolvedValue({ success: true, data: [] }),
    addToWishlist: vi.fn().mockResolvedValue({ success: true }),
    removeFromWishlist: vi.fn().mockResolvedValue({ success: true }),
    getWishlist: vi.fn().mockResolvedValue({ success: true, data: [] }),
}

// Helper para mockear contextos
export const mockAuthContext = {
    user: mockUser,
    isAuthenticated: true,
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
    isLoading: false,
    error: null
}

export const mockCartContext = {
    cartItems: mockCartItems,
    addItem: vi.fn(),
    removeItem: vi.fn(),
    updateQuantity: vi.fn(),
    clearCart: vi.fn(),
    getCartItemsCount: vi.fn().mockReturnValue(3),
    getCartTotal: vi.fn().mockReturnValue(209.97),
    openCart: vi.fn(),
    closeCart: vi.fn(),
    isCartOpen: false,
    loadCartFromBackend: vi.fn()
}

// Re-exportar todo desde React Testing Library
export * from '@testing-library/react'
export { customRender as render }
