import { render, screen, fireEvent, waitFor } from '../../test/test-utils'
import ProductCard from '../../components/productCard'
import { mockProducts, mockUser, mockCartContext } from '../../test/test-utils'

// Mock de useAuth
vi.mock('../../contexts/AuthContext', () => ({
    useAuth: () => ({
        isAuthenticated: true,
        user: mockUser
    })
}))

// Mock de useCart
vi.mock('../../contexts/CartContext', () => ({
    useCart: () => mockCartContext
}))

// Mock de useInventory
vi.mock('../../hooks/useInventory', () => ({
    useInventory: () => ({
        inventory: {
            availableStock: 10,
            currentStock: 10,
            reservedStock: 0,
            status: 'active'
        },
        loading: false
    }),
    inventoryUtils: {
        getStockStatus: () => 'Disponible',
        getStockStatusColor: () => 'bg-green-100 text-green-800',
        canAddToCart: () => true
    }
}))

// Mock de useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return {
        ...actual,
        useNavigate: () => mockNavigate
    }
})

describe('ProductCard Component', () => {
    const mockProduct = mockProducts[0]

    beforeEach(() => {
        vi.clearAllMocks()
    })

    test('renders product information correctly', () => {
        render(<ProductCard p={mockProduct} />)

        expect(screen.getByText(mockProduct.name)).toBeInTheDocument()
        expect(screen.getByText(mockProduct.description)).toBeInTheDocument()
        expect(screen.getByText('$89.99 USD')).toBeInTheDocument()
        expect(screen.getByAltText(mockProduct.name)).toBeInTheDocument()
    })

    test('renders product image with correct src', () => {
        render(<ProductCard p={mockProduct} />)

        const productImage = screen.getByAltText(mockProduct.name)
        expect(productImage).toHaveAttribute('src')
        expect(productImage).toHaveAttribute('loading', 'lazy')
    })

    test('displays stock status correctly', () => {
        render(<ProductCard p={mockProduct} />)

        expect(screen.getByText('Disponible')).toBeInTheDocument()
    })

    test('renders rating stars', () => {
        render(<ProductCard p={mockProduct} />)

        const stars = screen.getAllByTestId ?
            screen.getAllByTestId('star') :
            screen.getAllByRole('img').filter(img => img.getAttribute('fill') === 'currentColor')

        expect(stars.length).toBeGreaterThan(0)
    })

    test('renders flavor information', () => {
        render(<ProductCard p={mockProduct} />)

        // Verificar que se muestra información de sabor
        const flavorElements = screen.getAllByText(/\+ \d+/)
        expect(flavorElements.length).toBeGreaterThan(0)
    })

    test('renders price per kg', () => {
        render(<ProductCard p={mockProduct} />)

        expect(screen.getByText(/\$[\d.]+ USD\/kg/)).toBeInTheDocument()
    })

    test('navigates to product detail when card is clicked', () => {
        render(<ProductCard p={mockProduct} />)

        const productCard = screen.getByText(mockProduct.name).closest('div')
        fireEvent.click(productCard)

        expect(mockNavigate).toHaveBeenCalledWith(`/product/${mockProduct._id}`)
    })

    test('calls addToCart when add to cart button is clicked', async () => {
        const mockAddToCart = vi.fn().mockResolvedValue()
        const cartContext = {
            ...mockCartContext,
            addToCart: mockAddToCart
        }

        vi.mocked(require('../../contexts/CartContext').useCart).mockReturnValue(cartContext)

        render(<ProductCard p={mockProduct} />)

        const addToCartButton = screen.getByRole('button')
        fireEvent.click(addToCartButton)

        await waitFor(() => {
            expect(mockAddToCart).toHaveBeenCalledWith(mockProduct)
        })
    })

    test('shows alert when user is not authenticated and tries to add to cart', async () => {
        vi.mocked(require('../../contexts/AuthContext').useAuth).mockReturnValue({
            isAuthenticated: false,
            user: null
        })

        // Mock alert
        global.alert = vi.fn()

        render(<ProductCard p={mockProduct} />)

        const addToCartButton = screen.getByRole('button')
        fireEvent.click(addToCartButton)

        expect(global.alert).toHaveBeenCalledWith('Necesitas iniciar sesión para agregar productos al carrito')
    })

    test('shows alert when product is out of stock', async () => {
        vi.mocked(require('../../hooks/useInventory').useInventory).mockReturnValue({
            inventory: {
                availableStock: 0,
                currentStock: 0,
                reservedStock: 0,
                status: 'out_of_stock'
            },
            loading: false
        })

        vi.mocked(require('../../hooks/useInventory').inventoryUtils).canAddToCart = vi.fn().mockReturnValue(false)
        vi.mocked(require('../../hooks/useInventory').inventoryUtils).getStockStatus = vi.fn().mockReturnValue('Agotado')

        global.alert = vi.fn()

        render(<ProductCard p={mockProduct} />)

        const addToCartButton = screen.getByRole('button')
        fireEvent.click(addToCartButton)

        expect(global.alert).toHaveBeenCalledWith('Este producto está agotado')
    })

    test('shows alert when insufficient stock', async () => {
        vi.mocked(require('../../hooks/useInventory').useInventory).mockReturnValue({
            inventory: {
                availableStock: 2,
                currentStock: 2,
                reservedStock: 0,
                status: 'active'
            },
            loading: false
        })

        vi.mocked(require('../../hooks/useInventory').inventoryUtils).canAddToCart = vi.fn().mockReturnValue(false)

        global.alert = vi.fn()

        render(<ProductCard p={mockProduct} />)

        const addToCartButton = screen.getByRole('button')
        fireEvent.click(addToCartButton)

        expect(global.alert).toHaveBeenCalledWith('Stock insuficiente. Disponible: 2 unidades')
    })

    test('disables add to cart button when loading inventory', () => {
        vi.mocked(require('../../hooks/useInventory').useInventory).mockReturnValue({
            inventory: null,
            loading: true
        })

        render(<ProductCard p={mockProduct} />)

        const addToCartButton = screen.getByRole('button')
        expect(addToCartButton).toBeDisabled()
    })

    test('shows cart quantity indicator when product is in cart', () => {
        const cartContext = {
            ...mockCartContext,
            isInCart: vi.fn().mockReturnValue(true),
            getCartItemQuantity: vi.fn().mockReturnValue(2)
        }

        vi.mocked(require('../../contexts/CartContext').useCart).mockReturnValue(cartContext)

        render(<ProductCard p={mockProduct} />)

        expect(screen.getByText('2 en carrito')).toBeInTheDocument()
    })

    test('renders product badge for bestseller', () => {
        const bestsellerProduct = {
            ...mockProduct,
            isBestseller: true
        }

        render(<ProductCard p={bestsellerProduct} />)

        expect(screen.getByText('Bestseller')).toBeInTheDocument()
    })

    test('renders product badge for new flavor', () => {
        const newProduct = {
            ...mockProduct,
            isNew: true,
            createdAt: new Date()
        }

        render(<ProductCard p={newProduct} />)

        expect(screen.getByText('Nuevo Sabor')).toBeInTheDocument()
    })

    test('shows original price when product has discount', () => {
        const discountedProduct = {
            ...mockProduct,
            originalPrice: 99.99,
            price: 89.99
        }

        render(<ProductCard p={discountedProduct} />)

        expect(screen.getByText('$99.99 USD')).toBeInTheDocument()
        expect(screen.getByText('$89.99 USD')).toBeInTheDocument()
    })

    test('handles image loading error gracefully', () => {
        render(<ProductCard p={mockProduct} />)

        const productImage = screen.getByAltText(mockProduct.name)

        // Simular error de carga de imagen
        fireEvent.error(productImage)

        // La imagen debería tener un src de respaldo
        expect(productImage).toHaveAttribute('src')
    })

    test('stops event propagation when add to cart button is clicked', () => {
        const mockStopPropagation = vi.fn()

        render(<ProductCard p={mockProduct} />)

        const addToCartButton = screen.getByRole('button')

        // Simular evento con stopPropagation
        const mockEvent = {
            stopPropagation: mockStopPropagation,
            preventDefault: vi.fn()
        }

        fireEvent.click(addToCartButton, mockEvent)

        // Verificar que no se navegó (el navigate no debería ser llamado)
        expect(mockNavigate).not.toHaveBeenCalled()
    })

    test('renders wishlist button', () => {
        render(<ProductCard p={mockProduct} />)

        // El WishlistButton debería estar presente
        // Verificamos por la presencia del componente (puede variar según implementación)
        const wishlistArea = screen.getByText(mockProduct.name).closest('div').querySelector('[class*="absolute top-3 right-3"]')
        expect(wishlistArea).toBeInTheDocument()
    })

    test('formats price correctly for different values', () => {
        const productWithDecimalPrice = {
            ...mockProduct,
            price: 89.9
        }

        render(<ProductCard p={productWithDecimalPrice} />)

        expect(screen.getByText('$89.90 USD')).toBeInTheDocument()
    })

    test('handles product without description', () => {
        const productWithoutDescription = {
            ...mockProduct,
            description: null
        }

        render(<ProductCard p={productWithoutDescription} />)

        expect(screen.getByText(mockProduct.name)).toBeInTheDocument()
        expect(screen.queryByText(mockProduct.description)).not.toBeInTheDocument()
    })

    test('handles product without name gracefully', () => {
        const productWithoutName = {
            ...mockProduct,
            name: null
        }

        render(<ProductCard p={productWithoutName} />)

        expect(screen.getByText('Sin nombre')).toBeInTheDocument()
    })

    test('calculates price per kg correctly', () => {
        const productWithWeight = {
            ...mockProduct,
            price: 100,
            weightInGrams: 500
        }

        render(<ProductCard p={productWithWeight} />)

        expect(screen.getByText('($200.00 USD/kg)')).toBeInTheDocument()
    })
})
