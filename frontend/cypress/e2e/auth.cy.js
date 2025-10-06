describe('Autenticación E2E', () => {
    beforeEach(() => {
        // Limpiar localStorage antes de cada prueba
        cy.clearLocalStorage();
        cy.clearCookies();
    });

    describe('Registro de usuario', () => {
        it('debería registrar un nuevo usuario exitosamente', () => {
            const userData = {
                nombre: 'Usuario de Prueba E2E',
                email: 'e2e-test@example.com',
                contraseña: 'E2EPassword123!',
                confirmarContraseña: 'E2EPassword123!'
            };

            cy.visit('/register');

            // Verificar que estamos en la página de registro
            cy.url().should('include', '/register');
            cy.contains('Registrarse').should('be.visible');

            // Llenar el formulario de registro
            cy.get('input[name="nombre"]').type(userData.nombre);
            cy.get('input[name="email"]').type(userData.email);
            cy.get('input[name="contraseña"]').type(userData.contraseña);
            cy.get('input[name="confirmarContraseña"]').type(userData.confirmarContraseña);

            // Enviar el formulario
            cy.get('button[type="submit"]').click();

            // Verificar que se redirige después del registro exitoso
            cy.url().should('not.include', '/register');
            cy.url().should('include', '/');

            // Verificar que el usuario está autenticado
            cy.verifyAuthenticated();
        });

        it('debería mostrar errores con datos inválidos', () => {
            cy.visit('/register');

            // Intentar registrar con datos inválidos
            cy.get('input[name="nombre"]').type(''); // Nombre vacío
            cy.get('input[name="email"]').type('email-invalido'); // Email inválido
            cy.get('input[name="contraseña"]').type('123'); // Contraseña débil
            cy.get('input[name="confirmarContraseña"]').type('456'); // Contraseñas no coinciden

            cy.get('button[type="submit"]').click();

            // Verificar que se muestran errores de validación
            cy.get('.error, [data-testid="error"]').should('be.visible');
            cy.url().should('include', '/register');
        });

        it('debería mostrar error si el email ya existe', () => {
            cy.visit('/register');

            // Usar un email que ya existe (del fixture)
            cy.get('input[name="nombre"]').type('Usuario Existente');
            cy.get('input[name="email"]').type('test@example.com');
            cy.get('input[name="contraseña"]').type('Password123!');
            cy.get('input[name="confirmarContraseña"]').type('Password123!');

            cy.get('button[type="submit"]').click();

            // Verificar que se muestra error de email existente
            cy.contains('Ya existe un usuario con este email').should('be.visible');
            cy.url().should('include', '/register');
        });
    });

    describe('Inicio de sesión', () => {
        it('debería iniciar sesión exitosamente con credenciales válidas', () => {
            cy.visit('/login');

            // Verificar que estamos en la página de login
            cy.url().should('include', '/login');
            cy.contains('Iniciar Sesión').should('be.visible');

            // Llenar el formulario de login
            cy.get('input[name="email"]').type('test@example.com');
            cy.get('input[name="contraseña"]').type('Password123!');

            // Enviar el formulario
            cy.get('button[type="submit"]').click();

            // Verificar que se redirige después del login exitoso
            cy.url().should('not.include', '/login');
            cy.url().should('include', '/');

            // Verificar que el usuario está autenticado
            cy.verifyAuthenticated();
        });

        it('debería mostrar error con credenciales inválidas', () => {
            cy.visit('/login');

            // Intentar login con credenciales incorrectas
            cy.get('input[name="email"]').type('wrong@example.com');
            cy.get('input[name="contraseña"]').type('WrongPassword123!');

            cy.get('button[type="submit"]').click();

            // Verificar que se muestra error
            cy.contains('Credenciales inválidas').should('be.visible');
            cy.url().should('include', '/login');
            cy.verifyNotAuthenticated();
        });

        it('debería mostrar error con campos vacíos', () => {
            cy.visit('/login');

            // Intentar login sin llenar campos
            cy.get('button[type="submit"]').click();

            // Verificar que se muestran errores de validación
            cy.get('.error, [data-testid="error"]').should('be.visible');
            cy.url().should('include', '/login');
        });
    });

    describe('Navegación de autenticación', () => {
        it('debería redirigir a login desde páginas protegidas cuando no está autenticado', () => {
            // Intentar acceder a una página protegida sin estar autenticado
            cy.visit('/profile');

            // Verificar que se redirige al login
            cy.url().should('include', '/login');
        });

        it('debería permitir acceso a páginas protegidas cuando está autenticado', () => {
            // Login primero
            cy.loginAsUser();

            // Intentar acceder a páginas protegidas
            cy.visit('/profile');
            cy.url().should('include', '/profile');
            cy.contains('Perfil').should('be.visible');
        });

        it('debería redirigir a home desde login/register cuando ya está autenticado', () => {
            // Login primero
            cy.loginAsUser();

            // Intentar acceder a login cuando ya está autenticado
            cy.visit('/login');
            cy.url().should('not.include', '/login');
            cy.url().should('include', '/');

            // Intentar acceder a register cuando ya está autenticado
            cy.visit('/register');
            cy.url().should('not.include', '/register');
            cy.url().should('include', '/');
        });
    });

    describe('Cierre de sesión', () => {
        it('debería cerrar sesión exitosamente', () => {
            // Login primero
            cy.loginAsUser();

            // Verificar que está autenticado
            cy.verifyAuthenticated();

            // Hacer logout
            cy.get('[data-testid="user-menu"], .user-menu, [data-cy="user-menu"]').click();
            cy.get('[data-testid="logout"], .logout, [data-cy="logout"]').click();

            // Verificar que se cerró la sesión
            cy.verifyNotAuthenticated();
            cy.url().should('include', '/');
        });
    });

    describe('Persistencia de sesión', () => {
        it('debería mantener la sesión al recargar la página', () => {
            // Login primero
            cy.loginAsUser();

            // Verificar que está autenticado
            cy.verifyAuthenticated();

            // Recargar la página
            cy.reload();

            // Verificar que sigue autenticado
            cy.verifyAuthenticated();
        });

        it('debería mantener la sesión al navegar entre páginas', () => {
            // Login primero
            cy.loginAsUser();

            // Navegar entre páginas
            cy.visit('/');
            cy.verifyAuthenticated();

            cy.visit('/profile');
            cy.verifyAuthenticated();

            cy.visit('/cart');
            cy.verifyAuthenticated();
        });
    });

    describe('Roles y permisos', () => {
        it('debería permitir acceso al admin solo para usuarios admin', () => {
            // Login como usuario normal
            cy.loginAsUser();

            // Intentar acceder al admin
            cy.visit('/admin');

            // Debería redirigir o mostrar error de permisos
            cy.url().should('not.include', '/admin');
        });

        it('debería permitir acceso al admin para usuarios admin', () => {
            // Login como admin
            cy.loginAsAdmin();

            // Acceder al admin
            cy.visit('/admin');

            // Debería permitir el acceso
            cy.url().should('include', '/admin');
            cy.contains('Admin', 'Panel de Administración').should('be.visible');
        });
    });

    describe('Rate limiting', () => {
        it('debería aplicar rate limiting en múltiples intentos de login', () => {
            cy.visit('/login');

            // Intentar múltiples logins rápidos con credenciales incorrectas
            for (let i = 0; i < 5; i++) {
                cy.get('input[name="email"]').clear().type('wrong@example.com');
                cy.get('input[name="contraseña"]').clear().type('WrongPassword123!');
                cy.get('button[type="submit"]').click();
                cy.wait(100); // Pequeña pausa entre intentos
            }

            // Verificar que se aplica rate limiting
            cy.contains('Demasiados intentos').should('be.visible');
        });
    });
});
