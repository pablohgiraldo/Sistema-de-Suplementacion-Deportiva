// Mocks globales para testing

// Mock de AuthContext
export const mockAuthContext = {
    user: {
        _id: '1',
        nombre: 'Test User',
        email: 'test@example.com',
        rol: 'usuario'
    },
    isAuthenticated: true,
    login: vi.fn().mockResolvedValue({ success: true }),
    logout: vi.fn(),
    register: vi.fn().mockResolvedValue({ success: true }),
    isLoading: false,
    error: null
}

// Mock de CartContext
export const mockCartContext = {
    cartItems: [
        {
            product: { _id: '1', name: 'Whey Protein', price: 89.99 },
            quantity: 2
        }
    ],
    addItem: vi.fn().mockResolvedValue({ success: true }),
    removeItem: vi.fn().mockResolvedValue({ success: true }),
    updateQuantity: vi.fn().mockResolvedValue({ success: true }),
    clearCart: vi.fn().mockResolvedValue({ success: true }),
    getCartItemsCount: vi.fn().mockReturnValue(3),
    getCartTotal: vi.fn().mockReturnValue(209.97),
    openCart: vi.fn(),
    closeCart: vi.fn(),
    isCartOpen: false,
    loadCartFromBackend: vi.fn().mockResolvedValue({ success: true }),
    isInCart: vi.fn().mockReturnValue(false),
    getCartItemQuantity: vi.fn().mockReturnValue(0)
}

// Mock de useInventory hook
export const mockUseInventory = {
    inventory: {
        _id: '1',
        product: 'product-1',
        currentStock: 50,
        availableStock: 45,
        reservedStock: 5,
        status: 'active'
    },
    loading: false
}

// Mock de inventoryUtils
export const mockInventoryUtils = {
    getStockStatus: vi.fn().mockReturnValue('Disponible'),
    getStockStatusColor: vi.fn().mockReturnValue('bg-green-100 text-green-800'),
    canAddToCart: vi.fn().mockReturnValue(true)
}

// Mock de useNavigate
export const mockNavigate = vi.fn()

// Mock de WishlistButton component
export const MockWishlistButton = ({ productId, productName, size }) => {
    return <div data-testid={`wishlist-button-${productId}`}>Wishlist</div>
}

// Mock de servicios API
export const mockApi = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
}

// Mock de inventoryService
export const mockInventoryService = {
    getInventory: vi.fn().mockResolvedValue({ success: true, data: mockUseInventory.inventory }),
    updateStock: vi.fn().mockResolvedValue({ success: true }),
    getStockStatus: vi.fn().mockReturnValue('active')
}
