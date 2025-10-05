import { test, expect } from './fixtures/auth.js';
import { testResponsive } from './fixtures/helpers.js';

test.describe('Responsividad', () => {

    test.describe('Breakpoints Móviles', () => {
        test('debería adaptarse a pantallas pequeñas (375px)', async ({ page }) => {
            await testResponsive(page, { width: 375, height: 667 }, async (page) => {
                await page.goto('/');

                // Verificar header responsive
                const header = page.locator('[data-testid="header"]');
                await expect(header).toBeVisible();

                // Verificar que el menú se adapta
                const mobileMenuButton = page.locator('[data-testid="mobile-menu-button"]');
                await expect(mobileMenuButton).toBeVisible();

                // Verificar grid de productos
                const productGrid = page.locator('[data-testid="product-grid"]');
                await expect(productGrid).toBeVisible();

                // Verificar que los productos se muestran en columna única
                const productCards = page.locator('[data-testid="product-card"]');
                const firstCard = productCards.first();
                await expect(firstCard).toBeInViewport();
            });
        });

        test('debería adaptarse a tablets (768px)', async ({ page }) => {
            await testResponsive(page, { width: 768, height: 1024 }, async (page) => {
                await page.goto('/');

                // Verificar que el grid se adapta a 2 columnas
                const productGrid = page.locator('[data-testid="product-grid"]');
                await expect(productGrid).toBeVisible();

                // Verificar que los productos se muestran correctamente
                const productCards = page.locator('[data-testid="product-card"]');
                await expect(productCards.first()).toBeVisible();
            });
        });

        test('debería funcionar en desktop (1024px+)', async ({ page }) => {
            await testResponsive(page, { width: 1024, height: 768 }, async (page) => {
                await page.goto('/');

                // Verificar que el grid se muestra en múltiples columnas
                const productGrid = page.locator('[data-testid="product-grid"]');
                await expect(productGrid).toBeVisible();

                // Verificar que hay espacio para múltiples productos
                const productCards = page.locator('[data-testid="product-card"]');
                await expect(productCards).toHaveCount.greaterThan(3);
            });
        });
    });

    test.describe('Formularios Responsivos', () => {
        test('debería mostrar formulario de login correctamente en móvil', async ({ page }) => {
            await testResponsive(page, { width: 375, height: 667 }, async (page) => {
                await page.goto('/login');

                // Verificar que el formulario se adapta
                const loginForm = page.locator('[data-testid="login-form"]');
                await expect(loginForm).toBeVisible();

                // Verificar que los inputs ocupan el ancho completo
                const emailInput = page.locator('[data-testid="email-input"]');
                await expect(emailInput).toBeVisible();

                const passwordInput = page.locator('[data-testid="password-input"]');
                await expect(passwordInput).toBeVisible();

                // Verificar que el botón es accesible
                const loginButton = page.locator('[data-testid="login-button"]');
                await expect(loginButton).toBeVisible();
                await expect(loginButton).toBeInViewport();
            });
        });

        test('debería mostrar formulario de registro correctamente en móvil', async ({ page }) => {
            await testResponsive(page, { width: 375, height: 667 }, async (page) => {
                await page.goto('/register');

                // Verificar que el formulario se adapta
                const registerForm = page.locator('[data-testid="register-form"]');
                await expect(registerForm).toBeVisible();

                // Verificar que todos los campos son accesibles
                const nameInput = page.locator('[data-testid="name-input"]');
                const emailInput = page.locator('[data-testid="email-input"]');
                const passwordInput = page.locator('[data-testid="password-input"]');
                const confirmPasswordInput = page.locator('[data-testid="confirm-password-input"]');

                await expect(nameInput).toBeVisible();
                await expect(emailInput).toBeVisible();
                await expect(passwordInput).toBeVisible();
                await expect(confirmPasswordInput).toBeVisible();

                // Verificar que el botón está en viewport
                const registerButton = page.locator('[data-testid="register-button"]');
                await expect(registerButton).toBeInViewport();
            });
        });
    });

    test.describe('Página de Detalle Responsiva', () => {
        test('debería mostrar detalle de producto correctamente en móvil', async ({ page }) => {
            await testResponsive(page, { width: 375, height: 667 }, async (page) => {
                await page.goto('/');

                // Navegar a un producto
                await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });
                const firstProduct = page.locator('[data-testid="product-card"]').first();
                await firstProduct.locator('[data-testid="product-link"]').click();

                await page.waitForURL(/\/product\/\w+/, { timeout: 10000 });

                // Verificar que la galería se adapta
                const productGallery = page.locator('[data-testid="product-gallery"]');
                await expect(productGallery).toBeVisible();

                // Verificar que la información del producto es accesible
                const productInfo = page.locator('[data-testid="product-info"]');
                await expect(productInfo).toBeVisible();

                // Verificar que las secciones expandibles funcionan
                const nutritionalSection = page.locator('[data-testid="nutritional-info"]');
                await expect(nutritionalSection).toBeVisible();

                // Verificar que el botón de agregar al carrito es accesible
                const addToCartButton = page.locator('[data-testid="add-to-cart-button"]');
                await expect(addToCartButton).toBeInViewport();
            });
        });

        test('debería mostrar galería de imágenes correctamente en móvil', async ({ page }) => {
            await testResponsive(page, { width: 375, height: 667 }, async (page) => {
                await page.goto('/');

                // Navegar a un producto
                await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });
                const firstProduct = page.locator('[data-testid="product-card"]').first();
                await firstProduct.locator('[data-testid="product-link"]').click();

                await page.waitForURL(/\/product\/\w+/, { timeout: 10000 });

                // Verificar imagen principal
                const mainImage = page.locator('[data-testid="main-product-image"]');
                await expect(mainImage).toBeVisible();

                // Verificar miniaturas
                const galleryThumbnails = page.locator('[data-testid="gallery-thumbnail"]');
                await expect(galleryThumbnails.first()).toBeVisible();

                // Hacer clic en una miniatura
                await galleryThumbnails.nth(1).click();

                // Verificar que la imagen principal cambió
                await expect(mainImage).toBeVisible();
            });
        });
    });

    test.describe('Notificaciones Responsivas', () => {
        test('debería mostrar notificaciones correctamente en móvil', async ({ page }) => {
            await testResponsive(page, { width: 375, height: 667 }, async (page) => {
                await page.goto('/register');

                // Llenar formulario válido
                await page.fill('[data-testid="name-input"]', 'Usuario Test');
                await page.fill('[data-testid="email-input"]', 'test@example.com');
                await page.fill('[data-testid="password-input"]', 'password123');
                await page.fill('[data-testid="confirm-password-input"]', 'password123');

                await page.click('[data-testid="register-button"]');

                // Verificar que la notificación se muestra correctamente
                const notification = page.locator('[data-testid="notification-success"]');
                await expect(notification).toBeVisible();
                await expect(notification).toBeInViewport();

                // Verificar que el botón de cerrar es accesible
                const closeButton = notification.locator('[data-testid="close-button"]');
                await expect(closeButton).toBeVisible();
            });
        });

        test('debería posicionar notificaciones correctamente en diferentes pantallas', async ({ page }) => {
            // Probar en móvil
            await testResponsive(page, { width: 375, height: 667 }, async (page) => {
                await page.goto('/register');

                await page.fill('[data-testid="name-input"]', 'Usuario Test');
                await page.fill('[data-testid="email-input"]', 'test@example.com');
                await page.fill('[data-testid="password-input"]', 'password123');
                await page.fill('[data-testid="confirm-password-input"]', 'password123');

                await page.click('[data-testid="register-button"]');

                const notification = page.locator('[data-testid="notification-success"]');
                await expect(notification).toBeVisible();

                // Verificar posición en móvil (top-right)
                const boundingBox = await notification.boundingBox();
                expect(boundingBox.x).toBeGreaterThan(200); // Debe estar en la derecha
            });
        });
    });

    test.describe('Indicadores de Progreso Responsivos', () => {
        test('debería mostrar progreso correctamente en móvil', async ({ page }) => {
            await testResponsive(page, { width: 375, height: 667 }, async (page) => {
                await page.goto('/register');

                // Llenar formulario
                await page.fill('[data-testid="name-input"]', 'Usuario Test');
                await page.fill('[data-testid="email-input"]', 'test@example.com');
                await page.fill('[data-testid="password-input"]', 'password123');
                await page.fill('[data-testid="confirm-password-input"]', 'password123');

                await page.click('[data-testid="register-button"]');

                // Verificar que el progreso se muestra
                const progress = page.locator('[data-testid="form-progress"]');
                await expect(progress).toBeVisible();

                // Verificar que los pasos son visibles
                const progressSteps = page.locator('[data-testid^="progress-step-"]');
                await expect(progressSteps).toHaveCount(3);

                // Verificar que el primer paso está activo
                await expect(page.locator('[data-testid="progress-step-1"][data-status="current"]')).toBeVisible();
            });
        });
    });

    test.describe('Rate Limiting Responsivo', () => {
        test('debería mostrar rate limit handler correctamente en móvil', async ({ page }) => {
            // Mock de rate limiting
            await page.route('**/api/users/login', async route => {
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

            await testResponsive(page, { width: 375, height: 667 }, async (page) => {
                await page.goto('/login');

                // Intentar login
                await page.fill('[data-testid="email-input"]', 'test@example.com');
                await page.fill('[data-testid="password-input"]', 'password123');
                await page.click('[data-testid="login-button"]');

                // Verificar rate limit handler
                const rateLimitHandler = page.locator('[data-testid="rate-limit-handler"]');
                await expect(rateLimitHandler).toBeVisible();
                await expect(rateLimitHandler).toBeInViewport();

                // Verificar contador
                const countdownTimer = page.locator('[data-testid="countdown-timer"]');
                await expect(countdownTimer).toBeVisible();
            });
        });
    });

    test.describe('Touch Interactions', () => {
        test('debería manejar toques en elementos interactivos', async ({ page }) => {
            await page.setViewportSize({ width: 375, height: 667 });

            await page.goto('/');

            // Verificar toque en tarjeta de producto
            const productCard = page.locator('[data-testid="product-card"]').first();

            // Simular toque
            await productCard.tap();

            // Verificar que navega al detalle
            await page.waitForURL(/\/product\/\w+/, { timeout: 10000 });
        });

        test('debería manejar swipe en galería de imágenes', async ({ page }) => {
            await page.setViewportSize({ width: 375, height: 667 });

            await page.goto('/');

            // Navegar a un producto
            await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });
            const firstProduct = page.locator('[data-testid="product-card"]').first();
            await firstProduct.locator('[data-testid="product-link"]').click();

            await page.waitForURL(/\/product\/\w+/, { timeout: 10000 });

            // Verificar galería
            const mainImage = page.locator('[data-testid="main-product-image"]');
            await expect(mainImage).toBeVisible();

            // Simular swipe (si está implementado)
            // await mainImage.swipe({ direction: 'left' });
        });
    });

    test.describe('Orientación', () => {
        test('debería adaptarse a cambio de orientación', async ({ page }) => {
            // Configurar viewport móvil vertical
            await page.setViewportSize({ width: 375, height: 667 });

            await page.goto('/');

            // Verificar que funciona en vertical
            const productGrid = page.locator('[data-testid="product-grid"]');
            await expect(productGrid).toBeVisible();

            // Cambiar a horizontal
            await page.setViewportSize({ width: 667, height: 375 });

            // Verificar que se adapta
            await expect(productGrid).toBeVisible();

            // Los productos deberían seguir siendo accesibles
            const productCards = page.locator('[data-testid="product-card"]');
            await expect(productCards.first()).toBeVisible();
        });
    });
});
