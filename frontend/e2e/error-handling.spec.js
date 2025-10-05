import { test, expect } from './fixtures/auth.js';
import {
    simulateRateLimit,
    simulateNetworkError,
    waitForNotification
} from './fixtures/helpers.js';

test.describe('Manejo de Errores', () => {

    test.describe('Errores de Red', () => {
        test('debería manejar error de conexión en login', async ({ page }) => {
            // Simular error de red
            await simulateNetworkError(page, 'users/login');

            await page.goto('/login');

            // Intentar hacer login
            await page.fill('[data-testid="email-input"]', 'test@example.com');
            await page.fill('[data-testid="password-input"]', 'password123');
            await page.click('[data-testid="login-button"]');

            // Verificar notificación de error de conexión
            await waitForNotification(page, 'error');

            const notification = page.locator('[data-testid="notification-error"]');
            await expect(notification).toContainText('Error de conexión');
        });

        test('debería manejar error de conexión en registro', async ({ page }) => {
            // Simular error de red
            await simulateNetworkError(page, 'users/register');

            await page.goto('/register');

            // Llenar formulario
            await page.fill('[data-testid="name-input"]', 'Usuario Test');
            await page.fill('[data-testid="email-input"]', 'test@example.com');
            await page.fill('[data-testid="password-input"]', 'password123');
            await page.fill('[data-testid="confirm-password-input"]', 'password123');

            await page.click('[data-testid="register-button"]');

            // Verificar notificación de error
            await waitForNotification(page, 'error');

            const notification = page.locator('[data-testid="notification-error"]');
            await expect(notification).toContainText('Error de conexión');
        });

        test('debería manejar error de conexión al cargar productos', async ({ page }) => {
            // Simular error de red
            await simulateNetworkError(page, 'products');

            await page.goto('/');

            // Verificar que se muestra mensaje de error
            await expect(page.locator('[data-testid="error-message"]')).toBeVisible();

            // Verificar que el mensaje es apropiado
            const errorMessage = page.locator('[data-testid="error-message"]');
            await expect(errorMessage).toContainText('Error al cargar productos');
        });

        test('debería permitir reintento después de error de red', async ({ page }) => {
            // Simular error de red inicial
            await simulateNetworkError(page, 'products');

            await page.goto('/');

            // Verificar error inicial
            await expect(page.locator('[data-testid="error-message"]')).toBeVisible();

            // Remover el mock de error
            await page.unroute('**/api/products');

            // Hacer clic en botón de reintento
            const retryButton = page.locator('[data-testid="retry-button"]');
            await retryButton.click();

            // Verificar que los productos se cargan
            await expect(page.locator('[data-testid="product-grid"]')).toBeVisible();
        });
    });

    test.describe('Errores HTTP', () => {
        test('debería manejar error 404 (producto no encontrado)', async ({ page }) => {
            // Mock de producto no encontrado
            await page.route('**/api/products/nonexistent', async route => {
                await route.fulfill({
                    status: 404,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        success: false,
                        message: 'Producto no encontrado'
                    })
                });
            });

            await page.goto('/product/nonexistent');

            // Verificar mensaje de error 404
            await expect(page.locator('[data-testid="error-404"]')).toBeVisible();

            const errorMessage = page.locator('[data-testid="error-404"]');
            await expect(errorMessage).toContainText('Producto no encontrado');

            // Verificar que hay botón para volver
            const backButton = page.locator('[data-testid="back-button"]');
            await expect(backButton).toBeVisible();
        });

        test('debería manejar error 500 (error interno del servidor)', async ({ page }) => {
            // Mock de error 500
            await page.route('**/api/users/login', async route => {
                await route.fulfill({
                    status: 500,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        success: false,
                        message: 'Error interno del servidor'
                    })
                });
            });

            await page.goto('/login');

            // Intentar login
            await page.fill('[data-testid="email-input"]', 'test@example.com');
            await page.fill('[data-testid="password-input"]', 'password123');
            await page.click('[data-testid="login-button"]');

            // Verificar notificación de error
            await waitForNotification(page, 'error');

            const notification = page.locator('[data-testid="notification-error"]');
            await expect(notification).toContainText('Error interno del servidor');
        });

        test('debería manejar error 400 (bad request)', async ({ page }) => {
            // Mock de error 400
            await page.route('**/api/users/register', async route => {
                await route.fulfill({
                    status: 400,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        success: false,
                        message: 'Datos inválidos',
                        details: [
                            { field: 'email', message: 'Email ya registrado' },
                            { field: 'password', message: 'Contraseña muy débil' }
                        ]
                    })
                });
            });

            await page.goto('/register');

            // Llenar formulario
            await page.fill('[data-testid="name-input"]', 'Usuario Test');
            await page.fill('[data-testid="email-input"]', 'existing@test.com');
            await page.fill('[data-testid="password-input"]', '123');
            await page.fill('[data-testid="confirm-password-input"]', '123');

            await page.click('[data-testid="register-button"]');

            // Verificar errores de validación del servidor
            await expect(page.locator('[data-testid="email-error"]')).toBeVisible();
            await expect(page.locator('[data-testid="password-error"]')).toBeVisible();
        });
    });

    test.describe('Rate Limiting (429)', () => {
        test('debería mostrar rate limit handler en login', async ({ page }) => {
            await simulateRateLimit(page);

            await page.goto('/login');

            // Intentar login
            await page.fill('[data-testid="email-input"]', 'test@example.com');
            await page.fill('[data-testid="password-input"]', 'password123');
            await page.click('[data-testid="login-button"]');

            // Verificar rate limit handler
            const rateLimitHandler = page.locator('[data-testid="rate-limit-handler"]');
            await expect(rateLimitHandler).toBeVisible();

            // Verificar mensaje
            await expect(rateLimitHandler).toContainText('Demasiados intentos');

            // Verificar contador
            const countdownTimer = page.locator('[data-testid="countdown-timer"]');
            await expect(countdownTimer).toBeVisible();
        });

        test('debería mostrar rate limit handler en registro', async ({ page }) => {
            // Mock de rate limiting para registro
            await page.route('**/api/users/register', async route => {
                await route.fulfill({
                    status: 429,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        success: false,
                        message: 'Too many requests'
                    }),
                    headers: {
                        'Retry-After': '30'
                    }
                });
            });

            await page.goto('/register');

            // Llenar formulario
            await page.fill('[data-testid="name-input"]', 'Usuario Test');
            await page.fill('[data-testid="email-input"]', 'test@example.com');
            await page.fill('[data-testid="password-input"]', 'password123');
            await page.fill('[data-testid="confirm-password-input"]', 'password123');

            await page.click('[data-testid="register-button"]');

            // Verificar rate limit handler
            const rateLimitHandler = page.locator('[data-testid="rate-limit-handler"]');
            await expect(rateLimitHandler).toBeVisible();
        });

        test('debería permitir reintento después del countdown', async ({ page }) => {
            // Mock de rate limiting con countdown corto
            await page.route('**/api/users/login', async route => {
                await route.fulfill({
                    status: 429,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        success: false,
                        message: 'Too many requests'
                    }),
                    headers: {
                        'Retry-After': '2' // 2 segundos para testing
                    }
                });
            });

            await page.goto('/login');

            // Intentar login
            await page.fill('[data-testid="email-input"]', 'test@example.com');
            await page.fill('[data-testid="password-input"]', 'password123');
            await page.click('[data-testid="login-button"]');

            // Verificar rate limit handler
            const rateLimitHandler = page.locator('[data-testid="rate-limit-handler"]');
            await expect(rateLimitHandler).toBeVisible();

            // Esperar a que termine el countdown
            await page.waitForTimeout(3000);

            // Verificar que aparece botón de reintento
            const retryButton = page.locator('[data-testid="retry-button"]');
            await expect(retryButton).toBeVisible();

            // Verificar que el botón es clickeable
            await expect(retryButton).toBeEnabled();
        });
    });

    test.describe('Timeouts', () => {
        test('debería manejar timeout en requests largos', async ({ page }) => {
            // Mock de request que nunca responde
            await page.route('**/api/users/login', async route => {
                // No responder nunca (simular timeout)
                return;
            });

            await page.goto('/login');

            // Intentar login
            await page.fill('[data-testid="email-input"]', 'test@example.com');
            await page.fill('[data-testid="password-input"]', 'password123');
            await page.click('[data-testid="login-button"]');

            // Esperar timeout (15 segundos según configuración)
            await page.waitForTimeout(16000);

            // Verificar que aparece error de timeout
            await waitForNotification(page, 'error');

            const notification = page.locator('[data-testid="notification-error"]');
            await expect(notification).toContainText('timeout');
        });
    });

    test.describe('Errores de Validación', () => {
        test('debería mostrar errores de validación del cliente', async ({ page }) => {
            await page.goto('/register');

            // Enviar formulario vacío
            await page.click('[data-testid="register-button"]');

            // Verificar errores de validación
            await expect(page.locator('[data-testid="name-error"]')).toBeVisible();
            await expect(page.locator('[data-testid="email-error"]')).toBeVisible();
            await expect(page.locator('[data-testid="password-error"]')).toBeVisible();
            await expect(page.locator('[data-testid="confirm-password-error"]')).toBeVisible();
        });

        test('debería mostrar errores de validación del servidor', async ({ page }) => {
            // Mock de respuesta con errores de validación
            await page.route('**/api/users/register', async route => {
                await route.fulfill({
                    status: 400,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        success: false,
                        message: 'Errores de validación',
                        details: [
                            { field: 'email', message: 'Email ya está registrado' },
                            { field: 'password', message: 'La contraseña debe tener al menos 8 caracteres' }
                        ]
                    })
                });
            });

            await page.goto('/register');

            // Llenar formulario
            await page.fill('[data-testid="name-input"]', 'Usuario Test');
            await page.fill('[data-testid="email-input"]', 'existing@test.com');
            await page.fill('[data-testid="password-input"]', '123');
            await page.fill('[data-testid="confirm-password-input"]', '123');

            await page.click('[data-testid="register-button"]');

            // Verificar que aparecen los errores específicos del servidor
            await expect(page.locator('[data-testid="email-error"]')).toContainText('Email ya está registrado');
            await expect(page.locator('[data-testid="password-error"]')).toContainText('al menos 8 caracteres');
        });
    });

    test.describe('Estados de Error en UI', () => {
        test('debería mostrar estado de error en formularios', async ({ page }) => {
            await page.goto('/login');

            // Credenciales inválidas
            await page.fill('[data-testid="email-input"]', 'invalid@test.com');
            await page.fill('[data-testid="password-input"]', 'wrongpassword');

            await page.click('[data-testid="login-button"]');

            // Verificar estado de error
            await expect(page.locator('[data-testid="form-status-error"]')).toBeVisible();

            // Verificar que el botón vuelve a estar habilitado
            const loginButton = page.locator('[data-testid="login-button"]');
            await expect(loginButton).toBeEnabled();
        });

        test('debería limpiar errores al corregir campos', async ({ page }) => {
            await page.goto('/register');

            // Enviar formulario con errores
            await page.click('[data-testid="register-button"]');

            // Verificar que aparecen errores
            await expect(page.locator('[data-testid="email-error"]')).toBeVisible();

            // Corregir el campo
            await page.fill('[data-testid="email-input"]', 'test@example.com');
            await page.blur('[data-testid="email-input"]');

            // Verificar que el error desaparece
            await expect(page.locator('[data-testid="email-error"]')).not.toBeVisible();
        });

        test('debería mostrar mensaje de error apropiado para cada tipo', async ({ page }) => {
            // Test para diferentes tipos de errores
            const errorTests = [
                {
                    mock: async (page) => {
                        await page.route('**/api/users/login', async route => {
                            await route.fulfill({
                                status: 401,
                                contentType: 'application/json',
                                body: JSON.stringify({
                                    success: false,
                                    message: 'Credenciales inválidas'
                                })
                            });
                        });
                    },
                    expectedMessage: 'Credenciales inválidas'
                },
                {
                    mock: async (page) => {
                        await page.route('**/api/users/login', async route => {
                            await route.fulfill({
                                status: 403,
                                contentType: 'application/json',
                                body: JSON.stringify({
                                    success: false,
                                    message: 'Cuenta suspendida'
                                })
                            });
                        });
                    },
                    expectedMessage: 'Cuenta suspendida'
                }
            ];

            for (const testCase of errorTests) {
                await testCase.mock(page);

                await page.goto('/login');

                // Intentar login
                await page.fill('[data-testid="email-input"]', 'test@example.com');
                await page.fill('[data-testid="password-input"]', 'password123');
                await page.click('[data-testid="login-button"]');

                // Verificar mensaje específico
                await waitForNotification(page, 'error');
                const notification = page.locator('[data-testid="notification-error"]');
                await expect(notification).toContainText(testCase.expectedMessage);

                // Limpiar mock para siguiente test
                await page.unroute('**/api/users/login');
            }
        });
    });
});
