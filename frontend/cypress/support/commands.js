// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Comando personalizado para login
Cypress.Commands.add('login', (email, password) => {
    cy.session([email, password], () => {
        cy.visit('/login');
        cy.get('input[name="email"]').type(email);
        cy.get('input[name="contraseña"]').type(password);
        cy.get('button[type="submit"]').click();

        // Esperar a que el login sea exitoso
        cy.url().should('not.include', '/login');
        cy.get('[data-testid="user-menu"], .user-menu, [data-cy="user-menu"]').should('be.visible');
    });
});

// Comando personalizado para login como admin
Cypress.Commands.add('loginAsAdmin', () => {
    const adminEmail = Cypress.env('TEST_ADMIN_EMAIL') || 'admin@example.com';
    const adminPassword = Cypress.env('TEST_ADMIN_PASSWORD') || 'AdminPassword123!';
    cy.login(adminEmail, adminPassword);
});

// Comando personalizado para login como usuario normal
Cypress.Commands.add('loginAsUser', () => {
    const userEmail = Cypress.env('TEST_USER_EMAIL') || 'test@example.com';
    const userPassword = Cypress.env('TEST_USER_PASSWORD') || 'Password123!';
    cy.login(userEmail, userPassword);
});

// Comando para registrar un usuario de prueba
Cypress.Commands.add('registerTestUser', (userData) => {
    cy.visit('/register');
    cy.get('input[name="nombre"]').type(userData.nombre);
    cy.get('input[name="email"]').type(userData.email);
    cy.get('input[name="contraseña"]').type(userData.contraseña);
    cy.get('input[name="confirmarContraseña"]').type(userData.confirmarContraseña);
    cy.get('button[type="submit"]').click();
});

// Comando para limpiar el carrito
Cypress.Commands.add('clearCart', () => {
    cy.window().then((win) => {
        if (win.localStorage) {
            win.localStorage.removeItem('cart');
        }
    });
});

// Comando para agregar producto al carrito
Cypress.Commands.add('addProductToCart', (productName) => {
    cy.contains(productName).click();
    cy.get('[data-testid="add-to-cart"], .add-to-cart, [data-cy="add-to-cart"]').click();
    cy.get('[data-testid="cart-count"], .cart-count, [data-cy="cart-count"]').should('be.visible');
});

// Comando para navegar a una página específica
Cypress.Commands.add('navigateToPage', (pageName) => {
    const pages = {
        'home': '/',
        'products': '/',
        'cart': '/cart',
        'profile': '/profile',
        'admin': '/admin',
        'login': '/login',
        'register': '/register'
    };

    const url = pages[pageName.toLowerCase()];
    if (url) {
        cy.visit(url);
    } else {
        throw new Error(`Página "${pageName}" no encontrada en la configuración`);
    }
});

// Comando para esperar que la aplicación esté lista
Cypress.Commands.add('waitForAppReady', () => {
    // Esperar un tiempo para que la aplicación cargue
    cy.wait(3000);

    // Verificar que el body está visible
    cy.get('body').should('be.visible');

    // Esperar a que no haya loaders visibles (si existen)
    cy.get('body').then(($body) => {
        if ($body.find('.loading, .spinner, [data-testid="loading"]').length > 0) {
            cy.get('.loading, .spinner, [data-testid="loading"]', { timeout: 10000 }).should('not.exist');
        }
    });
});

// Comando para verificar que el usuario está autenticado
Cypress.Commands.add('verifyAuthenticated', () => {
    cy.get('[data-testid="user-menu"], .user-menu, [data-cy="user-menu"]').should('be.visible');
    cy.get('[data-testid="logout"], .logout, [data-cy="logout"]').should('be.visible');
});

// Comando para verificar que el usuario NO está autenticado
Cypress.Commands.add('verifyNotAuthenticated', () => {
    cy.get('[data-testid="login"], .login, [data-cy="login"]').should('be.visible');
    cy.get('[data-testid="register"], .register, [data-cy="register"]').should('be.visible');
});

// Comando para interceptar y mockear requests de API
Cypress.Commands.add('mockApiResponse', (method, url, response) => {
    cy.intercept(method, url, response).as('mockApi');
});

// Comando para verificar notificaciones
Cypress.Commands.add('verifyNotification', (message, type = 'success') => {
    cy.get(`[data-testid="notification"], .notification, .toast, .alert`)
        .should('be.visible')
        .and('contain', message);

    if (type === 'success') {
        cy.get(`[data-testid="notification"], .notification, .toast, .alert`)
            .should('have.class', 'success').or('have.class', 'bg-green-500').or('have.class', 'text-green-500');
    } else if (type === 'error') {
        cy.get(`[data-testid="notification"], .notification, .toast, .alert`)
            .should('have.class', 'error').or('have.class', 'bg-red-500').or('have.class', 'text-red-500');
    }
});