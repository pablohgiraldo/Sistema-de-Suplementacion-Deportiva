import { render, screen, fireEvent, waitFor } from '../../test/test-utils'
import Header from '../../components/Header'
import { mockUser, mockAuthContext } from '../../test/mocks'

// Mock de useAuth
vi.mock('../../contexts/AuthContext', () => ({
    useAuth: () => mockAuthContext
}))

describe('Header Component', () => {
    const defaultProps = {
        onCategoryClick: vi.fn(),
        onFilterClick: vi.fn(),
        selectedCategory: 'Todos los Productos',
        selectedFilter: 'Todos los Productos',
        user: null,
        isAuthenticated: false,
        onShowLogin: vi.fn(),
        onShowRegister: vi.fn(),
        onLogout: vi.fn(),
        onOpenCart: vi.fn(),
        cartItemsCount: 0,
        onSearch: vi.fn(),
        searchQuery: ''
    }

    beforeEach(() => {
        vi.clearAllMocks()
    })

    test('renders header with logo and navigation', () => {
        render(<Header {...defaultProps} />)

        expect(screen.getByText('SPG')).toBeInTheDocument()
        expect(screen.getByText('SUPERGAINS')).toBeInTheDocument()
        expect(screen.getByText('CO')).toBeInTheDocument()
    })

    test('renders search bar in desktop view', () => {
        render(<Header {...defaultProps} />)

        const searchInput = screen.getByPlaceholderText('Buscar proteínas, alimentos...')
        expect(searchInput).toBeInTheDocument()
        expect(searchInput).toHaveValue('')
    })

    test('calls onSearch when user types in search input', async () => {
        const mockOnSearch = vi.fn()
        render(<Header {...defaultProps} onSearch={mockOnSearch} />)

        const searchInput = screen.getByPlaceholderText('Buscar proteínas, alimentos...')
        fireEvent.change(searchInput, { target: { value: 'whey protein' } })

        expect(mockOnSearch).toHaveBeenCalledWith('whey protein')
    })

    test('renders login and register links when user is not authenticated', () => {
        render(<Header {...defaultProps} />)

        expect(screen.getByText('Iniciar sesión')).toBeInTheDocument()
        expect(screen.getByText('Registrarse')).toBeInTheDocument()
    })

    test('renders user info when user is authenticated', () => {
        const authenticatedProps = {
            ...defaultProps,
            user: mockUser,
            isAuthenticated: true
        }

        render(<Header {...authenticatedProps} />)

        expect(screen.getByText(mockUser.nombre)).toBeInTheDocument()
        expect(screen.getByText('Mis Pedidos')).toBeInTheDocument()
        expect(screen.getByText('Salir')).toBeInTheDocument()
    })

    test('calls onLogout when logout button is clicked', () => {
        const mockOnLogout = vi.fn()
        const authenticatedProps = {
            ...defaultProps,
            user: mockUser,
            isAuthenticated: true,
            onLogout: mockOnLogout
        }

        render(<Header {...authenticatedProps} />)

        const logoutButton = screen.getByText('Salir')
        fireEvent.click(logoutButton)

        expect(mockOnLogout).toHaveBeenCalled()
    })

    test('renders cart icon with count when user is authenticated and not admin', () => {
        const authenticatedProps = {
            ...defaultProps,
            user: { ...mockUser, rol: 'usuario' },
            isAuthenticated: true,
            cartItemsCount: 3
        }

        render(<Header {...authenticatedProps} />)

        const cartLink = screen.getByRole('link', { name: /cart/i })
        expect(cartLink).toBeInTheDocument()
        expect(screen.getByText('3')).toBeInTheDocument()
    })

    test('renders admin dashboard link when user is admin', () => {
        const adminProps = {
            ...defaultProps,
            user: { ...mockUser, rol: 'admin' },
            isAuthenticated: true
        }

        render(<Header {...adminProps} />)

        const adminLink = screen.getByRole('link', { name: /dashboard de administración/i })
        expect(adminLink).toBeInTheDocument()
    })

    test('renders wishlist link for non-admin users', () => {
        const authenticatedProps = {
            ...defaultProps,
            user: { ...mockUser, rol: 'usuario' },
            isAuthenticated: true
        }

        render(<Header {...authenticatedProps} />)

        const wishlistLink = screen.getByRole('link', { name: /mi lista de deseos/i })
        expect(wishlistLink).toBeInTheDocument()
    })

    test('renders category navigation items', () => {
        render(<Header {...defaultProps} />)

        expect(screen.getByText('Promociones')).toBeInTheDocument()
        expect(screen.getByText('Proteínas en Polvo')).toBeInTheDocument()
        expect(screen.getByText('Vitaminas y Más')).toBeInTheDocument()
        expect(screen.getByText('Rendimiento')).toBeInTheDocument()
    })

    test('calls onCategoryClick when category is clicked', () => {
        const mockOnCategoryClick = vi.fn()
        render(<Header {...defaultProps} onCategoryClick={mockOnCategoryClick} />)

        const promocionesCategory = screen.getByText('Promociones')
        fireEvent.click(promocionesCategory)

        expect(mockOnCategoryClick).toHaveBeenCalledWith('Más Vendidos')
    })

    test('renders filter options', () => {
        render(<Header {...defaultProps} />)

        expect(screen.getByText('Todos los Productos')).toBeInTheDocument()
        expect(screen.getByText('Más Vendidos')).toBeInTheDocument()
        expect(screen.getByText('Proteínas')).toBeInTheDocument()
    })

    test('calls onFilterClick when filter is clicked', () => {
        const mockOnFilterClick = vi.fn()
        render(<Header {...defaultProps} onFilterClick={mockOnFilterClick} />)

        const masVendidosFilter = screen.getByText('Más Vendidos')
        fireEvent.click(masVendidosFilter)

        expect(mockOnFilterClick).toHaveBeenCalledWith('Más Vendidos')
    })

    test('highlights selected category', () => {
        const propsWithSelectedCategory = {
            ...defaultProps,
            selectedCategory: 'Proteínas'
        }

        render(<Header {...propsWithSelectedCategory} />)

        const proteinaCategory = screen.getByText('Proteínas en Polvo')
        expect(proteinaCategory.closest('div')).toHaveClass('text-blue-600')
    })

    test('highlights selected filter', () => {
        const propsWithSelectedFilter = {
            ...defaultProps,
            selectedFilter: 'Más Vendidos'
        }

        render(<Header {...propsWithSelectedFilter} />)

        const masVendidosFilter = screen.getByText('Más Vendidos')
        expect(masVendidosFilter).toHaveClass('text-blue-600')
    })

    test('renders mobile menu button', () => {
        render(<Header {...defaultProps} />)

        const mobileMenuButton = screen.getByLabelText(/abrir menú de navegación/i)
        expect(mobileMenuButton).toBeInTheDocument()
    })

    test('toggles mobile menu when button is clicked', async () => {
        render(<Header {...defaultProps} />)

        const mobileMenuButton = screen.getByLabelText(/abrir menú de navegación/i)
        fireEvent.click(mobileMenuButton)

        await waitFor(() => {
            expect(screen.getByLabelText(/cerrar menú de navegación/i)).toBeInTheDocument()
        })
    })

    test('renders mobile search input when menu is open', async () => {
        render(<Header {...defaultProps} />)

        const mobileMenuButton = screen.getByLabelText(/abrir menú de navegación/i)
        fireEvent.click(mobileMenuButton)

        await waitFor(() => {
            const mobileSearchInput = screen.getByLabelText(/buscar productos/i)
            expect(mobileSearchInput).toBeInTheDocument()
        })
    })

    test('closes mobile menu when overlay is clicked', async () => {
        render(<Header {...defaultProps} />)

        const mobileMenuButton = screen.getByLabelText(/abrir menú de navegación/i)
        fireEvent.click(mobileMenuButton)

        await waitFor(() => {
            const overlay = screen.getByRole('generic')
            fireEvent.click(overlay)
        })

        await waitFor(() => {
            expect(screen.getByLabelText(/abrir menú de navegación/i)).toBeInTheDocument()
        })
    })

    test('renders mobile categories when menu is open', async () => {
        render(<Header {...defaultProps} />)

        const mobileMenuButton = screen.getByLabelText(/abrir menú de navegación/i)
        fireEvent.click(mobileMenuButton)

        await waitFor(() => {
            expect(screen.getByText('Categorías')).toBeInTheDocument()
            expect(screen.getByText('Filtros Rápidos')).toBeInTheDocument()
        })
    })

    test('scrolls to nosotros section when nosotros category is clicked', async () => {
        // Mock scrollIntoView
        const mockScrollIntoView = vi.fn()
        const mockElement = { scrollIntoView: mockScrollIntoView }
        vi.spyOn(document, 'getElementById').mockReturnValue(mockElement)

        render(<Header {...defaultProps} />)

        const nosotrosCategory = screen.getByText('Nosotros')
        fireEvent.click(nosotrosCategory)

        await waitFor(() => {
            expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' })
        })
    })

    test('handles escape key to close mobile menu', async () => {
        render(<Header {...defaultProps} />)

        const mobileMenuButton = screen.getByLabelText(/abrir menú de navegación/i)
        fireEvent.click(mobileMenuButton)

        await waitFor(() => {
            expect(screen.getByLabelText(/cerrar menú de navegación/i)).toBeInTheDocument()
        })

        fireEvent.keyDown(document, { key: 'Escape' })

        await waitFor(() => {
            expect(screen.getByLabelText(/abrir menú de navegación/i)).toBeInTheDocument()
        })
    })

    test('renders promotional banner', () => {
        render(<Header {...defaultProps} />)

        expect(screen.getByText(/semana de proteínas/i)).toBeInTheDocument()
        expect(screen.getByText(/20% de descuento/i)).toBeInTheDocument()
    })

    test('renders country selector', () => {
        render(<Header {...defaultProps} />)

        const countrySelector = screen.getByText('CO')
        expect(countrySelector).toBeInTheDocument()
    })
})
