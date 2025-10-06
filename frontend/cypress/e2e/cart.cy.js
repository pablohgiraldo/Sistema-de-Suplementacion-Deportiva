describe('Carrito E2E', () => {
    beforeEach(() => {
        cy.clearLocalStorage();
        cy.clearCookies();
        cy.clearCart();
    });

    describe('Agregar productos al carrito', () => {
        it('debería agregar un producto al carrito desde la página principal', () => {
            cy.visit('/');
            cy.waitForAppReady();

            // Verificar que el carrito está vacío inicialmente
            cy.get('.cart-count, [data-testid="cart-count"], [data-cy="cart-count"]').should('contain', '0').or('not.exist');

            // Hacer clic en "Agregar al carrito" del primer producto
            cy.get('.product-card, [data-testid="product-card"]').first().within(() => {
                cy.get('.add-to-cart, [data-testid="add-to-cart"], [data-cy="add-to-cart"]').click();
            });

            // Verificar que se agregó al carrito
            cy.get('.cart-count, [data-testid="cart-count"], [data-cy="cart-count"]').should('contain', '1');

            // Verificar notificación de éxito
            cy.verifyNotification('agregado al carrito', 'success');
        });

        it('debería agregar un producto al carrito desde la página de detalle', () => {
            cy.visit('/');
            cy.waitForAppReady();

            // Hacer clic en un producto para ir al detalle
            cy.get('.product-card, [data-testid="product-card"]').first().click();

            // Verificar que estamos en la página de detalle
            cy.url().should('include', '/product/');

            // Agregar al carrito desde la página de detalle
            cy.get('.add-to-cart, [data-testid="add-to-cart"], [data-cy="add-to-cart"]').click();

            // Verificar que se agregó al carrito
            cy.get('.cart-count, [data-testid="cart-count"], [data-cy="cart-count"]').should('contain', '1');

            // Verificar notificación de éxito
            cy.verifyNotification('agregado al carrito', 'success');
        });

        it('debería permitir seleccionar cantidad antes de agregar al carrito', () => {
            cy.visit('/');
            cy.waitForAppReady();

            // Hacer clic en un producto para ir al detalle
            cy.get('.product-card, [data-testid="product-card"]').first().click();

            // Verificar si existe selector de cantidad
            cy.get('body').then(($body) => {
                if ($body.find('.quantity-selector, [data-testid="quantity"]').length > 0) {
                    // Cambiar la cantidad a 3
                    cy.get('.quantity-selector input, [data-testid="quantity"] input').clear().type('3');

                    // Agregar al carrito
                    cy.get('.add-to-cart, [data-testid="add-to-cart"], [data-cy="add-to-cart"]').click();

                    // Verificar que se agregó la cantidad correcta
                    cy.get('.cart-count, [data-testid="cart-count"], [data-cy="cart-count"]').should('contain', '3');
                }
            });
        });

        it('debería mostrar error si no hay stock disponible', () => {
            // Mockear respuesta de API para simular sin stock
            cy.intercept('POST', '**/cart/add', {
                statusCode: 400,
                body: { success: false, message: 'Stock insuficiente' }
            }).as('addToCartNoStock');

            cy.visit('/');
            cy.waitForAppReady();

            // Intentar agregar producto sin stock
            cy.get('.product-card, [data-testid="product-card"]').first().within(() => {
                cy.get('.add-to-cart, [data-testid="add-to-cart"], [data-cy="add-to-cart"]').click();
            });

            // Verificar que se muestra error de stock
            cy.verifyNotification('Stock insuficiente', 'error');
        });
    });

    describe('Visualización del carrito', () => {
        it('debería mostrar el carrito vacío', () => {
            cy.visit('/cart');

            // Verificar que se muestra mensaje de carrito vacío
            cy.contains('Carrito vacío', 'No hay productos').should('be.visible');
            cy.get('.empty-cart, [data-testid="empty-cart"]').should('be.visible');
        });

        it('debería mostrar productos en el carrito', () => {
            // Agregar producto al carrito primero
            cy.visit('/');
            cy.waitForAppReady();

            cy.get('.product-card, [data-testid="product-card"]').first().within(() => {
                cy.get('.add-to-cart, [data-testid="add-to-cart"], [data-cy="add-to-cart"]').click();
            });

            // Ir al carrito
            cy.visit('/cart');

            // Verificar que se muestran productos
            cy.get('.cart-item, [data-testid="cart-item"], [data-cy="cart-item"]').should('have.length.greaterThan', 0);
            cy.get('.cart-total, [data-testid="cart-total"], [data-cy="cart-total"]').should('be.visible');
        });

        it('debería mostrar información completa del producto en el carrito', () => {
            // Agregar producto al carrito
            cy.visit('/');
            cy.waitForAppReady();

            cy.get('.product-card, [data-testid="product-card"]').first().within(() => {
                cy.get('.add-to-cart, [data-testid="add-to-cart"], [data-cy="add-to-cart"]').click();
            });

            // Ir al carrito
            cy.visit('/cart');

            // Verificar información del producto
            cy.get('.cart-item, [data-testid="cart-item"]').first().within(() => {
                cy.get('.product-name, [data-testid="product-name"]').should('be.visible');
                cy.get('.product-price, [data-testid="product-price"]').should('be.visible');
                cy.get('.product-quantity, [data-testid="product-quantity"]').should('be.visible');
                cy.get('.product-total, [data-testid="product-total"]').should('be.visible');
                cy.get('.product-image, [data-testid="product-image"]').should('be.visible');
            });
        });
    });

    describe('Modificar carrito', () => {
        beforeEach(() => {
            // Agregar producto al carrito para las pruebas
            cy.visit('/');
            cy.waitForAppReady();

            cy.get('.product-card, [data-testid="product-card"]').first().within(() => {
                cy.get('.add-to-cart, [data-testid="add-to-cart"], [data-cy="add-to-cart"]').click();
            });

            cy.visit('/cart');
        });

        it('debería aumentar la cantidad de un producto', () => {
            cy.get('.cart-item, [data-testid="cart-item"]').first().within(() => {
                // Verificar cantidad inicial
                cy.get('.quantity-input, [data-testid="quantity-input"]').should('have.value', '1');

                // Aumentar cantidad
                cy.get('.quantity-increase, .quantity-plus, [data-testid="quantity-increase"]').click();

                // Verificar que aumentó la cantidad
                cy.get('.quantity-input, [data-testid="quantity-input"]').should('have.value', '2');
            });

            // Verificar que se actualizó el total
            cy.get('.cart-total, [data-testid="cart-total"]').should('be.visible');
        });

        it('debería disminuir la cantidad de un producto', () => {
            // Primero aumentar la cantidad a 2
            cy.get('.cart-item, [data-testid="cart-item"]').first().within(() => {
                cy.get('.quantity-increase, .quantity-plus, [data-testid="quantity-increase"]').click();
                cy.get('.quantity-input, [data-testid="quantity-input"]').should('have.value', '2');

                // Disminuir cantidad
                cy.get('.quantity-decrease, .quantity-minus, [data-testid="quantity-decrease"]').click();

                // Verificar que disminuyó la cantidad
                cy.get('.quantity-input, [data-testid="quantity-input"]').should('have.value', '1');
            });
        });

        it('debería eliminar producto del carrito', () => {
            cy.get('.cart-item, [data-testid="cart-item"]').should('have.length', 1);

            // Eliminar producto
            cy.get('.cart-item, [data-testid="cart-item"]').first().within(() => {
                cy.get('.remove-item, [data-testid="remove-item"], [data-cy="remove-item"]').click();
            });

            // Verificar que se eliminó el producto
            cy.get('.cart-item, [data-testid="cart-item"]').should('have.length', 0);
            cy.contains('Carrito vacío', 'No hay productos').should('be.visible');

            // Verificar notificación
            cy.verifyNotification('eliminado del carrito', 'success');
        });

        it('debería permitir editar cantidad manualmente', () => {
            cy.get('.cart-item, [data-testid="cart-item"]').first().within(() => {
                // Cambiar cantidad manualmente
                cy.get('.quantity-input, [data-testid="quantity-input"]').clear().type('5');

                // Presionar Enter o hacer blur para confirmar
                cy.get('.quantity-input, [data-testid="quantity-input"]').blur();

                // Verificar que se actualizó la cantidad
                cy.get('.quantity-input, [data-testid="quantity-input"]').should('have.value', '5');
            });

            // Verificar que se actualizó el total
            cy.get('.cart-total, [data-testid="cart-total"]').should('be.visible');
        });
    });

    describe('Cálculos del carrito', () => {
        beforeEach(() => {
            // Agregar múltiples productos al carrito
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

            cy.visit('/cart');
        });

        it('debería calcular el subtotal correctamente', () => {
            cy.get('.cart-subtotal, [data-testid="cart-subtotal"]').should('be.visible');

            // Verificar que el subtotal es mayor que 0
            cy.get('.cart-subtotal, [data-testid="cart-subtotal"]').then(($subtotal) => {
                const subtotalText = $subtotal.text();
                const subtotalValue = parseFloat(subtotalText.replace(/[^0-9.]/g, ''));
                expect(subtotalValue).to.be.greaterThan(0);
            });
        });

        it('debería calcular el total con impuestos', () => {
            cy.get('.cart-total, [data-testid="cart-total"]').should('be.visible');
            cy.get('.cart-tax, [data-testid="cart-tax"]').should('be.visible');

            // Verificar que el total incluye impuestos
            cy.get('.cart-total, [data-testid="cart-total"]').then(($total) => {
                const totalText = $total.text();
                const totalValue = parseFloat(totalText.replace(/[^0-9.]/g, ''));
                expect(totalValue).to.be.greaterThan(0);
            });
        });

        it('debería mostrar el total de items correctamente', () => {
            cy.get('.cart-item-count, [data-testid="cart-item-count"]').should('contain', '2');
        });
    });

    describe('Limpiar carrito', () => {
        beforeEach(() => {
            // Agregar productos al carrito
            cy.visit('/');
            cy.waitForAppReady();

            cy.get('.product-card, [data-testid="product-card"]').first().within(() => {
                cy.get('.add-to-cart, [data-testid="add-to-cart"], [data-cy="add-to-cart"]').click();
            });

            cy.visit('/cart');
        });

        it('debería limpiar todo el carrito', () => {
            cy.get('.cart-item, [data-testid="cart-item"]').should('have.length.greaterThan', 0);

            // Hacer clic en "Limpiar carrito"
            cy.get('.clear-cart, [data-testid="clear-cart"], [data-cy="clear-cart"]').click();

            // Confirmar la acción si aparece un modal
            cy.get('body').then(($body) => {
                if ($body.find('.confirm-clear, .modal-confirm').length > 0) {
                    cy.get('.confirm-clear, .modal-confirm').click();
                }
            });

            // Verificar que el carrito está vacío
            cy.get('.cart-item, [data-testid="cart-item"]').should('have.length', 0);
            cy.contains('Carrito vacío', 'No hay productos').should('be.visible');

            // Verificar notificación
            cy.verifyNotification('carrito vaciado', 'success');
        });
    });

    describe('Persistencia del carrito', () => {
        it('debería mantener los productos del carrito al navegar entre páginas', () => {
            cy.visit('/');
            cy.waitForAppReady();

            // Agregar producto al carrito
            cy.get('.product-card, [data-testid="product-card"]').first().within(() => {
                cy.get('.add-to-cart, [data-testid="add-to-cart"], [data-cy="add-to-cart"]').click();
            });

            // Navegar a otra página
            cy.visit('/');

            // Verificar que el carrito mantiene el producto
            cy.get('.cart-count, [data-testid="cart-count"], [data-cy="cart-count"]').should('contain', '1');

            // Ir al carrito y verificar
            cy.visit('/cart');
            cy.get('.cart-item, [data-testid="cart-item"]').should('have.length', 1);
        });

        it('debería mantener el carrito después de recargar la página', () => {
            cy.visit('/');
            cy.waitForAppReady();

            // Agregar producto al carrito
            cy.get('.product-card, [data-testid="product-card"]').first().within(() => {
                cy.get('.add-to-cart, [data-testid="add-to-cart"], [data-cy="add-to-cart"]').click();
            });

            // Recargar la página
            cy.reload();

            // Verificar que el carrito mantiene el producto
            cy.get('.cart-count, [data-testid="cart-count"], [data-cy="cart-count"]').should('contain', '1');
        });
    });

    describe('Carrito con usuario autenticado', () => {
        beforeEach(() => {
            cy.loginAsUser();
        });

        it('debería sincronizar el carrito con el backend', () => {
            cy.visit('/');
            cy.waitForAppReady();

            // Agregar producto al carrito
            cy.get('.product-card, [data-testid="product-card"]').first().within(() => {
                cy.get('.add-to-cart, [data-testid="add-to-cart"], [data-cy="add-to-cart"]').click();
            });

            // Verificar que se sincronizó con el backend
            cy.visit('/cart');
            cy.get('.cart-item, [data-testid="cart-item"]').should('have.length', 1);

            // Verificar que el carrito se carga desde el backend
            cy.reload();
            cy.get('.cart-item, [data-testid="cart-item"]').should('have.length', 1);
        });

        it('debería validar stock en tiempo real', () => {
            cy.visit('/cart');

            // Si hay productos en el carrito, verificar validación de stock
            cy.get('body').then(($body) => {
                if ($body.find('.cart-item, [data-testid="cart-item"]').length > 0) {
                    cy.get('.stock-warning, [data-testid="stock-warning"]').should('not.exist');

                    // Si hay advertencias de stock, verificarlas
                    cy.get('.cart-item, [data-testid="cart-item"]').each(($item) => {
                        cy.wrap($item).should('not.contain', 'Sin stock');
                    });
                }
            });
        });
    });

    describe('Navegación al checkout', () => {
        beforeEach(() => {
            // Agregar producto al carrito
            cy.visit('/');
            cy.waitForAppReady();

            cy.get('.product-card, [data-testid="product-card"]').first().within(() => {
                cy.get('.add-to-cart, [data-testid="add-to-cart"], [data-cy="add-to-cart"]').click();
            });

            cy.visit('/cart');
        });

        it('debería navegar al checkout desde el carrito', () => {
            // Verificar que existe el botón de checkout
            cy.get('.checkout-button, [data-testid="checkout-button"], [data-cy="checkout-button"]').should('be.visible');

            // Hacer clic en checkout
            cy.get('.checkout-button, [data-testid="checkout-button"], [data-cy="checkout-button"]').click();

            // Verificar que navega al checkout
            cy.url().should('include', '/checkout');
        });

        it('debería requerir autenticación para proceder al checkout', () => {
            // Sin estar autenticado, intentar ir al checkout
            cy.get('.checkout-button, [data-testid="checkout-button"], [data-cy="checkout-button"]').click();

            // Verificar que redirige al login
            cy.url().should('include', '/login');
        });
    });
});
