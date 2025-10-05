import { test, expect } from './fixtures/auth.js';
import {
    waitForNotification,
    expectFormValidationErrors,
    expectNoFormValidationErrors,
    waitForAnimation,
    takeDebugScreenshot
} from './fixtures/helpers.js';

test.describe('Validación de Formularios y Feedback Visual', () => {

    test.describe('Validación en Tiempo Real', () => {
        test('debería validar campos de login en tiempo real', async ({ page }) => {
            await page.goto('/login');

            // Email inválido
            await page.fill('[data-testid="email-input"]', 'email-invalido');
            await page.blur('[data-testid="email-input"]');

            // Verificar que aparece error inmediatamente
            await expect(page.locator('[data-testid="email-error"]')).toBeVisible();

            // Corregir email
            await page.fill('[data-testid="email-input"]', 'test@example.com');
            await page.blur('[data-testid="email-input"]');

            // Verificar que el error desaparece
            await expect(page.locator('[data-testid="email-error"]')).not.toBeVisible();
        });

        test('debería validar campos de registro en tiempo real', async ({ page }) => {
            await page.goto('/register');

            // Contraseña muy corta
            await page.fill('[data-testid="password-input"]', '123');
            await page.blur('[data-testid="password-input"]');

            // Verificar error de longitud
            await expect(page.locator('[data-testid="password-error"]')).toBeVisible();

            // Corregir contraseña
            await page.fill('[data-testid="password-input"]', 'password123');
            await page.blur('[data-testid="password-input"]');

            // Verificar que el error desaparece
            await expect(page.locator('[data-testid="password-error"]')).not.toBeVisible();
        });

        test('debería validar coincidencia de contraseñas', async ({ page }) => {
            await page.goto('/register');

            // Llenar contraseñas diferentes
            await page.fill('[data-testid="password-input"]', 'password123');
            await page.fill('[data-testid="confirm-password-input"]', 'differentpassword');
            await page.blur('[data-testid="confirm-password-input"]');

            // Verificar error de coincidencia
            await expect(page.locator('[data-testid="confirm-password-error"]')).toBeVisible();

            // Corregir confirmación
            await page.fill('[data-testid="confirm-password-input"]', 'password123');
            await page.blur('[data-testid="confirm-password-input"]');

            // Verificar que el error desaparece
            await expect(page.locator('[data-testid="confirm-password-error"]')).not.toBeVisible();
        });
    });

    test.describe('Notificaciones Toast', () => {
        test('debería mostrar notificación de éxito', async ({ page }) => {
            await page.goto('/register');

            // Llenar formulario válido
            await page.fill('[data-testid="name-input"]', 'Usuario Test');
            await page.fill('[data-testid="email-input"]', 'test@example.com');
            await page.fill('[data-testid="password-input"]', 'password123');
            await page.fill('[data-testid="confirm-password-input"]', 'password123');

            await page.click('[data-testid="register-button"]');

            // Verificar notificación de éxito
            await waitForNotification(page, 'success');

            // Verificar que la notificación tiene el ícono correcto
            const notification = page.locator('[data-testid="notification-success"]');
            await expect(notification.locator('[data-testid="success-icon"]')).toBeVisible();
        });

        test('debería mostrar notificación de error', async ({ page }) => {
            await page.goto('/login');

            // Credenciales inválidas
            await page.fill('[data-testid="email-input"]', 'invalid@test.com');
            await page.fill('[data-testid="password-input"]', 'wrongpassword');

            await page.click('[data-testid="login-button"]');

            // Verificar notificación de error
            await waitForNotification(page, 'error');

            // Verificar que la notificación tiene el ícono correcto
            const notification = page.locator('[data-testid="notification-error"]');
            await expect(notification.locator('[data-testid="error-icon"]')).toBeVisible();
        });

        test('debería cerrar notificación manualmente', async ({ page }) => {
            await page.goto('/register');

            // Llenar formulario válido
            await page.fill('[data-testid="name-input"]', 'Usuario Test');
            await page.fill('[data-testid="email-input"]', 'test@example.com');
            await page.fill('[data-testid="password-input"]', 'password123');
            await page.fill('[data-testid="confirm-password-input"]', 'password123');

            await page.click('[data-testid="register-button"]');

            // Esperar notificación
            await waitForNotification(page, 'success');

            // Hacer clic en botón de cerrar
            const notification = page.locator('[data-testid="notification-success"]');
            const closeButton = notification.locator('[data-testid="close-button"]');
            await closeButton.click();

            // Verificar que la notificación desaparece
            await expect(notification).not.toBeVisible();
        });

        test('debería auto-cerrar notificaciones después del tiempo configurado', async ({ page }) => {
            await page.goto('/register');

            // Llenar formulario válido
            await page.fill('[data-testid="name-input"]', 'Usuario Test');
            await page.fill('[data-testid="email-input"]', 'test@example.com');
            await page.fill('[data-testid="password-input"]', 'password123');
            await page.fill('[data-testid="confirm-password-input"]', 'password123');

            await page.click('[data-testid="register-button"]');

            // Esperar notificación
            await waitForNotification(page, 'success');

            // Esperar a que se auto-cierre (timeout configurado)
            const notification = page.locator('[data-testid="notification-success"]');
            await expect(notification).not.toBeVisible({ timeout: 8000 });
        });
    });

    test.describe('Estados de Formulario', () => {
        test('debería mostrar estado de loading durante envío', async ({ page }) => {
            await page.goto('/login');

            // Llenar formulario
            await page.fill('[data-testid="email-input"]', 'test@example.com');
            await page.fill('[data-testid="password-input"]', 'password123');

            // Hacer clic en login
            await page.click('[data-testid="login-button"]');

            // Verificar estado de loading
            await expect(page.locator('[data-testid="form-status-loading"]')).toBeVisible();

            // Verificar que el botón está deshabilitado
            const loginButton = page.locator('[data-testid="login-button"]');
            await expect(loginButton).toBeDisabled();
        });

        test('debería mostrar estado de éxito después del envío', async ({ page }) => {
            // Mock de respuesta exitosa
            await page.route('**/api/users/register', async route => {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        success: true,
                        data: { user: { id: 1, email: 'test@example.com' } }
                    })
                });
            });

            await page.goto('/register');

            // Llenar formulario
            await page.fill('[data-testid="name-input"]', 'Usuario Test');
            await page.fill('[data-testid="email-input"]', 'test@example.com');
            await page.fill('[data-testid="password-input"]', 'password123');
            await page.fill('[data-testid="confirm-password-input"]', 'password123');

            await page.click('[data-testid="register-button"]');

            // Verificar estado de éxito
            await expect(page.locator('[data-testid="form-status-success"]')).toBeVisible();
        });

        test('debería mostrar estado de error después de fallo', async ({ page }) => {
            // Mock de respuesta de error
            await page.route('**/api/users/login', async route => {
                await route.fulfill({
                    status: 400,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        success: false,
                        message: 'Credenciales inválidas'
                    })
                });
            });

            await page.goto('/login');

            // Llenar formulario
            await page.fill('[data-testid="email-input"]', 'test@example.com');
            await page.fill('[data-testid="password-input"]', 'wrongpassword');

            await page.click('[data-testid="login-button"]');

            // Verificar estado de error
            await expect(page.locator('[data-testid="form-status-error"]')).toBeVisible();
        });
    });

    test.describe('Indicador de Progreso', () => {
        test('debería mostrar progreso durante registro', async ({ page }) => {
            // Mock de respuesta lenta
            await page.route('**/api/users/register', async route => {
                await new Promise(resolve => setTimeout(resolve, 2000));
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        success: true,
                        data: { user: { id: 1, email: 'test@example.com' } }
                    })
                });
            });

            await page.goto('/register');

            // Llenar formulario
            await page.fill('[data-testid="name-input"]', 'Usuario Test');
            await page.fill('[data-testid="email-input"]', 'test@example.com');
            await page.fill('[data-testid="password-input"]', 'password123');
            await page.fill('[data-testid="confirm-password-input"]', 'password123');

            await page.click('[data-testid="register-button"]');

            // Verificar que aparece el progreso
            await expect(page.locator('[data-testid="form-progress"]')).toBeVisible();

            // Verificar pasos del progreso
            await expect(page.locator('[data-testid="progress-step-1"]')).toBeVisible();
            await expect(page.locator('[data-testid="progress-step-2"]')).toBeVisible();
            await expect(page.locator('[data-testid="progress-step-3"]')).toBeVisible();
        });

        test('debería actualizar progreso paso a paso', async ({ page }) => {
            // Mock de respuesta con delay
            await page.route('**/api/users/register', async route => {
                await new Promise(resolve => setTimeout(resolve, 1000));
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        success: true,
                        data: { user: { id: 1, email: 'test@example.com' } }
                    })
                });
            });

            await page.goto('/register');

            // Llenar formulario
            await page.fill('[data-testid="name-input"]', 'Usuario Test');
            await page.fill('[data-testid="email-input"]', 'test@example.com');
            await page.fill('[data-testid="password-input"]', 'password123');
            await page.fill('[data-testid="confirm-password-input"]', 'password123');

            await page.click('[data-testid="register-button"]');

            // Verificar progreso inicial
            await expect(page.locator('[data-testid="progress-step-1"][data-status="current"]')).toBeVisible();

            // Esperar y verificar progreso
            await page.waitForTimeout(500);
            await expect(page.locator('[data-testid="progress-step-1"][data-status="completed"]')).toBeVisible();
            await expect(page.locator('[data-testid="progress-step-2"][data-status="current"]')).toBeVisible();
        });
    });

    test.describe('Consistencia Visual', () => {
        test('debería usar colores consistentes en notificaciones', async ({ page }) => {
            await page.goto('/register');

            // Llenar formulario válido
            await page.fill('[data-testid="name-input"]', 'Usuario Test');
            await page.fill('[data-testid="email-input"]', 'test@example.com');
            await page.fill('[data-testid="password-input"]', 'password123');
            await page.fill('[data-testid="confirm-password-input"]', 'password123');

            await page.click('[data-testid="register-button"]');

            // Verificar colores de notificación de éxito
            const successNotification = page.locator('[data-testid="notification-success"]');
            await expect(successNotification).toHaveCSS('background-color', 'rgb(240, 253, 244)'); // Green-50
            await expect(successNotification).toHaveCSS('border-color', 'rgb(187, 247, 208)'); // Green-200
        });

        test('debería usar colores consistentes en estados de error', async ({ page }) => {
            await page.goto('/login');

            // Credenciales inválidas
            await page.fill('[data-testid="email-input"]', 'invalid@test.com');
            await page.fill('[data-testid="password-input"]', 'wrongpassword');

            await page.click('[data-testid="login-button"]');

            // Verificar colores de notificación de error
            const errorNotification = page.locator('[data-testid="notification-error"]');
            await expect(errorNotification).toHaveCSS('background-color', 'rgb(254, 242, 242)'); // Red-50
            await expect(errorNotification).toHaveCSS('border-color', 'rgb(254, 202, 202)'); // Red-200
        });

        test('debería usar colores consistentes en progreso', async ({ page }) => {
            await page.goto('/register');

            // Llenar formulario
            await page.fill('[data-testid="name-input"]', 'Usuario Test');
            await page.fill('[data-testid="email-input"]', 'test@example.com');
            await page.fill('[data-testid="password-input"]', 'password123');
            await page.fill('[data-testid="confirm-password-input"]', 'password123');

            await page.click('[data-testid="register-button"]');

            // Verificar colores de progreso
            const progressStep = page.locator('[data-testid="progress-step-1"]');
            await expect(progressStep).toHaveCSS('background-color', 'rgb(59, 130, 246)'); // Blue-500
            await expect(progressStep).toHaveCSS('color', 'rgb(255, 255, 255)'); // White
        });
    });

    test.describe('Animaciones y Transiciones', () => {
        test('debería tener animaciones suaves en notificaciones', async ({ page }) => {
            await page.goto('/register');

            // Llenar formulario válido
            await page.fill('[data-testid="name-input"]', 'Usuario Test');
            await page.fill('[data-testid="email-input"]', 'test@example.com');
            await page.fill('[data-testid="password-input"]', 'password123');
            await page.fill('[data-testid="confirm-password-input"]', 'password123');

            await page.click('[data-testid="register-button"]');

            // Verificar que la notificación aparece con animación
            const notification = page.locator('[data-testid="notification-success"]');
            await expect(notification).toBeVisible();

            // Verificar que tiene transiciones CSS
            await expect(notification).toHaveCSS('transition', /all/);
        });

        test('debería tener animaciones suaves en secciones expandibles', async ({ page }) => {
            await page.goto('/');

            // Navegar a un producto
            await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });
            const firstProduct = page.locator('[data-testid="product-card"]').first();
            await firstProduct.locator('[data-testid="product-link"]').click();

            await page.waitForURL(/\/product\/\w+/, { timeout: 10000 });

            // Expandir sección
            const nutritionalSection = page.locator('[data-testid="nutritional-info"]');
            const nutritionalToggle = nutritionalSection.locator('[data-testid="section-toggle"]');

            await nutritionalToggle.click();

            // Verificar que el contenido se expande con animación
            const nutritionalContent = nutritionalSection.locator('[data-testid="section-content"]');
            await expect(nutritionalContent).toBeVisible();
            await waitForAnimation(page, '[data-testid="section-content"]');
        });
    });
});
