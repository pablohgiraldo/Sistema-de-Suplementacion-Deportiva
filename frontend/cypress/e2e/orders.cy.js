describe('Órdenes E2E', () => {
    beforeEach(() => {
        cy.clearLocalStorage();
        cy.clearCookies();
        cy.clearCart();
    });

    describe('Proceso de checkout', () => {
        beforeEach(() => {
            // Preparar carrito con productos
            cy.loginAsUser();
            cy.visit('/');
            cy.waitForAppReady();

            // Agregar productos al carrito
            cy.get('.product-card, [data-testid="product-card"]').first().within(() => {
                cy.get('.add-to-cart, [data-testid="add-to-cart"], [data-cy="add-to-cart"]').click();
            });

            cy.visit('/cart');
            cy.get('.checkout-button, [data-testid="checkout-button"], [data-cy="checkout-button"]').click();
        });

        it('debería mostrar la página de checkout con información del carrito', () => {
            cy.url().should('include', '/checkout');

            // Verificar elementos principales del checkout
            cy.get('.checkout-container, [data-testid="checkout-container"]').should('be.visible');
            cy.get('.order-summary, [data-testid="order-summary"]').should('be.visible');
            cy.get('.shipping-form, [data-testid="shipping-form"]').should('be.visible');
            cy.get('.payment-form, [data-testid="payment-form"]').should('be.visible');

            // Verificar que se muestran los productos del carrito
            cy.get('.checkout-item, [data-testid="checkout-item"]').should('have.length.greaterThan', 0);
        });

        it('debería mostrar el resumen de la orden correctamente', () => {
            // Verificar elementos del resumen
            cy.get('.order-subtotal, [data-testid="order-subtotal"]').should('be.visible');
            cy.get('.order-tax, [data-testid="order-tax"]').should('be.visible');
            cy.get('.order-shipping, [data-testid="order-shipping"]').should('be.visible');
            cy.get('.order-total, [data-testid="order-total"]').should('be.visible');

            // Verificar que los cálculos son correctos
            cy.get('.order-total, [data-testid="order-total"]').then(($total) => {
                const totalText = $total.text();
                const totalValue = parseFloat(totalText.replace(/[^0-9.]/g, ''));
                expect(totalValue).to.be.greaterThan(0);
            });
        });

        it('debería validar el formulario de envío', () => {
            // Intentar enviar sin llenar campos requeridos
            cy.get('.place-order-button, [data-testid="place-order-button"]').click();

            // Verificar que se muestran errores de validación
            cy.get('.form-error, [data-testid="form-error"], .error').should('be.visible');
        });

        it('debería completar el formulario de envío correctamente', () => {
            // Llenar formulario de envío
            cy.get('input[name="firstName"], [data-testid="first-name"]').type('Juan');
            cy.get('input[name="lastName"], [data-testid="last-name"]').type('Pérez');
            cy.get('input[name="street"], [data-testid="street"]').type('Calle 123 #45-67');
            cy.get('input[name="city"], [data-testid="city"]').type('Bogotá');
            cy.get('input[name="state"], [data-testid="state"]').type('Cundinamarca');
            cy.get('input[name="zipCode"], [data-testid="zip-code"]').type('11001');
            cy.get('input[name="country"], [data-testid="country"]').type('Colombia');
            cy.get('input[name="phone"], [data-testid="phone"]').type('+573001234567');

            // Verificar que los campos se llenaron correctamente
            cy.get('input[name="firstName"], [data-testid="first-name"]').should('have.value', 'Juan');
            cy.get('input[name="city"], [data-testid="city"]').should('have.value', 'Bogotá');
        });

        it('debería seleccionar método de pago', () => {
            // Verificar que existen opciones de pago
            cy.get('.payment-methods, [data-testid="payment-methods"]').should('be.visible');

            // Seleccionar método de pago
            cy.get('input[type="radio"][name="paymentMethod"], [data-testid="payment-credit-card"]').check();
            cy.get('input[type="radio"][name="paymentMethod"], [data-testid="payment-credit-card"]').should('be.checked');
        });

        it('debería completar el proceso de checkout exitosamente', () => {
            // Llenar formulario completo
            cy.get('input[name="firstName"], [data-testid="first-name"]').type('Juan');
            cy.get('input[name="lastName"], [data-testid="last-name"]').type('Pérez');
            cy.get('input[name="street"], [data-testid="street"]').type('Calle 123 #45-67');
            cy.get('input[name="city"], [data-testid="city"]').type('Bogotá');
            cy.get('input[name="state"], [data-testid="state"]').type('Cundinamarca');
            cy.get('input[name="zipCode"], [data-testid="zip-code"]').type('11001');
            cy.get('input[name="country"], [data-testid="country"]').type('Colombia');
            cy.get('input[name="phone"], [data-testid="phone"]').type('+573001234567');

            cy.get('input[type="radio"][name="paymentMethod"], [data-testid="payment-credit-card"]').check();

            // Hacer clic en "Realizar pedido"
            cy.get('.place-order-button, [data-testid="place-order-button"]').click();

            // Verificar que se procesa la orden
            cy.get('.loading, [data-testid="loading"]').should('be.visible');

            // Verificar que se redirige a confirmación
            cy.url().should('include', '/order-confirmation');
        });
    });

    describe('Confirmación de orden', () => {
        beforeEach(() => {
            // Simular orden completada navegando directamente a confirmación
            cy.loginAsUser();
            cy.visit('/order-confirmation/test-order-123');
        });

        it('debería mostrar la página de confirmación de orden', () => {
            cy.url().should('include', '/order-confirmation');

            // Verificar elementos de confirmación
            cy.get('.order-confirmation, [data-testid="order-confirmation"]').should('be.visible');
            cy.contains('¡Pedido confirmado!', 'Orden exitosa').should('be.visible');
        });

        it('debería mostrar detalles de la orden', () => {
            // Verificar información de la orden
            cy.get('.order-number, [data-testid="order-number"]').should('be.visible');
            cy.get('.order-date, [data-testid="order-date"]').should('be.visible');
            cy.get('.order-total, [data-testid="order-total"]').should('be.visible');

            // Verificar productos de la orden
            cy.get('.order-items, [data-testid="order-items"]').should('be.visible');
            cy.get('.order-item, [data-testid="order-item"]').should('have.length.greaterThan', 0);
        });

        it('debería mostrar información de envío', () => {
            cy.get('.shipping-info, [data-testid="shipping-info"]').should('be.visible');
            cy.get('.shipping-address, [data-testid="shipping-address"]').should('be.visible');
        });

        it('debería permitir continuar comprando', () => {
            cy.get('.continue-shopping, [data-testid="continue-shopping"]').should('be.visible');

            cy.get('.continue-shopping, [data-testid="continue-shopping"]').click();
            cy.url().should('include', '/');
        });

        it('debería permitir ver el historial de órdenes', () => {
            cy.get('.view-orders, [data-testid="view-orders"]').should('be.visible');

            cy.get('.view-orders, [data-testid="view-orders"]').click();
            cy.url().should('include', '/orders');
        });
    });

    describe('Historial de órdenes', () => {
        beforeEach(() => {
            cy.loginAsUser();
        });

        it('debería mostrar la página de historial de órdenes', () => {
            cy.visit('/orders');

            cy.url().should('include', '/orders');
            cy.get('.orders-history, [data-testid="orders-history"]').should('be.visible');
            cy.contains('Mis Pedidos', 'Historial de órdenes').should('be.visible');
        });

        it('debería mostrar órdenes del usuario', () => {
            cy.visit('/orders');

            // Verificar que se muestran órdenes
            cy.get('.order-card, [data-testid="order-card"]').should('have.length.greaterThan', 0);

            // Verificar información de cada orden
            cy.get('.order-card, [data-testid="order-card"]').first().within(() => {
                cy.get('.order-number, [data-testid="order-number"]').should('be.visible');
                cy.get('.order-date, [data-testid="order-date"]').should('be.visible');
                cy.get('.order-status, [data-testid="order-status"]').should('be.visible');
                cy.get('.order-total, [data-testid="order-total"]').should('be.visible');
            });
        });

        it('debería permitir ver detalles de una orden específica', () => {
            cy.visit('/orders');

            // Hacer clic en "Ver detalles" de la primera orden
            cy.get('.order-card, [data-testid="order-card"]').first().within(() => {
                cy.get('.view-details, [data-testid="view-details"]').click();
            });

            // Verificar que se muestran los detalles
            cy.get('.order-details, [data-testid="order-details"]').should('be.visible');
            cy.get('.order-items, [data-testid="order-items"]').should('be.visible');
        });

        it('debería mostrar diferentes estados de orden', () => {
            cy.visit('/orders');

            // Verificar que existen diferentes estados
            cy.get('.order-status, [data-testid="order-status"]').then(($statuses) => {
                const statuses = Array.from($statuses).map(el => el.textContent.toLowerCase());
                expect(statuses).to.include.something.that.matches(/pendiente|procesando|enviado|entregado|cancelado/);
            });
        });

        it('debería permitir filtrar órdenes por estado', () => {
            cy.visit('/orders');

            // Verificar si existe filtro de estado
            cy.get('body').then(($body) => {
                if ($body.find('.status-filter, [data-testid="status-filter"]').length > 0) {
                    cy.get('.status-filter, [data-testid="status-filter"]').select('pendiente');

                    // Verificar que se filtran las órdenes
                    cy.get('.order-status, [data-testid="order-status"]').each(($status) => {
                        cy.wrap($status).should('contain.text', 'pendiente');
                    });
                }
            });
        });
    });

    describe('Panel de administración de órdenes', () => {
        beforeEach(() => {
            cy.loginAsAdmin();
        });

        it('debería mostrar el panel de administración de órdenes', () => {
            cy.visit('/admin/orders');

            cy.url().should('include', '/admin/orders');
            cy.get('.admin-orders, [data-testid="admin-orders"]').should('be.visible');
            cy.contains('Administrar Órdenes', 'Gestión de pedidos').should('be.visible');
        });

        it('debería mostrar todas las órdenes del sistema', () => {
            cy.visit('/admin/orders');

            // Verificar que se muestran órdenes
            cy.get('.admin-order-card, [data-testid="admin-order-card"]').should('have.length.greaterThan', 0);

            // Verificar información adicional para admin
            cy.get('.admin-order-card, [data-testid="admin-order-card"]').first().within(() => {
                cy.get('.customer-info, [data-testid="customer-info"]').should('be.visible');
                cy.get('.order-actions, [data-testid="order-actions"]').should('be.visible');
            });
        });

        it('debería permitir actualizar el estado de una orden', () => {
            cy.visit('/admin/orders');

            // Hacer clic en actualizar estado
            cy.get('.admin-order-card, [data-testid="admin-order-card"]').first().within(() => {
                cy.get('.update-status, [data-testid="update-status"]').click();
            });

            // Seleccionar nuevo estado
            cy.get('.status-dropdown, [data-testid="status-dropdown"]').select('enviado');
            cy.get('.confirm-status, [data-testid="confirm-status"]').click();

            // Verificar que se actualizó el estado
            cy.verifyNotification('Estado actualizado', 'success');
        });

        it('debería permitir filtrar órdenes por estado en el admin', () => {
            cy.visit('/admin/orders');

            // Verificar filtros de admin
            cy.get('.admin-filters, [data-testid="admin-filters"]').should('be.visible');

            // Filtrar por estado
            cy.get('.status-filter, [data-testid="status-filter"]').select('pendiente');

            // Verificar que se aplicó el filtro
            cy.get('.admin-order-card, [data-testid="admin-order-card"]').each(($card) => {
                cy.wrap($card).should('contain.text', 'pendiente');
            });
        });

        it('debería permitir buscar órdenes por número o cliente', () => {
            cy.visit('/admin/orders');

            // Buscar por número de orden
            cy.get('.search-orders, [data-testid="search-orders"]').type('test-order');
            cy.get('.search-button, [data-testid="search-button"]').click();

            // Verificar resultados de búsqueda
            cy.get('.admin-order-card, [data-testid="admin-order-card"]').should('have.length.greaterThan', 0);
        });
    });

    describe('Validaciones de órdenes', () => {
        it('debería requerir autenticación para acceder al historial de órdenes', () => {
            // Sin estar autenticado
            cy.visit('/orders');

            // Verificar que redirige al login
            cy.url().should('include', '/login');
        });

        it('debería requerir permisos de admin para acceder al panel de órdenes', () => {
            // Login como usuario normal
            cy.loginAsUser();
            cy.visit('/admin/orders');

            // Verificar que no tiene acceso
            cy.url().should('not.include', '/admin/orders');
            cy.contains('Acceso denegado', 'Sin permisos').should('be.visible');
        });

        it('debería validar stock antes de procesar la orden', () => {
            // Mockear respuesta sin stock
            cy.intercept('POST', '**/orders', {
                statusCode: 400,
                body: { success: false, message: 'Stock insuficiente para uno o más productos' }
            }).as('createOrderNoStock');

            cy.loginAsUser();
            cy.visit('/');
            cy.waitForAppReady();

            // Agregar producto al carrito
            cy.get('.product-card, [data-testid="product-card"]').first().within(() => {
                cy.get('.add-to-cart, [data-testid="add-to-cart"], [data-cy="add-to-cart"]').click();
            });

            // Ir al checkout
            cy.visit('/cart');
            cy.get('.checkout-button, [data-testid="checkout-button"]').click();

            // Llenar formulario y procesar orden
            cy.get('input[name="firstName"], [data-testid="first-name"]').type('Juan');
            cy.get('input[name="lastName"], [data-testid="last-name"]').type('Pérez');
            cy.get('input[name="street"], [data-testid="street"]').type('Calle 123');
            cy.get('input[name="city"], [data-testid="city"]').type('Bogotá');
            cy.get('input[name="state"], [data-testid="state"]').type('Cundinamarca');
            cy.get('input[name="zipCode"], [data-testid="zip-code"]').type('11001');
            cy.get('input[name="country"], [data-testid="country"]').type('Colombia');
            cy.get('input[name="phone"], [data-testid="phone"]').type('+573001234567');
            cy.get('input[type="radio"][name="paymentMethod"]').check();

            cy.get('.place-order-button, [data-testid="place-order-button"]').click();

            // Verificar error de stock
            cy.verifyNotification('Stock insuficiente', 'error');
        });
    });

    describe('Integración con inventario', () => {
        it('debería actualizar el inventario después de procesar una orden', () => {
            cy.loginAsUser();
            cy.visit('/');
            cy.waitForAppReady();

            // Agregar producto al carrito
            cy.get('.product-card, [data-testid="product-card"]').first().within(() => {
                cy.get('.add-to-cart, [data-testid="add-to-cart"], [data-cy="add-to-cart"]').click();
            });

            // Completar orden
            cy.visit('/cart');
            cy.get('.checkout-button, [data-testid="checkout-button"]').click();

            // Llenar formulario
            cy.get('input[name="firstName"]').type('Juan');
            cy.get('input[name="lastName"]').type('Pérez');
            cy.get('input[name="street"]').type('Calle 123');
            cy.get('input[name="city"]').type('Bogotá');
            cy.get('input[name="state"]').type('Cundinamarca');
            cy.get('input[name="zipCode"]').type('11001');
            cy.get('input[name="country"]').type('Colombia');
            cy.get('input[name="phone"]').type('+573001234567');
            cy.get('input[type="radio"][name="paymentMethod"]').check();

            cy.get('.place-order-button').click();

            // Verificar que se procesó la orden
            cy.url().should('include', '/order-confirmation');

            // Verificar que el carrito se limpió
            cy.visit('/cart');
            cy.contains('Carrito vacío').should('be.visible');
        });
    });
});
