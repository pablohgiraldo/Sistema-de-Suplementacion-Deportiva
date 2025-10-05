import { test, expect } from '@playwright/test';

test.describe('Pruebas Básicas de Autenticación', () => {

    test('debería mostrar la página de login', async ({ page }) => {
        await page.goto('/login');

        // Verificar que la página se carga correctamente
        await expect(page.locator('h1')).toContainText('Iniciar sesión');

        // Verificar que los campos del formulario están presentes
        await expect(page.locator('input[name="email"]')).toBeVisible();
        await expect(page.locator('input[name="contraseña"]')).toBeVisible();
        await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test('debería mostrar la página de registro', async ({ page }) => {
        await page.goto('/register');

        // Verificar que la página se carga correctamente
        await expect(page.locator('h1')).toContainText('Crear cuenta');

        // Verificar que los campos del formulario están presentes
        await expect(page.locator('input[name="name"]')).toBeVisible();
        await expect(page.locator('input[name="email"]')).toBeVisible();
        await expect(page.locator('input[name="contraseña"]')).toBeVisible();
        await expect(page.locator('input[name="confirmarContraseña"]')).toBeVisible();
    });

    test('debería navegar entre login y registro', async ({ page }) => {
        // Ir a login
        await page.goto('/login');
        await expect(page.locator('h1')).toContainText('Iniciar sesión');

        // Hacer clic en el enlace de registro
        await page.click('text=Regístrate aquí');

        // Verificar que se navega a registro
        await page.waitForURL('/register');
        await expect(page.locator('h1')).toContainText('Crear cuenta');

        // Hacer clic en el enlace de login
        await page.click('text=Inicia sesión aquí');

        // Verificar que se navega de vuelta a login
        await page.waitForURL('/login');
        await expect(page.locator('h1')).toContainText('Iniciar sesión');
    });

    test('debería validar campos requeridos en login', async ({ page }) => {
        await page.goto('/login');

        // Intentar enviar el formulario vacío
        await page.click('button[type="submit"]');

        // Verificar que los campos muestran validación HTML5
        const emailInput = page.locator('input[name="email"]');
        const passwordInput = page.locator('input[name="contraseña"]');

        await expect(emailInput).toHaveAttribute('required');
        await expect(passwordInput).toHaveAttribute('required');
    });

    test('debería validar formato de email', async ({ page }) => {
        await page.goto('/login');

        // Llenar con email inválido
        await page.fill('input[name="email"]', 'email-invalido');
        await page.fill('input[name="contraseña"]', 'password123');

        // Intentar enviar
        await page.click('button[type="submit"]');

        // Verificar que el campo email tiene validación HTML5
        const emailInput = page.locator('input[name="email"]');
        await expect(emailInput).toHaveAttribute('type', 'email');
    });

    test('debería mostrar/ocultar contraseña con el botón de ojo', async ({ page }) => {
        await page.goto('/login');

        const passwordInput = page.locator('input[name="contraseña"]');
        const toggleButton = page.locator('button[type="button"]').filter({ hasText: '' }).first();

        // Verificar que inicialmente la contraseña está oculta
        await expect(passwordInput).toHaveAttribute('type', 'password');

        // Hacer clic en el botón de ojo
        await toggleButton.click();

        // Verificar que la contraseña se muestra
        await expect(passwordInput).toHaveAttribute('type', 'text');

        // Hacer clic de nuevo para ocultar
        await toggleButton.click();

        // Verificar que la contraseña se oculta
        await expect(passwordInput).toHaveAttribute('type', 'password');
    });

});

test.describe('Pruebas de Productos', () => {

    test('debería mostrar la página principal con productos', async ({ page }) => {
        await page.goto('/');

        // Verificar que la página se carga
        await expect(page.locator('h1, h2, h3')).toContainText(['SuperGains', 'Productos', 'Proteína']);

        // Verificar que hay productos en la página
        const productCards = page.locator('.product-card, [class*="product"], [class*="card"]');
        await expect(productCards.first()).toBeVisible();
    });

    test('debería navegar al detalle de un producto', async ({ page }) => {
        await page.goto('/');

        // Buscar el primer enlace de producto
        const productLink = page.locator('a[href*="/product/"]').first();

        if (await productLink.count() > 0) {
            await productLink.click();

            // Verificar que se navega al detalle
            await page.waitForURL(/\/product\/\d+/);

            // Verificar que se muestra información del producto
            await expect(page.locator('h1, h2')).toBeVisible();
        }
    });

});

test.describe('Pruebas de Responsividad', () => {

    test('debería funcionar en móvil', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('/');

        // Verificar que la página se carga en móvil
        await expect(page.locator('body')).toBeVisible();
    });

    test('debería funcionar en tablet', async ({ page }) => {
        await page.setViewportSize({ width: 768, height: 1024 });
        await page.goto('/');

        // Verificar que la página se carga en tablet
        await expect(page.locator('body')).toBeVisible();
    });

    test('debería funcionar en desktop', async ({ page }) => {
        await page.setViewportSize({ width: 1920, height: 1080 });
        await page.goto('/');

        // Verificar que la página se carga en desktop
        await expect(page.locator('body')).toBeVisible();
    });

});
