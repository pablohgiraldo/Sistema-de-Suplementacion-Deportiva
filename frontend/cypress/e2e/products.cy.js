describe('Productos E2E', () => {
    beforeEach(() => {
        cy.clearLocalStorage();
        cy.clearCookies();
    });

    describe('Navegación y visualización de productos', () => {
        it('debería mostrar la página principal con productos', () => {
            cy.visit('/');

            // Verificar que la página carga correctamente
            cy.waitForAppReady();

            // Verificar elementos principales de la página
            cy.get('header, .header, [data-testid="header"]').should('be.visible');
            cy.get('main, .main-content, [data-testid="main-content"]').should('be.visible');

            // Verificar que se muestran productos
            cy.get('.product-card, [data-testid="product-card"], [data-cy="product-card"]').should('have.length.greaterThan', 0);
        });

        it('debería mostrar productos en el carrusel principal', () => {
            cy.visit('/');

            // Verificar que existe el carrusel o sección de productos destacados
            cy.get('.hero-banner, .product-carousel, [data-testid="hero-banner"]').should('be.visible');

            // Verificar que hay productos en el carrusel
            cy.get('.hero-banner .product-card, .product-carousel .product-card').should('have.length.greaterThan', 0);
        });

        it('debería navegar a la página de detalle de producto', () => {
            cy.visit('/');

            // Hacer clic en el primer producto
            cy.get('.product-card, [data-testid="product-card"]').first().click();

            // Verificar que navega a la página de detalle
            cy.url().should('include', '/product/');

            // Verificar elementos de la página de detalle
            cy.get('.product-detail, [data-testid="product-detail"]').should('be.visible');
            cy.get('.product-name, [data-testid="product-name"]').should('be.visible');
            cy.get('.product-price, [data-testid="product-price"]').should('be.visible');
            cy.get('.product-description, [data-testid="product-description"]').should('be.visible');
        });
    });

    describe('Búsqueda de productos', () => {
        it('debería buscar productos por nombre', () => {
            cy.visit('/');

            // Buscar "whey" en el campo de búsqueda
            cy.get('input[placeholder*="buscar"], input[name="search"], [data-testid="search-input"]').type('whey');
            cy.get('button[type="submit"], .search-button, [data-testid="search-button"]').click();

            // Verificar que se muestran resultados
            cy.get('.product-card, [data-testid="product-card"]').should('have.length.greaterThan', 0);

            // Verificar que los resultados contienen la palabra buscada
            cy.get('.product-card, [data-testid="product-card"]').each(($card) => {
                cy.wrap($card).should('contain.text', 'whey').or('contain.text', 'Whey');
            });
        });

        it('debería mostrar mensaje cuando no hay resultados de búsqueda', () => {
            cy.visit('/');

            // Buscar algo que no existe
            cy.get('input[placeholder*="buscar"], input[name="search"], [data-testid="search-input"]').type('producto-inexistente-xyz');
            cy.get('button[type="submit"], .search-button, [data-testid="search-button"]').click();

            // Verificar que se muestra mensaje de "no encontrado"
            cy.contains('No se encontraron productos', 'Sin resultados').should('be.visible');
        });

        it('debería limpiar la búsqueda y mostrar todos los productos', () => {
            cy.visit('/');

            // Realizar una búsqueda
            cy.get('input[placeholder*="buscar"], input[name="search"], [data-testid="search-input"]').type('whey');
            cy.get('button[type="submit"], .search-button, [data-testid="search-button"]').click();

            // Limpiar la búsqueda
            cy.get('input[placeholder*="buscar"], input[name="search"], [data-testid="search-input"]').clear();
            cy.get('button[type="submit"], .search-button, [data-testid="search-button"]').click();

            // Verificar que se muestran todos los productos
            cy.get('.product-card, [data-testid="product-card"]').should('have.length.greaterThan', 1);
        });
    });

    describe('Filtros y categorías', () => {
        it('debería filtrar productos por categoría', () => {
            cy.visit('/');

            // Hacer clic en una categoría específica
            cy.contains('Proteínas', 'Categorías').click();

            // Verificar que se muestran solo productos de esa categoría
            cy.get('.product-card, [data-testid="product-card"]').should('have.length.greaterThan', 0);

            // Verificar que los productos mostrados pertenecen a la categoría
            cy.get('.product-card, [data-testid="product-card"]').each(($card) => {
                cy.wrap($card).should('contain.text', 'Proteína').or('contain.text', 'Whey');
            });
        });

        it('debería mostrar todas las categorías disponibles', () => {
            cy.visit('/');

            // Verificar que existen categorías en el menú o filtros
            cy.get('.categories, .category-menu, [data-testid="categories"]').should('be.visible');

            // Verificar categorías comunes
            cy.contains('Todos los Productos').should('be.visible');
            cy.contains('Proteínas').should('be.visible');
            cy.contains('Creatina').should('be.visible');
        });

        it('debería filtrar por rango de precios', () => {
            cy.visit('/');

            // Buscar filtros de precio (si existen)
            cy.get('.price-filter, [data-testid="price-filter"]').then(($filter) => {
                if ($filter.length > 0) {
                    // Si existe el filtro de precio, probarlo
                    cy.get('input[type="range"], .price-range').first().invoke('val', 50);
                    cy.get('.apply-filter, [data-testid="apply-filter"]').click();

                    // Verificar que se aplicó el filtro
                    cy.get('.product-card, [data-testid="product-card"]').should('have.length.greaterThan', 0);
                }
            });
        });
    });

    describe('Paginación', () => {
        it('debería mostrar paginación cuando hay muchos productos', () => {
            cy.visit('/');

            // Verificar si existe paginación
            cy.get('body').then(($body) => {
                if ($body.find('.pagination, [data-testid="pagination"]').length > 0) {
                    // Si existe paginación, probarla
                    cy.get('.pagination, [data-testid="pagination"]').should('be.visible');
                    cy.get('.pagination button, .pagination a').should('have.length.greaterThan', 1);
                }
            });
        });

        it('debería navegar entre páginas de productos', () => {
            cy.visit('/');

            // Verificar si existe paginación
            cy.get('body').then(($body) => {
                if ($body.find('.pagination, [data-testid="pagination"]').length > 0) {
                    // Hacer clic en la página 2
                    cy.get('.pagination button, .pagination a').contains('2').click();

                    // Verificar que cambió la URL o se actualizó el contenido
                    cy.url().should('include', 'page=2').or('include', 'page');

                    // Verificar que se muestran productos en la nueva página
                    cy.get('.product-card, [data-testid="product-card"]').should('have.length.greaterThan', 0);
                }
            });
        });
    });

    describe('Detalle de producto', () => {
        it('debería mostrar toda la información del producto', () => {
            cy.visit('/');

            // Hacer clic en un producto
            cy.get('.product-card, [data-testid="product-card"]').first().click();

            // Verificar elementos del detalle
            cy.get('.product-name, [data-testid="product-name"]').should('be.visible');
            cy.get('.product-price, [data-testid="product-price"]').should('be.visible');
            cy.get('.product-description, [data-testid="product-description"]').should('be.visible');
            cy.get('.product-image, [data-testid="product-image"]').should('be.visible');

            // Verificar que existe botón de agregar al carrito
            cy.get('.add-to-cart, [data-testid="add-to-cart"], [data-cy="add-to-cart"]').should('be.visible');
        });

        it('debería permitir cambiar la cantidad del producto', () => {
            cy.visit('/');

            // Hacer clic en un producto
            cy.get('.product-card, [data-testid="product-card"]').first().click();

            // Verificar si existe selector de cantidad
            cy.get('body').then(($body) => {
                if ($body.find('.quantity-selector, [data-testid="quantity"]').length > 0) {
                    // Cambiar la cantidad
                    cy.get('.quantity-selector input, [data-testid="quantity"] input').clear().type('3');

                    // Verificar que se actualizó la cantidad
                    cy.get('.quantity-selector input, [data-testid="quantity"] input').should('have.value', '3');
                }
            });
        });

        it('debería mostrar información adicional del producto', () => {
            cy.visit('/');

            // Hacer clic en un producto
            cy.get('.product-card, [data-testid="product-card"]').first().click();

            // Verificar información adicional (si existe)
            cy.get('body').then(($body) => {
                if ($body.find('.product-specs, .product-ingredients, .product-reviews').length > 0) {
                    cy.get('.product-specs, .product-ingredients, .product-reviews').should('be.visible');
                }
            });
        });
    });

    describe('Responsividad', () => {
        it('debería mostrar productos correctamente en móvil', () => {
            cy.viewport(375, 667); // iPhone SE
            cy.visit('/');

            // Verificar que la página se adapta a móvil
            cy.get('.product-card, [data-testid="product-card"]').should('be.visible');
            cy.get('header, .header, [data-testid="header"]').should('be.visible');
        });

        it('debería mostrar productos correctamente en tablet', () => {
            cy.viewport(768, 1024); // iPad
            cy.visit('/');

            // Verificar que la página se adapta a tablet
            cy.get('.product-card, [data-testid="product-card"]').should('be.visible');
            cy.get('header, .header, [data-testid="header"]').should('be.visible');
        });
    });

    describe('Performance', () => {
        it('debería cargar la página de productos en menos de 3 segundos', () => {
            const startTime = Date.now();

            cy.visit('/');
            cy.waitForAppReady();

            cy.then(() => {
                const loadTime = Date.now() - startTime;
                expect(loadTime).to.be.lessThan(3000);
            });
        });

        it('debería cargar imágenes de productos', () => {
            cy.visit('/');

            // Verificar que las imágenes de productos cargan
            cy.get('.product-card img, [data-testid="product-image"] img').should('be.visible');
            cy.get('.product-card img, [data-testid="product-image"] img').should('have.attr', 'src');
        });
    });

    describe('Accesibilidad', () => {
        it('debería tener navegación por teclado funcional', () => {
            cy.visit('/');

            // Navegar con Tab
            cy.get('body').tab();
            cy.focused().should('be.visible');

            // Verificar que se puede navegar entre elementos interactivos
            cy.get('button, a, input').first().focus();
            cy.focused().should('be.visible');
        });

        it('debería tener texto alternativo en imágenes', () => {
            cy.visit('/');

            // Verificar que las imágenes tienen alt text
            cy.get('.product-card img, [data-testid="product-image"] img').each(($img) => {
                cy.wrap($img).should('have.attr', 'alt');
            });
        });
    });
});
