describe('Flujo Simple E2E', () => {
    beforeEach(() => {
        cy.clearLocalStorage();
        cy.clearCookies();
    });

    describe('Navegación básica', () => {
        it('debería cargar la página principal', () => {
            cy.visit('/');
            cy.wait(2000); // Esperar a que cargue la página

            // Verificar que la página se carga
            cy.get('body').should('be.visible');
            cy.url().should('include', '/');
        });

        it('debería navegar a la página de login', () => {
            cy.visit('/login');
            cy.wait(2000);

            // Verificar que estamos en login
            cy.url().should('include', '/login');
            cy.get('body').should('be.visible');
        });

        it('debería navegar a la página de registro', () => {
            cy.visit('/register');
            cy.wait(2000);

            // Verificar que estamos en registro
            cy.url().should('include', '/register');
            cy.get('body').should('be.visible');
        });
    });

    describe('Registro de usuario', () => {
        it('debería mostrar el formulario de registro', () => {
            cy.visit('/register');
            cy.wait(2000);

            // Verificar que existe el formulario
            cy.get('form').should('be.visible');
            cy.get('input[type="email"]').should('be.visible');
            cy.get('input[type="password"]').should('be.visible');
            cy.get('button[type="submit"]').should('be.visible');
        });

        it('debería permitir llenar el formulario de registro', () => {
            cy.visit('/register');
            cy.wait(2000);

            // Llenar formulario
            cy.get('input[type="text"], input[name="nombre"]').first().type('Usuario de Prueba');
            cy.get('input[type="email"]').type('test-e2e@example.com');
            cy.get('input[type="password"]').first().type('TestPassword123!');
            cy.get('input[type="password"]').last().type('TestPassword123!');

            // Verificar que se llenaron los campos
            cy.get('input[type="email"]').should('have.value', 'test-e2e@example.com');
        });
    });

    describe('Login de usuario', () => {
        it('debería mostrar el formulario de login', () => {
            cy.visit('/login');
            cy.wait(2000);

            // Verificar que existe el formulario
            cy.get('form').should('be.visible');
            cy.get('input[type="email"]').should('be.visible');
            cy.get('input[type="password"]').should('be.visible');
            cy.get('button[type="submit"]').should('be.visible');
        });

        it('debería permitir llenar el formulario de login', () => {
            cy.visit('/login');
            cy.wait(2000);

            // Llenar formulario
            cy.get('input[type="email"]').type('test@example.com');
            cy.get('input[type="password"]').type('Password123!');

            // Verificar que se llenaron los campos
            cy.get('input[type="email"]').should('have.value', 'test@example.com');
            cy.get('input[type="password"]').should('have.value', 'Password123!');
        });
    });

    describe('Navegación entre páginas', () => {
        it('debería navegar entre páginas principales', () => {
            // Ir a home
            cy.visit('/');
            cy.wait(2000);
            cy.url().should('include', '/');

            // Ir a login
            cy.visit('/login');
            cy.wait(2000);
            cy.url().should('include', '/login');

            // Ir a registro
            cy.visit('/register');
            cy.wait(2000);
            cy.url().should('include', '/register');
        });
    });

    describe('Responsividad', () => {
        it('debería funcionar en móvil', () => {
            cy.viewport(375, 667); // iPhone SE
            cy.visit('/');
            cy.wait(2000);

            cy.get('body').should('be.visible');
        });

        it('debería funcionar en tablet', () => {
            cy.viewport(768, 1024); // iPad
            cy.visit('/');
            cy.wait(2000);

            cy.get('body').should('be.visible');
        });

        it('debería funcionar en desktop', () => {
            cy.viewport(1280, 720);
            cy.visit('/');
            cy.wait(2000);

            cy.get('body').should('be.visible');
        });
    });

    describe('Elementos básicos de la página', () => {
        it('debería mostrar elementos principales', () => {
            cy.visit('/');
            cy.wait(2000);

            // Verificar que existen elementos básicos
            cy.get('html').should('be.visible');
            cy.get('body').should('be.visible');

            // Verificar que hay contenido
            cy.get('body').should('not.be.empty');
        });

        it('debería tener elementos de navegación', () => {
            cy.visit('/');
            cy.wait(2000);

            // Verificar que hay elementos clickeables
            cy.get('a, button').should('have.length.greaterThan', 0);
        });
    });
});
