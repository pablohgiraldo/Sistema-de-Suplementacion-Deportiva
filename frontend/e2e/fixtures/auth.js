// Fixtures para autenticación en pruebas E2E
import { test as base, expect } from '@playwright/test';

// Datos de prueba para usuarios
export const testUsers = {
    validUser: {
        email: 'test@supergains.com',
        password: 'password123',
        name: 'Usuario de Prueba'
    },
    invalidUser: {
        email: 'invalid@test.com',
        password: 'wrongpassword'
    },
    newUser: {
        name: 'Nuevo Usuario',
        email: 'newuser@test.com',
        password: 'newpassword123',
        confirmPassword: 'newpassword123'
    }
};

// Fixture para usuario autenticado
export const test = base.extend({
    authenticatedPage: async ({ page }, use) => {
        // Ir a la página de login
        await page.goto('/login');

        // Llenar el formulario de login usando los selectores correctos
        await page.fill('input[name="email"]', testUsers.validUser.email);
        await page.fill('input[name="contraseña"]', testUsers.validUser.password);

        // Hacer clic en el botón de login
        await page.click('button[type="submit"]');

        // Esperar a que se complete el login (redirección o cambio de estado)
        await page.waitForURL('/', { timeout: 10000 });

        // Verificar que el usuario está autenticado (buscar elementos que indiquen login exitoso)
        await expect(page.locator('text=Usuario de Prueba')).toBeVisible();

        await use(page);
    },

    // Fixture para página con datos de productos cargados
    pageWithProducts: async ({ page }, use) => {
        await page.goto('/');

        // Esperar a que los productos se carguen
        await page.waitForSelector('[data-testid="product-grid"]', { timeout: 10000 });
        await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });

        await use(page);
    }
});

export { expect };
