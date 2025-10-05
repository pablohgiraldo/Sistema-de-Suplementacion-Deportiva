import { render, screen, fireEvent, waitFor } from '../../test/test-utils'
import userEvent from '@testing-library/user-event'
import LoginForm from '../../components/LoginForm'

describe('LoginForm Component', () => {
    const defaultProps = {
        onClose: vi.fn(),
        onSwitchToRegister: vi.fn(),
        onLogin: vi.fn()
    }

    beforeEach(() => {
        vi.clearAllMocks()
        // Mock alert
        global.alert = vi.fn()
    })

    test('renders login form with all required elements', () => {
        render(<LoginForm {...defaultProps} />)

        expect(screen.getByText('Iniciar Sesión')).toBeInTheDocument()
        expect(screen.getByText('Bienvenido de vuelta')).toBeInTheDocument()
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument()
        expect(screen.getByText('Iniciar Sesión')).toBeInTheDocument()
        expect(screen.getByText('¿Olvidaste tu contraseña?')).toBeInTheDocument()
        expect(screen.getByText('¿No tienes cuenta?')).toBeInTheDocument()
    })

    test('renders close button', () => {
        render(<LoginForm {...defaultProps} />)

        const closeButton = screen.getByText('✕')
        expect(closeButton).toBeInTheDocument()
    })

    test('calls onClose when close button is clicked', () => {
        const mockOnClose = vi.fn()
        render(<LoginForm {...defaultProps} onClose={mockOnClose} />)

        const closeButton = screen.getByText('✕')
        fireEvent.click(closeButton)

        expect(mockOnClose).toHaveBeenCalled()
    })

    test('calls onSwitchToRegister when register link is clicked', () => {
        const mockOnSwitchToRegister = vi.fn()
        render(<LoginForm {...defaultProps} onSwitchToRegister={mockOnSwitchToRegister} />)

        const registerLink = screen.getByText('Regístrate aquí')
        fireEvent.click(registerLink)

        expect(mockOnSwitchToRegister).toHaveBeenCalled()
    })

    test('updates form data when user types in email field', async () => {
        const user = userEvent.setup()
        render(<LoginForm {...defaultProps} />)

        const emailInput = screen.getByLabelText(/email/i)
        await user.type(emailInput, 'test@example.com')

        expect(emailInput).toHaveValue('test@example.com')
    })

    test('updates form data when user types in password field', async () => {
        const user = userEvent.setup()
        render(<LoginForm {...defaultProps} />)

        const passwordInput = screen.getByLabelText(/contraseña/i)
        await user.type(passwordInput, 'password123')

        expect(passwordInput).toHaveValue('password123')
    })

    test('updates remember me checkbox when clicked', async () => {
        const user = userEvent.setup()
        render(<LoginForm {...defaultProps} />)

        const rememberMeCheckbox = screen.getByLabelText(/recordarme/i)
        await user.click(rememberMeCheckbox)

        expect(rememberMeCheckbox).toBeChecked()
    })

    test('shows email validation error for invalid email', async () => {
        const user = userEvent.setup()
        render(<LoginForm {...defaultProps} />)

        const emailInput = screen.getByLabelText(/email/i)
        await user.type(emailInput, 'invalid-email')

        const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })
        await user.click(submitButton)

        expect(screen.getByText('El email no es válido')).toBeInTheDocument()
    })

    test('shows email validation error for empty email', async () => {
        const user = userEvent.setup()
        render(<LoginForm {...defaultProps} />)

        const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })
        await user.click(submitButton)

        expect(screen.getByText('El email es requerido')).toBeInTheDocument()
    })

    test('shows password validation error for empty password', async () => {
        const user = userEvent.setup()
        render(<LoginForm {...defaultProps} />)

        const emailInput = screen.getByLabelText(/email/i)
        await user.type(emailInput, 'test@example.com')

        const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })
        await user.click(submitButton)

        expect(screen.getByText('La contraseña es requerida')).toBeInTheDocument()
    })

    test('clears email error when user starts typing', async () => {
        const user = userEvent.setup()
        render(<LoginForm {...defaultProps} />)

        // First, trigger email error
        const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })
        await user.click(submitButton)

        expect(screen.getByText('El email es requerido')).toBeInTheDocument()

        // Then start typing in email field
        const emailInput = screen.getByLabelText(/email/i)
        await user.type(emailInput, 'test')

        expect(screen.queryByText('El email es requerido')).not.toBeInTheDocument()
    })

    test('clears password error when user starts typing', async () => {
        const user = userEvent.setup()
        render(<LoginForm {...defaultProps} />)

        // First, trigger password error
        const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })
        await user.click(submitButton)

        expect(screen.getByText('La contraseña es requerida')).toBeInTheDocument()

        // Then start typing in password field
        const passwordInput = screen.getByLabelText(/contraseña/i)
        await user.type(passwordInput, 'password')

        expect(screen.queryByText('La contraseña es requerida')).not.toBeInTheDocument()
    })

    test('calls onLogin with correct credentials when form is submitted', async () => {
        const user = userEvent.setup()
        const mockOnLogin = vi.fn().mockResolvedValue({ success: true })
        render(<LoginForm {...defaultProps} onLogin={mockOnLogin} />)

        const emailInput = screen.getByLabelText(/email/i)
        const passwordInput = screen.getByLabelText(/contraseña/i)
        const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })

        await user.type(emailInput, 'test@example.com')
        await user.type(passwordInput, 'password123')
        await user.click(submitButton)

        expect(mockOnLogin).toHaveBeenCalledWith('test@example.com', 'password123')
    })

    test('shows loading state during login', async () => {
        const user = userEvent.setup()
        const mockOnLogin = vi.fn().mockImplementation(() => new Promise(resolve =>
            setTimeout(() => resolve({ success: true }), 100)
        ))
        render(<LoginForm {...defaultProps} onLogin={mockOnLogin} />)

        const emailInput = screen.getByLabelText(/email/i)
        const passwordInput = screen.getByLabelText(/contraseña/i)
        const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })

        await user.type(emailInput, 'test@example.com')
        await user.type(passwordInput, 'password123')
        await user.click(submitButton)

        expect(screen.getByText('Iniciando sesión...')).toBeInTheDocument()
        expect(submitButton).toBeDisabled()
    })

    test('shows success message and closes form on successful login', async () => {
        const user = userEvent.setup()
        const mockOnLogin = vi.fn().mockResolvedValue({ success: true })
        const mockOnClose = vi.fn()
        render(<LoginForm {...defaultProps} onLogin={mockOnLogin} onClose={mockOnClose} />)

        const emailInput = screen.getByLabelText(/email/i)
        const passwordInput = screen.getByLabelText(/contraseña/i)
        const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })

        await user.type(emailInput, 'test@example.com')
        await user.type(passwordInput, 'password123')
        await user.click(submitButton)

        await waitFor(() => {
            expect(global.alert).toHaveBeenCalledWith('¡Bienvenido de vuelta a SuperGains!')
            expect(mockOnClose).toHaveBeenCalled()
        })
    })

    test('shows error message on failed login', async () => {
        const user = userEvent.setup()
        const mockOnLogin = vi.fn().mockResolvedValue({
            success: false,
            error: 'Credenciales incorrectas'
        })
        render(<LoginForm {...defaultProps} onLogin={mockOnLogin} />)

        const emailInput = screen.getByLabelText(/email/i)
        const passwordInput = screen.getByLabelText(/contraseña/i)
        const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })

        await user.type(emailInput, 'test@example.com')
        await user.type(passwordInput, 'wrongpassword')
        await user.click(submitButton)

        await waitFor(() => {
            expect(screen.getByText('Credenciales incorrectas')).toBeInTheDocument()
        })
    })

    test('shows generic error message on login exception', async () => {
        const user = userEvent.setup()
        const mockOnLogin = vi.fn().mockRejectedValue(new Error('Network error'))
        render(<LoginForm {...defaultProps} onLogin={mockOnLogin} />)

        const emailInput = screen.getByLabelText(/email/i)
        const passwordInput = screen.getByLabelText(/contraseña/i)
        const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })

        await user.type(emailInput, 'test@example.com')
        await user.type(passwordInput, 'password123')
        await user.click(submitButton)

        await waitFor(() => {
            expect(screen.getByText('Error al iniciar sesión. Inténtalo de nuevo.')).toBeInTheDocument()
        })
    })

    test('renders social login buttons', () => {
        render(<LoginForm {...defaultProps} />)

        expect(screen.getByText('Google')).toBeInTheDocument()
        expect(screen.getByText('Facebook')).toBeInTheDocument()
    })

    test('does not submit form with invalid data', async () => {
        const user = userEvent.setup()
        const mockOnLogin = vi.fn()
        render(<LoginForm {...defaultProps} onLogin={mockOnLogin} />)

        const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })
        await user.click(submitButton)

        expect(mockOnLogin).not.toHaveBeenCalled()
        expect(screen.getByText('El email es requerido')).toBeInTheDocument()
        expect(screen.getByText('La contraseña es requerida')).toBeInTheDocument()
    })

    test('submits form when Enter key is pressed', async () => {
        const user = userEvent.setup()
        const mockOnLogin = vi.fn().mockResolvedValue({ success: true })
        const mockOnClose = vi.fn()
        render(<LoginForm {...defaultProps} onLogin={mockOnLogin} onClose={mockOnClose} />)

        const emailInput = screen.getByLabelText(/email/i)
        const passwordInput = screen.getByLabelText(/contraseña/i)

        await user.type(emailInput, 'test@example.com')
        await user.type(passwordInput, 'password123')
        await user.keyboard('{Enter}')

        expect(mockOnLogin).toHaveBeenCalledWith('test@example.com', 'password123')
    })

    test('renders remember me checkbox unchecked by default', () => {
        render(<LoginForm {...defaultProps} />)

        const rememberMeCheckbox = screen.getByLabelText(/recordarme/i)
        expect(rememberMeCheckbox).not.toBeChecked()
    })

    test('has correct form accessibility attributes', () => {
        render(<LoginForm {...defaultProps} />)

        const emailInput = screen.getByLabelText(/email/i)
        const passwordInput = screen.getByLabelText(/contraseña/i)
        const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })

        expect(emailInput).toHaveAttribute('type', 'email')
        expect(passwordInput).toHaveAttribute('type', 'password')
        expect(submitButton).toHaveAttribute('type', 'submit')
    })

    test('shows divider text', () => {
        render(<LoginForm {...defaultProps} />)

        expect(screen.getByText('O continúa con')).toBeInTheDocument()
    })
})
