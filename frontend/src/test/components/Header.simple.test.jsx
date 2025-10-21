import { render, screen, fireEvent } from '../../test/test-utils'
import Header from '../../components/Header'

// Mock simple de useAuth
vi.mock('../../contexts/AuthContext', () => ({
    useAuth: () => ({
        user: { _id: '1', nombre: 'Test User', rol: 'usuario' },
        isAuthenticated: true,
        login: vi.fn(),
        logout: vi.fn(),
        register: vi.fn(),
        isLoading: false,
        error: null
    })
}))

describe('Header Component - Simple Tests', () => {
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

    test('renders header with logo', () => {
        render(<Header {...defaultProps} />)

        expect(screen.getByText('SPG')).toBeInTheDocument()
        expect(screen.getByText('SUPERGAINS')).toBeInTheDocument()
    })

    test('renders search bar', () => {
        render(<Header {...defaultProps} />)

        const searchInputs = screen.getAllByPlaceholderText('Buscar proteínas, alimentos...')
        expect(searchInputs.length).toBeGreaterThan(0)
    })

    test('calls onSearch when user types in search input', () => {
        const mockOnSearch = vi.fn()
        render(<Header {...defaultProps} onSearch={mockOnSearch} />)

        const searchInputs = screen.getAllByPlaceholderText('Buscar proteínas, alimentos...')
        const searchInput = searchInputs[0] // Tomar el primer input
        fireEvent.change(searchInput, { target: { value: 'whey protein' } })

        expect(mockOnSearch).toHaveBeenCalledWith('whey protein')
    })

    test('renders login and register links when user is not authenticated', () => {
        render(<Header {...defaultProps} />)

        const loginLinks = screen.getAllByText('Iniciar sesión')
        const registerLinks = screen.getAllByText('Registrarse')
        expect(loginLinks.length).toBeGreaterThan(0)
        expect(registerLinks.length).toBeGreaterThan(0)
    })

    test('renders user info when user is authenticated', () => {
        const authenticatedProps = {
            ...defaultProps,
            user: { _id: '1', nombre: 'Test User', rol: 'usuario' },
            isAuthenticated: true
        }

        render(<Header {...authenticatedProps} />)

        const userNames = screen.getAllByText('Test User')
        const logoutButtons = screen.getAllByText('Salir')
        expect(userNames.length).toBeGreaterThan(0)
        expect(logoutButtons.length).toBeGreaterThan(0)
    })

    test('renders category navigation items', () => {
        render(<Header {...defaultProps} />)

        const promociones = screen.getAllByText('Promociones')
        const proteinas = screen.getAllByText('Proteínas en Polvo')
        const vitaminas = screen.getAllByText('Vitaminas y Más')
        expect(promociones.length).toBeGreaterThan(0)
        expect(proteinas.length).toBeGreaterThan(0)
        expect(vitaminas.length).toBeGreaterThan(0)
    })

    test('renders filter options', () => {
        render(<Header {...defaultProps} />)

        expect(screen.getAllByText('Todos los Productos')).toHaveLength(2)
        const masVendidos = screen.getAllByText('Más Vendidos')
        const proteinas = screen.getAllByText('Proteínas')
        expect(masVendidos.length).toBeGreaterThan(0)
        expect(proteinas.length).toBeGreaterThan(0)
    })

    test('renders mobile menu button', () => {
        render(<Header {...defaultProps} />)

        const mobileMenuButton = screen.getByLabelText(/abrir menú de navegación/i)
        expect(mobileMenuButton).toBeInTheDocument()
    })

    test('renders promotional banner', () => {
        render(<Header {...defaultProps} />)

        expect(screen.getByText(/semana de proteínas/i)).toBeInTheDocument()
        expect(screen.getByText(/20% de descuento/i)).toBeInTheDocument()
    })

    test('renders country selector', () => {
        render(<Header {...defaultProps} />)

        const countrySelectors = screen.getAllByText('CO')
        expect(countrySelectors).toHaveLength(2)
    })
})
