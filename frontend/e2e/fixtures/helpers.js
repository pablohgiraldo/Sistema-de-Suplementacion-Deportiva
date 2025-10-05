// Helpers para pruebas E2E
import { expect } from '@playwright/test';

/**
 * Esperar a que una notificación aparezca
 */
export async function waitForNotification(page, type = 'success') {
    const notification = page.locator(`[data-testid="notification-${type}"]`);
    await expect(notification).toBeVisible({ timeout: 5000 });
    return notification;
}

/**
 * Esperar a que una notificación desaparezca
 */
export async function waitForNotificationToDisappear(page, type = 'success') {
    const notification = page.locator(`[data-testid="notification-${type}"]`);
    await expect(notification).not.toBeVisible({ timeout: 10000 });
}

/**
 * Verificar que un formulario tiene errores de validación
 */
export async function expectFormValidationErrors(page, expectedErrors) {
    for (const field of expectedErrors) {
        const errorElement = page.locator(`[data-testid="${field}-error"]`);
        await expect(errorElement).toBeVisible();
    }
}

/**
 * Verificar que un formulario no tiene errores de validación
 */
export async function expectNoFormValidationErrors(page, fields) {
    for (const field of fields) {
        const errorElement = page.locator(`[data-testid="${field}-error"]`);
        await expect(errorElement).not.toBeVisible();
    }
}

/**
 * Simular rate limiting (429 error)
 */
export async function simulateRateLimit(page) {
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
}

/**
 * Simular error de red
 */
export async function simulateNetworkError(page, endpoint) {
    await page.route(`**/api/${endpoint}`, async route => {
        await route.abort('failed');
    });
}

/**
 * Simular respuesta exitosa de API
 */
export async function mockApiResponse(page, endpoint, response) {
    await page.route(`**/api/${endpoint}`, async route => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(response)
        });
    });
}

/**
 * Verificar que un elemento está en viewport
 */
export async function expectInViewport(page, selector) {
    const element = page.locator(selector);
    await expect(element).toBeInViewport();
}

/**
 * Verificar responsividad en diferentes tamaños
 */
export async function testResponsive(page, viewport, callback) {
    await page.setViewportSize(viewport);
    await callback(page);
}

/**
 * Tomar screenshot para debugging
 */
export async function takeDebugScreenshot(page, name) {
    if (process.env.DEBUG_SCREENSHOTS) {
        await page.screenshot({
            path: `debug-screenshots/${name}-${Date.now()}.png`,
            fullPage: true
        });
    }
}

/**
 * Esperar a que una animación termine
 */
export async function waitForAnimation(page, selector) {
    const element = page.locator(selector);
    await element.waitFor({ state: 'visible' });
    // Esperar un poco más para que las animaciones terminen
    await page.waitForTimeout(500);
}

/**
 * Verificar que un elemento tiene los estilos correctos
 */
export async function expectElementStyles(page, selector, expectedStyles) {
    const element = page.locator(selector);

    for (const [property, expectedValue] of Object.entries(expectedStyles)) {
        const actualValue = await element.evaluate((el, prop) => {
            return window.getComputedStyle(el)[prop];
        }, property);

        expect(actualValue).toBe(expectedValue);
    }
}
