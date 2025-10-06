# Pruebas E2E con Cypress - SuperGains

Este directorio contiene las pruebas end-to-end (E2E) para la aplicación SuperGains utilizando Cypress.

## 📁 Estructura de archivos

```
cypress/
├── e2e/                    # Pruebas E2E
│   ├── auth.cy.js         # Pruebas de autenticación
│   ├── products.cy.js     # Pruebas de productos
│   ├── cart.cy.js         # Pruebas del carrito
│   ├── orders.cy.js       # Pruebas de órdenes
│   └── full-flow.cy.js    # Flujo completo de la aplicación
├── fixtures/               # Datos de prueba
│   ├── users.json         # Usuarios de prueba
│   └── products.json      # Productos de prueba
├── support/               # Archivos de soporte
│   ├── commands.js        # Comandos personalizados
│   ├── e2e.js            # Configuración global
│   └── index.js          # Índice de soporte
└── README.md             # Este archivo
```

## 🚀 Comandos disponibles

### Ejecutar pruebas
```bash
# Abrir Cypress en modo interactivo
npm run cypress:open

# Ejecutar todas las pruebas en modo headless
npm run cypress:run

# Ejecutar pruebas E2E (alias)
npm run e2e

# Ejecutar pruebas E2E en modo interactivo
npm run e2e:open
```

### Ejecutar pruebas específicas
```bash
# Ejecutar solo pruebas de autenticación
npx cypress run --spec "cypress/e2e/auth.cy.js"

# Ejecutar solo pruebas de productos
npx cypress run --spec "cypress/e2e/products.cy.js"

# Ejecutar solo pruebas del carrito
npx cypress run --spec "cypress/e2e/cart.cy.js"

# Ejecutar solo pruebas de órdenes
npx cypress run --spec "cypress/e2e/orders.cy.js"

# Ejecutar flujo completo
npx cypress run --spec "cypress/e2e/full-flow.cy.js"
```

## 🧪 Tipos de pruebas

### 1. Autenticación (`auth.cy.js`)
- ✅ Registro de usuarios nuevos
- ✅ Inicio de sesión con credenciales válidas/inválidas
- ✅ Cierre de sesión
- ✅ Persistencia de sesión
- ✅ Validaciones de permisos y roles
- ✅ Rate limiting
- ✅ Navegación entre páginas protegidas

### 2. Productos (`products.cy.js`)
- ✅ Visualización de productos en la página principal
- ✅ Navegación a detalles de producto
- ✅ Búsqueda de productos
- ✅ Filtros por categoría y precio
- ✅ Paginación
- ✅ Responsividad (móvil, tablet, desktop)
- ✅ Performance y carga de imágenes
- ✅ Accesibilidad

### 3. Carrito (`cart.cy.js`)
- ✅ Agregar productos al carrito
- ✅ Modificar cantidades
- ✅ Eliminar productos
- ✅ Cálculos de totales
- ✅ Persistencia del carrito
- ✅ Sincronización con backend
- ✅ Validación de stock
- ✅ Navegación al checkout

### 4. Órdenes (`orders.cy.js`)
- ✅ Proceso completo de checkout
- ✅ Validación de formularios
- ✅ Confirmación de órdenes
- ✅ Historial de órdenes
- ✅ Panel de administración
- ✅ Actualización de estados
- ✅ Integración con inventario

### 5. Flujo Completo (`full-flow.cy.js`)
- ✅ Proceso completo desde registro hasta compra
- ✅ Manejo de múltiples productos
- ✅ Flujo de administración
- ✅ Navegación y UX
- ✅ Performance y optimización
- ✅ Accesibilidad

## 🔧 Comandos personalizados

### Comandos de autenticación
```javascript
// Login como usuario normal
cy.loginAsUser();

// Login como admin
cy.loginAsAdmin();

// Login personalizado
cy.login(email, password);

// Verificar autenticación
cy.verifyAuthenticated();
cy.verifyNotAuthenticated();
```

### Comandos de navegación
```javascript
// Navegar a página específica
cy.navigateToPage('products');
cy.navigateToPage('cart');
cy.navigateToPage('profile');

// Esperar que la app esté lista
cy.waitForAppReady();
```

