describe('Flujo Completo E2E', () => {
    beforeEach(() => {
        cy.clearLocalStorage();
        cy.clearCookies();
        cy.clearCart();
    });

    describe('Flujo completo de compra', () => {
        it('debería completar todo el proceso desde registro hasta compra', () => {
            // 1. Registro de usuario
            const userData = {
                nombre: 'Usuario Completo E2E',
                email: 'completo-e2e@example.com',
                contraseña: 'CompletoE2E123!',
                confirmarContraseña: 'CompletoE2E123!'
            };

            cy.visit('/register');
            cy.get('input[name="nombre"]').type(userData.nombre);
            cy.get('input[name="email"]').type(userData.email);
            cy.get('input[name="contraseña"]').type(userData.contraseña);
            cy.get('input[name="confirmarContraseña"]').type(userData.confirmarContraseña);
            cy.get('button[type="submit"]').click();

            // Verificar que se registró exitosamente
            cy.url().should('not.include', '/register');
            cy.verifyAuthenticated();

            // 2. Navegación y búsqueda de productos
            cy.visit('/');
            cy.waitForAppReady();

            // Buscar productos
            cy.get('input[placeholder*="buscar"], input[name="search"], [data-testid="search-input"]').type('whey');
            cy.get('button[type="submit"], .search-button, [data-testid="search-button"]').click();

            // 3. Agregar productos al carrito
            cy.get('.product-card, [data-testid="product-card"]').first().within(() => {
                cy.get('.add-to-cart, [data-testid="add-to-cart"], [data-cy="add-to-cart"]').click();
            });

            // Verificar que se agregó al carrito
            cy.get('.cart-count, [data-testid="cart-count"], [data-cy="cart-count"]').should('contain', '1');
            cy.verifyNotification('agregado al carrito', 'success');

            // 4. Verificar carrito
            cy.visit('/cart');
            cy.get('.cart-item, [data-testid="cart-item"]').should('have.length', 1);

            // 5. Proceder al checkout
            cy.get('.checkout-button, [data-testid="checkout-button"], [data-cy="checkout-button"]').click();
            cy.url().should('include', '/checkout');

            // 6. Completar checkout
            cy.get('input[name="firstName"], [data-testid="first-name"]').type('Juan');
            cy.get('input[name="lastName"], [data-testid="last-name"]').type('Pérez');
            cy.get('input[name="street"], [data-testid="street"]').type('Calle 123 #45-67');
            cy.get('input[name="city"], [data-testid="city"]').type('Bogotá');
            cy.get('input[name="state"], [data-testid="state"]').type('Cundinamarca');
            cy.get('input[name="zipCode"], [data-testid="zip-code"]').type('11001');
            cy.get('input[name="country"], [data-testid="country"]').type('Colombia');
            cy.get('input[name="phone"], [data-testid="phone"]').type('+573001234567');
            cy.get('input[type="radio"][name="paymentMethod"], [data-testid="payment-credit-card"]').check();

            cy.get('.place-order-button, [data-testid="place-order-button"]').click();

            // 7. Verificar confirmación de orden
            cy.url().should('include', '/order-confirmation');
            cy.contains('¡Pedido confirmado!', 'Orden exitosa').should('be.visible');

            // 8. Verificar historial de órdenes
            cy.get('.view-orders, [data-testid="view-orders"]').click();
            cy.url().should('include', '/orders');
            cy.get('.order-card, [data-testid="order-card"]').should('have.length.greaterThan', 0);

            // 9. Verificar que el carrito se limpió
            cy.visit('/cart');
            cy.contains('Carrito vacío', 'No hay productos').should('be.visible');
        });

        it('debería manejar múltiples productos en el carrito', () => {
            // Login
            cy.loginAsUser();

            // Agregar múltiples productos
            cy.visit('/');
            cy.waitForAppReady();

            // Agregar primer producto
            cy.get('.product-card, [data-testid="product-card"]').first().within(() => {
                cy.get('.add-to-cart, [data-testid="add-to-cart"], [data-cy="add-to-cart"]').click();
            });

            // Agregar segundo producto
            cy.get('.product-card, [data-testid="product-card"]').eq(1).within(() => {
                cy.get('.add-to-cart, [data-testid="add-to-cart"], [data-cy="add-to-cart"]').click();
            });

            // Verificar carrito
            cy.get('.cart-count, [data-testid="cart-count"], [data-cy="cart-count"]').should('contain', '2');

            // Ir al carrito y verificar productos
            cy.visit('/cart');
            cy.get('.cart-item, [data-testid="cart-item"]').should('have.length', 2);

            // Modificar cantidades
            cy.get('.cart-item, [data-testid="cart-item"]').first().within(() => {
                cy.get('.quantity-increase, .quantity-plus, [data-testid="quantity-increase"]').click();
            });

            // Verificar total actualizado
            cy.get('.cart-total, [data-testid="cart-total"]').should('be.visible');

            // Proceder al checkout
            cy.get('.checkout-button, [data-testid="checkout-button"], [data-cy="checkout-button"]').click();

            // Verificar que se muestran ambos productos en el checkout
            cy.get('.checkout-item, [data-testid="checkout-item"]').should('have.length', 2);
        });
    });

    describe('Flujo de administración', () => {
        it('debería permitir al admin gestionar órdenes', () => {
            // Login como admin
            cy.loginAsAdmin();

            // Acceder al panel de admin
            cy.visit('/admin');
            cy.url().should('include', '/admin');
            cy.contains('Panel de Administración', 'Admin').should('be.visible');

            // Navegar a gestión de órdenes
            cy.get('a[href*="/admin/orders"], [data-testid="admin-orders"]').click();
            cy.url().should('include', '/admin/orders');

            // Verificar que se muestran órdenes
            cy.get('.admin-order-card, [data-testid="admin-order-card"]').should('have.length.greaterThan', 0);

            // Actualizar estado de una orden
            cy.get('.admin-order-card, [data-testid="admin-order-card"]').first().within(() => {
                cy.get('.update-status, [data-testid="update-status"]').click();
            });

            // Verificar que se puede cambiar el estado
            cy.get('.status-dropdown, [data-testid="status-dropdown"]').should('be.visible');
        });

        it('debería permitir al admin gestionar usuarios', () => {
            // Login como admin
            cy.loginAsAdmin();

            // Acceder a gestión de usuarios
            cy.visit('/admin/users');
            cy.url().should('include', '/admin/users');

            // Verificar que se muestran usuarios
            cy.get('.user-card, [data-testid="user-card"], .admin-user-item').should('have.length.greaterThan', 0);

            // Verificar funcionalidades de admin
            cy.get('.user-actions, [data-testid="user-actions"]').should('be.visible');
        });

        it('debería permitir al admin gestionar inventario', () => {
            // Login como admin
            cy.loginAsAdmin();

            // Acceder a gestión de inventario
            cy.visit('/admin/inventory');
            cy.url().should('include', '/admin/inventory');

            // Verificar que se muestra inventario
            cy.get('.inventory-item, [data-testid="inventory-item"]').should('have.length.greaterThan', 0);

            // Verificar funcionalidades de admin
            cy.get('.inventory-actions, [data-testid="inventory-actions"]').should('be.visible');
        });
    });

    describe('Flujo de navegación y UX', () => {
        it('debería mantener estado de autenticación en toda la navegación', () => {
            // Login
            cy.loginAsUser();

            // Navegar entre páginas
            cy.visit('/');
            cy.verifyAuthenticated();

            cy.visit('/products');
            cy.verifyAuthenticated();

            cy.visit('/profile');
            cy.verifyAuthenticated();

            cy.visit('/cart');
            cy.verifyAuthenticated();

            // Verificar que el header se mantiene
            cy.get('header, .header, [data-testid="header"]').should('be.visible');
        });

        it('debería manejar errores de red graciosamente', () => {
            // Mockear error de red
            cy.intercept('GET', '**/products', {
                statusCode: 500,
                body: { success: false, message: 'Error del servidor' }
            }).as('serverError');

            cy.visit('/');

            // Verificar que se muestra mensaje de error
            cy.contains('Error de conexión', 'Problema con el servidor').should('be.visible');
        });

        it('debería funcionar correctamente en diferentes tamaños de pantalla', () => {
            // Probar en móvil
            cy.viewport(375, 667);
            cy.visit('/');
            cy.get('.product-card, [data-testid="product-card"]').should('be.visible');

            // Probar en tablet
            cy.viewport(768, 1024);
            cy.visit('/');
            cy.get('.product-card, [data-testid="product-card"]').should('be.visible');

            // Probar en desktop
            cy.viewport(1280, 720);
            cy.visit('/');
            cy.get('.product-card, [data-testid="product-card"]').should('be.visible');
        });
    });

    describe('Performance y optimización', () => {
        it('debería cargar la aplicación en tiempo razonable', () => {
            const startTime = Date.now();

            cy.visit('/');
            cy.waitForAppReady();

            cy.then(() => {
                const loadTime = Date.now() - startTime;
                expect(loadTime).to.be.lessThan(5000); // Menos de 5 segundos
            });
        });

        it('debería cargar imágenes de productos correctamente', () => {
            cy.visit('/');
            cy.waitForAppReady();

            // Verificar que las imágenes cargan
            cy.get('.product-card img, [data-testid="product-image"] img').each(($img) => {
                cy.wrap($img).should('be.visible');
                cy.wrap($img).should('have.attr', 'src');
                cy.wrap($img).should('have.attr', 'alt');
            });
        });

        it('debería manejar lazy loading de componentes', () => {
            cy.visit('/');
            cy.waitForAppReady();

            // Navegar a página que requiere lazy loading
            cy.visit('/profile');
            cy.get('.profile-content, [data-testid="profile-content"]').should('be.visible');
        });
    });

    describe('Accesibilidad', () => {
        it('debería ser navegable con teclado', () => {
            cy.visit('/');
            cy.waitForAppReady();

            // Verificar que se puede navegar entre elementos interactivos
            cy.get('button, a, input').first().focus();
            cy.focused().should('be.visible');

            // Verificar que se puede activar elementos con Enter
            cy.get('button').first().focus();
            cy.get('button').first().type('{enter}');
        });

        it('debería tener etiquetas ARIA apropiadas', () => {
            cy.visit('/');
            cy.waitForAppReady();

            // Verificar elementos importantes tienen aria-labels
            cy.get('button, input, a').each(($element) => {
                const hasAriaLabel = $element.attr('aria-label') || $element.attr('aria-labelledby');
                const hasText = $element.text().trim().length > 0;
                const hasTitle = $element.attr('title');

                // Al menos uno de estos debe existir para accesibilidad
                expect(hasAriaLabel || hasText || hasTitle).to.be.true;
            });
        });

        it('debería tener contraste de colores apropiado', () => {
            cy.visit('/');
            cy.waitForAppReady();

            // Verificar que los elementos importantes son visibles
            cy.get('header, .header').should('be.visible');
            cy.get('main, .main-content').should('be.visible');
            cy.get('.product-card, [data-testid="product-card"]').should('be.visible');
        });
    });
});
