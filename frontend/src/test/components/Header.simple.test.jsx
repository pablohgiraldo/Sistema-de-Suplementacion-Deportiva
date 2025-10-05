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

        const searchInput = screen.getByPlaceholderText('Buscar proteínas, alimentos...')
        expect(searchInput).toBeInTheDocument()
    })

    test('calls onSearch when user types in search input', () => {
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
            user: { _id: '1', nombre: 'Test User', rol: 'usuario' },
            isAuthenticated: true
        }

        render(<Header {...authenticatedProps} />)

        expect(screen.getByText('Test User')).toBeInTheDocument()
        expect(screen.getByText('Salir')).toBeInTheDocument()
    })

    test('renders category navigation items', () => {
        render(<Header {...defaultProps} />)

        expect(screen.getByText('Promociones')).toBeInTheDocument()
        expect(screen.getByText('Proteínas en Polvo')).toBeInTheDocument()
        expect(screen.getByText('Vitaminas y Más')).toBeInTheDocument()
    })

    test('renders filter options', () => {
        render(<Header {...defaultProps} />)

        expect(screen.getByText('Todos los Productos')).toBeInTheDocument()
        expect(screen.getByText('Más Vendidos')).toBeInTheDocument()
        expect(screen.getByText('Proteínas')).toBeInTheDocument()
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

        const countrySelector = screen.getByText('CO')
        expect(countrySelector).toBeInTheDocument()
    })
})