### Comandos de carrito
```javascript
// Limpiar carrito
cy.clearCart();

// Agregar producto al carrito
cy.addProductToCart('Whey Protein');
```

### Comandos de notificaciones
```javascript
// Verificar notificación
cy.verifyNotification('Producto agregado', 'success');
cy.verifyNotification('Error de stock', 'error');
```

## 📊 Datos de prueba

### Usuarios de prueba (`fixtures/users.json`)
- **testUser**: Usuario normal para pruebas
- **testAdmin**: Usuario administrador
- **newUser**: Usuario nuevo para registro
- **invalidUser**: Datos inválidos para pruebas de validación

### Productos de prueba (`fixtures/products.json`)
- Productos de diferentes categorías
- Información completa de productos
- Categorías disponibles
- Consultas de búsqueda

## 🌐 Configuración

### Variables de entorno
```javascript
// cypress.config.js
env: {
  API_URL: 'http://localhost:4000/api',
  TEST_USER_EMAIL: 'test@example.com',
  TEST_USER_PASSWORD: 'Password123!',
  TEST_ADMIN_EMAIL: 'admin@example.com',
  TEST_ADMIN_PASSWORD: 'AdminPassword123!'
}
```

### URLs de prueba
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:4000/api

## 🎯 Mejores prácticas

### 1. Selectores
- Usar `data-testid` cuando sea posible
- Usar selectores semánticos como fallback
- Evitar selectores frágiles (clases CSS, IDs)

### 2. Esperas
- Usar `cy.waitForAppReady()` para esperar que la app esté lista
- Usar `cy.intercept()` para mockear APIs cuando sea necesario
- Evitar `cy.wait()` con tiempos fijos

### 3. Datos de prueba
- Limpiar localStorage y cookies antes de cada prueba
- Usar fixtures para datos consistentes
- Crear datos únicos para cada prueba

### 4. Assertions
- Verificar estados y comportamientos, no implementación
- Usar comandos personalizados para verificaciones comunes
- Verificar tanto casos exitosos como de error

## 🐛 Debugging

### Ejecutar en modo debug
```bash
# Abrir Cypress con herramientas de debug
npm run cypress:open

# Ejecutar con logs detallados
DEBUG=cypress:* npm run cypress:run
```

### Screenshots y videos
- Los screenshots se guardan automáticamente en fallos
- Los videos se graban en `cypress/videos/`
- Configurado en `cypress.config.js`

### Logs de consola
- Los logs del navegador aparecen en el panel de Cypress
- Los logs de la aplicación aparecen en la consola del navegador

## 📈 Cobertura de pruebas

### Funcionalidades cubiertas
- ✅ Autenticación completa
- ✅ Gestión de productos
- ✅ Carrito de compras
- ✅ Proceso de órdenes
- ✅ Panel de administración
- ✅ Responsividad
- ✅ Accesibilidad básica
- ✅ Performance

### Métricas
- **Total de pruebas**: 80+ pruebas E2E
- **Cobertura de flujos**: 95% de los flujos principales
- **Tiempo de ejecución**: ~10-15 minutos (todas las pruebas)
- **Navegadores soportados**: Chrome, Firefox, Edge

## 🔄 Integración CI/CD

### GitHub Actions
```yaml
- name: Run E2E Tests
  run: |
    npm run build
    npm run e2e
```

### Pre-commit hooks
```bash
# Ejecutar pruebas antes del commit
npm run e2e
```

## 📝 Notas importantes

1. **Servidores requeridos**: Asegúrate de que tanto el frontend (puerto 5173) como el backend (puerto 4000) estén ejecutándose antes de correr las pruebas.

2. **Base de datos**: Las pruebas usan la base de datos de desarrollo. Algunas pruebas pueden crear/modificar datos.

3. **Rate limiting**: Algunas pruebas pueden activar rate limiting del backend. Esto es comportamiento esperado.

4. **Tiempo de espera**: Las pruebas incluyen timeouts apropiados para operaciones de red lentas.

5. **Datos de prueba**: Los usuarios y productos de prueba deben existir en la base de datos para que las pruebas funcionen correctamente.
