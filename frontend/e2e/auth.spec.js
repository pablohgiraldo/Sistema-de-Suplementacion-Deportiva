import { test, expect, testUsers } from './fixtures/auth.js';
import {
    waitForNotification,
    expectFormValidationErrors,
    expectNoFormValidationErrors,
    simulateRateLimit,
    simulateNetworkError
} from './fixtures/helpers.js';

test.describe('Flujo de Autenticación', () => {

    test.describe('Login', () => {
        test('debería permitir login exitoso con credenciales válidas', async ({ page }) => {
            await page.goto('/login');

            // Verificar que el formulario está presente
            await expect(page.locator('[data-testid="login-form"]')).toBeVisible();

            // Llenar el formulario
            await page.fill('[data-testid="email-input"]', testUsers.validUser.email);
            await page.fill('[data-testid="password-input"]', testUsers.validUser.password);

            // Hacer clic en login
            await page.click('[data-testid="login-button"]');

            // Verificar redirección a home
            await page.waitForURL('/', { timeout: 10000 });

            // Verificar que el usuario está autenticado
            await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
        });

        test('debería mostrar error con credenciales inválidas', async ({ page }) => {
            await page.goto('/login');

            // Llenar con credenciales inválidas
            await page.fill('[data-testid="email-input"]', testUsers.invalidUser.email);
            await page.fill('[data-testid="password-input"]', testUsers.invalidUser.password);

            // Hacer clic en login
            await page.click('[data-testid="login-button"]');

            // Verificar que aparece el error
            await waitForNotification(page, 'error');

            // Verificar que permanece en la página de login
            expect(page.url()).toContain('/login');
        });

        test('debería validar campos requeridos', async ({ page }) => {
            await page.goto('/login');

            // Intentar enviar formulario vacío
            await page.click('[data-testid="login-button"]');

            // Verificar errores de validación
            await expectFormValidationErrors(page, ['email', 'password']);
        });

        test('debería validar formato de email', async ({ page }) => {
            await page.goto('/login');

            // Email inválido
            await page.fill('[data-testid="email-input"]', 'email-invalido');
            await page.fill('[data-testid="password-input"]', 'password123');

            await page.click('[data-testid="login-button"]');

            // Verificar error de email
            await expect(page.locator('[data-testid="email-error"]')).toBeVisible();
        });

        test('debería mostrar/ocultar contraseña con el botón de ojo', async ({ page }) => {
            await page.goto('/login');

            const passwordInput = page.locator('[data-testid="password-input"]');
            const toggleButton = page.locator('[data-testid="password-toggle"]');

            // Verificar que inicialmente es password
            await expect(passwordInput).toHaveAttribute('type', 'password');

            // Hacer clic en el botón de ojo
            await toggleButton.click();

            // Verificar que ahora es text
            await expect(passwordInput).toHaveAttribute('type', 'text');

            // Hacer clic de nuevo
            await toggleButton.click();

            // Verificar que vuelve a ser password
            await expect(passwordInput).toHaveAttribute('type', 'password');
        });

        test('debería manejar rate limiting (429)', async ({ page }) => {
            // Simular rate limiting
            await simulateRateLimit(page);

            await page.goto('/login');

            // Intentar hacer login
            await page.fill('[data-testid="email-input"]', testUsers.validUser.email);
            await page.fill('[data-testid="password-input"]', testUsers.validUser.password);
            await page.click('[data-testid="login-button"]');

            // Verificar que aparece el RateLimitHandler
            await expect(page.locator('[data-testid="rate-limit-handler"]')).toBeVisible();

            // Verificar que muestra contador
            await expect(page.locator('[data-testid="countdown-timer"]')).toBeVisible();
        });

        test('debería manejar errores de red', async ({ page }) => {
            // Simular error de red
            await simulateNetworkError(page, 'users/login');

            await page.goto('/login');

            // Intentar hacer login
            await page.fill('[data-testid="email-input"]', testUsers.validUser.email);
            await page.fill('[data-testid="password-input"]', testUsers.validUser.password);
            await page.click('[data-testid="login-button"]');

            // Verificar que aparece error de conexión
            await waitForNotification(page, 'error');
        });
    });

    test.describe('Registro', () => {
        test('debería permitir registro exitoso', async ({ page }) => {
            await page.goto('/register');

            // Verificar que el formulario está presente
            await expect(page.locator('[data-testid="register-form"]')).toBeVisible();

            // Llenar el formulario
            await page.fill('[data-testid="name-input"]', testUsers.newUser.name);
            await page.fill('[data-testid="email-input"]', testUsers.newUser.email);
            await page.fill('[data-testid="password-input"]', testUsers.newUser.password);
            await page.fill('[data-testid="confirm-password-input"]', testUsers.newUser.confirmPassword);

            // Hacer clic en registrar
            await page.click('[data-testid="register-button"]');

            // Verificar notificación de éxito
            await waitForNotification(page, 'success');

            // Verificar redirección a login
            await page.waitForURL('/login', { timeout: 10000 });
        });

        test('debería validar que las contraseñas coincidan', async ({ page }) => {
            await page.goto('/register');

            // Llenar con contraseñas diferentes
            await page.fill('[data-testid="name-input"]', testUsers.newUser.name);
            await page.fill('[data-testid="email-input"]', testUsers.newUser.email);
            await page.fill('[data-testid="password-input"]', 'password123');
            await page.fill('[data-testid="confirm-password-input"]', 'differentpassword');

            await page.click('[data-testid="register-button"]');

            // Verificar error de validación
            await expect(page.locator('[data-testid="confirm-password-error"]')).toBeVisible();
        });

        test('debería validar longitud mínima de contraseña', async ({ page }) => {
            await page.goto('/register');

            // Contraseña muy corta
            await page.fill('[data-testid="name-input"]', testUsers.newUser.name);
            await page.fill('[data-testid="email-input"]', testUsers.newUser.email);
            await page.fill('[data-testid="password-input"]', '123');
            await page.fill('[data-testid="confirm-password-input"]', '123');

            await page.click('[data-testid="register-button"]');

            // Verificar error de validación
            await expect(page.locator('[data-testid="password-error"]')).toBeVisible();
        });

        test('debería mostrar progreso durante el registro', async ({ page }) => {
            await page.goto('/register');

            // Llenar formulario válido
            await page.fill('[data-testid="name-input"]', testUsers.newUser.name);
            await page.fill('[data-testid="email-input"]', testUsers.newUser.email);
            await page.fill('[data-testid="password-input"]', testUsers.newUser.password);
            await page.fill('[data-testid="confirm-password-input"]', testUsers.newUser.confirmPassword);

            // Hacer clic en registrar
            await page.click('[data-testid="register-button"]');

            // Verificar que aparece el indicador de progreso
            await expect(page.locator('[data-testid="form-progress"]')).toBeVisible();

            // Verificar que muestra los pasos
            await expect(page.locator('[data-testid="progress-step-1"]')).toBeVisible();
        });

        test('debería manejar errores del servidor durante registro', async ({ page }) => {
            // Simular error del servidor
            await page.route('**/api/users/register', async route => {
                await route.fulfill({
                    status: 400,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        success: false,
                        message: 'Email ya registrado',
                        details: [
                            { field: 'email', message: 'Este email ya está en uso' }
                        ]
                    })
                });
            });

            await page.goto('/register');

            // Llenar formulario
            await page.fill('[data-testid="name-input"]', testUsers.newUser.name);
            await page.fill('[data-testid="email-input"]', 'existing@test.com');
            await page.fill('[data-testid="password-input"]', testUsers.newUser.password);
            await page.fill('[data-testid="confirm-password-input"]', testUsers.newUser.confirmPassword);

            await page.click('[data-testid="register-button"]');

            // Verificar que aparece el error del servidor
            await waitForNotification(page, 'error');
        });
    });

    test.describe('Navegación entre formularios', () => {
        test('debería navegar de login a registro', async ({ page }) => {
            await page.goto('/login');

            // Hacer clic en el enlace de registro
            await page.click('[data-testid="register-link"]');

            // Verificar redirección
            await page.waitForURL('/register');
            await expect(page.locator('[data-testid="register-form"]')).toBeVisible();
        });

        test('debería navegar de registro a login', async ({ page }) => {
            await page.goto('/register');

            // Hacer clic en el enlace de login
            await page.click('[data-testid="login-link"]');

            // Verificar redirección
            await page.waitForURL('/login');
            await expect(page.locator('[data-testid="login-form"]')).toBeVisible();
        });
    });
});
