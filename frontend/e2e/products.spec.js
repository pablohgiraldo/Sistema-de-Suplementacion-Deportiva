import { test, expect, testUsers } from './fixtures/auth.js';
import {
    waitForNotification,
    waitForAnimation,
    expectInViewport
} from './fixtures/helpers.js';

test.describe('Flujo de Productos', () => {

    test.describe('Listado de Productos', () => {
        test('debería mostrar la página principal con productos', async ({ page }) => {
            await page.goto('/');

            // Verificar que la página carga
            await expect(page.locator('[data-testid="hero-banner"]')).toBeVisible();

            // Verificar que el grid de productos está presente
            await expect(page.locator('[data-testid="product-grid"]')).toBeVisible();

            // Verificar que hay productos
            const productCards = page.locator('[data-testid="product-card"]');
            await expect(productCards).toHaveCount.greaterThan(0);
        });

        test('debería mostrar información básica de cada producto', async ({ page }) => {
            await page.goto('/');

            // Esperar a que los productos se carguen
            await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });

            const firstProduct = page.locator('[data-testid="product-card"]').first();

            // Verificar elementos básicos
            await expect(firstProduct.locator('[data-testid="product-image"]')).toBeVisible();
            await expect(firstProduct.locator('[data-testid="product-name"]')).toBeVisible();
            await expect(firstProduct.locator('[data-testid="product-price"]')).toBeVisible();
            await expect(firstProduct.locator('[data-testid="product-rating"]')).toBeVisible();
            await expect(firstProduct.locator('[data-testid="add-to-cart-button"]')).toBeVisible();
        });

        test('debería mostrar hover effects en las tarjetas de producto', async ({ page }) => {
            await page.goto('/');

            const productCard = page.locator('[data-testid="product-card"]').first();

            // Hacer hover sobre la tarjeta
            await productCard.hover();

            // Verificar que aparecen efectos visuales
            await expect(productCard).toHaveCSS('transform', /scale\(1\.0[2-5]\)/);
            await expect(productCard).toHaveCSS('box-shadow', /.+/);
        });

        test('debería mostrar wishlist button en hover', async ({ page }) => {
            await page.goto('/');

            const productCard = page.locator('[data-testid="product-card"]').first();
            const wishlistButton = productCard.locator('[data-testid="wishlist-button"]');

            // Verificar que inicialmente no es visible
            await expect(wishlistButton).not.toBeVisible();

            // Hacer hover
            await productCard.hover();

            // Verificar que ahora es visible
            await expect(wishlistButton).toBeVisible();
        });

        test('debería ser responsive en móviles', async ({ page }) => {
            // Configurar viewport móvil
            await page.setViewportSize({ width: 375, height: 667 });

            await page.goto('/');

            // Verificar que el grid se adapta
            const productGrid = page.locator('[data-testid="product-grid"]');
            await expect(productGrid).toBeVisible();

            // Verificar que los productos se muestran en columna única
            const productCards = page.locator('[data-testid="product-card"]');
            await expect(productCards.first()).toBeInViewport();
        });
    });

    test.describe('Detalle de Producto', () => {
        test('debería navegar al detalle del producto', async ({ page }) => {
            await page.goto('/');

            // Esperar a que los productos se carguen
            await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });

            // Hacer clic en el primer producto
            const firstProduct = page.locator('[data-testid="product-card"]').first();
            const productLink = firstProduct.locator('[data-testid="product-link"]');

            await productLink.click();

            // Verificar redirección al detalle
            await page.waitForURL(/\/product\/\w+/, { timeout: 10000 });

            // Verificar elementos del detalle
            await expect(page.locator('[data-testid="product-detail"]')).toBeVisible();
            await expect(page.locator('[data-testid="product-gallery"]')).toBeVisible();
            await expect(page.locator('[data-testid="product-info"]')).toBeVisible();
        });

        test('debería mostrar información completa del producto', async ({ page }) => {
            await page.goto('/');

            // Navegar a un producto
            await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });
            const firstProduct = page.locator('[data-testid="product-card"]').first();
            await firstProduct.locator('[data-testid="product-link"]').click();

            await page.waitForURL(/\/product\/\w+/, { timeout: 10000 });

            // Verificar información básica
            await expect(page.locator('[data-testid="product-title"]')).toBeVisible();
            await expect(page.locator('[data-testid="product-price"]')).toBeVisible();
            await expect(page.locator('[data-testid="product-rating"]')).toBeVisible();
            await expect(page.locator('[data-testid="product-description"]')).toBeVisible();

            // Verificar secciones expandibles
            await expect(page.locator('[data-testid="nutritional-info"]')).toBeVisible();
            await expect(page.locator('[data-testid="ingredients-info"]')).toBeVisible();
            await expect(page.locator('[data-testid="usage-info"]')).toBeVisible();
        });

        test('debería permitir cambiar imagen de la galería', async ({ page }) => {
            await page.goto('/');

            // Navegar a un producto
            await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });
            const firstProduct = page.locator('[data-testid="product-card"]').first();
            await firstProduct.locator('[data-testid="product-link"]').click();

            await page.waitForURL(/\/product\/\w+/, { timeout: 10000 });

            // Verificar galería
            const galleryThumbnails = page.locator('[data-testid="gallery-thumbnail"]');
            await expect(galleryThumbnails).toHaveCount.greaterThan(1);

            // Hacer clic en una miniatura diferente
            const secondThumbnail = galleryThumbnails.nth(1);
            await secondThumbnail.click();

            // Verificar que la imagen principal cambió
            const mainImage = page.locator('[data-testid="main-product-image"]');
            await waitForAnimation(page, '[data-testid="main-product-image"]');
        });

        test('debería permitir expandir secciones de información', async ({ page }) => {
            await page.goto('/');

            // Navegar a un producto
            await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });
            const firstProduct = page.locator('[data-testid="product-card"]').first();
            await firstProduct.locator('[data-testid="product-link"]').click();

            await page.waitForURL(/\/product\/\w+/, { timeout: 10000 });

            // Expandir sección nutricional
            const nutritionalSection = page.locator('[data-testid="nutritional-info"]');
            const nutritionalToggle = nutritionalSection.locator('[data-testid="section-toggle"]');

            await nutritionalToggle.click();

            // Verificar que el contenido se expande
            const nutritionalContent = nutritionalSection.locator('[data-testid="section-content"]');
            await expect(nutritionalContent).toBeVisible();

            // Verificar animación suave
            await waitForAnimation(page, '[data-testid="section-content"]');
        });

        test('debería mostrar sección de productos frecuentemente comprados juntos', async ({ page }) => {
            await page.goto('/');

            // Navegar a un producto
            await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });
            const firstProduct = page.locator('[data-testid="product-card"]').first();
            await firstProduct.locator('[data-testid="product-link"]').click();

            await page.waitForURL(/\/product\/\w+/, { timeout: 10000 });

            // Verificar sección "Frequently bought together"
            await expect(page.locator('[data-testid="frequently-bought-section"]')).toBeVisible();

            // Verificar que hay productos sugeridos
            const suggestedProducts = page.locator('[data-testid="suggested-product"]');
            await expect(suggestedProducts).toHaveCount.greaterThan(0);
        });
    });

    test.describe('Carrito de Compras', () => {
        test('debería agregar producto al carrito desde listado', async ({ authenticatedPage }) => {
            await authenticatedPage.goto('/');

            // Esperar a que los productos se carguen
            await authenticatedPage.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });

            // Hacer clic en "Agregar al carrito"
            const firstProduct = authenticatedPage.locator('[data-testid="product-card"]').first();
            const addToCartButton = firstProduct.locator('[data-testid="add-to-cart-button"]');

            await addToCartButton.click();

            // Verificar notificación de éxito
            await waitForNotification(authenticatedPage, 'success');

            // Verificar que el botón cambió de estado
            await expect(addToCartButton).toHaveText(/Agregado|En el carrito/);
        });

        test('debería agregar producto al carrito desde detalle', async ({ authenticatedPage }) => {
            await authenticatedPage.goto('/');

            // Navegar a un producto
            await authenticatedPage.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });
            const firstProduct = authenticatedPage.locator('[data-testid="product-card"]').first();
            await firstProduct.locator('[data-testid="product-link"]').click();

            await authenticatedPage.waitForURL(/\/product\/\w+/, { timeout: 10000 });

            // Seleccionar cantidad
            const quantitySelector = authenticatedPage.locator('[data-testid="quantity-selector"]');
            await quantitySelector.selectOption('2');

            // Agregar al carrito
            const addToCartButton = authenticatedPage.locator('[data-testid="add-to-cart-button"]');
            await addToCartButton.click();

            // Verificar notificación de éxito
            await waitForNotification(authenticatedPage, 'success');

            // Verificar que el botón cambió de estado
            await expect(addToCartButton).toHaveText(/Agregado|En el carrito/);
        });

        test('debería mostrar estado de producto agotado', async ({ page }) => {
            // Mock de producto sin stock
            await page.route('**/api/inventory**', async route => {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        success: true,
                        data: {
                            availableStock: 0,
                            reservedStock: 0,
                            totalStock: 0
                        }
                    })
                });
            });

            await page.goto('/');

            // Navegar a un producto
            await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });
            const firstProduct = page.locator('[data-testid="product-card"]').first();
            await firstProduct.locator('[data-testid="product-link"]').click();

            await page.waitForURL(/\/product\/\w+/, { timeout: 10000 });

            // Verificar mensaje de agotado
            await expect(page.locator('[data-testid="out-of-stock-message"]')).toBeVisible();

            // Verificar que el botón está deshabilitado
            const addToCartButton = page.locator('[data-testid="add-to-cart-button"]');
            await expect(addToCartButton).toBeDisabled();
        });

        test('debería requerir autenticación para agregar al carrito', async ({ page }) => {
            await page.goto('/');

            // Esperar a que los productos se carguen
            await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });

            // Intentar agregar al carrito sin estar autenticado
            const firstProduct = page.locator('[data-testid="product-card"]').first();
            const addToCartButton = firstProduct.locator('[data-testid="add-to-cart-button"]');

            await addToCartButton.click();

            // Verificar que aparece mensaje de autenticación requerida
            await waitForNotification(page, 'warning');
        });
    });

    test.describe('Wishlist', () => {
        test('debería agregar producto a wishlist', async ({ authenticatedPage }) => {
            await authenticatedPage.goto('/');

            // Hacer hover sobre un producto
            const firstProduct = authenticatedPage.locator('[data-testid="product-card"]').first();
            await firstProduct.hover();

            // Hacer clic en el botón de wishlist
            const wishlistButton = firstProduct.locator('[data-testid="wishlist-button"]');
            await wishlistButton.click();

            // Verificar que el ícono cambió (corazón lleno)
            await expect(wishlistButton.locator('[data-testid="wishlist-icon-filled"]')).toBeVisible();
        });

        test('debería remover producto de wishlist', async ({ authenticatedPage }) => {
            await authenticatedPage.goto('/');

            // Agregar a wishlist primero
            const firstProduct = authenticatedPage.locator('[data-testid="product-card"]').first();
            await firstProduct.hover();

            const wishlistButton = firstProduct.locator('[data-testid="wishlist-button"]');
            await wishlistButton.click();

            // Verificar que está en wishlist
            await expect(wishlistButton.locator('[data-testid="wishlist-icon-filled"]')).toBeVisible();

            // Hacer clic de nuevo para remover
            await wishlistButton.click();

            // Verificar que el ícono cambió (corazón vacío)
            await expect(wishlistButton.locator('[data-testid="wishlist-icon-empty"]')).toBeVisible();
        });
    });
});
