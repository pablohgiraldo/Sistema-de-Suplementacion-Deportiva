# 🧪 Pruebas E2E - SuperGains

Este directorio contiene las pruebas End-to-End (E2E) completas para la aplicación SuperGains usando Playwright.

## 📁 Estructura

```
e2e/
├── fixtures/
│   ├── auth.js          # Fixtures para autenticación
│   └── helpers.js       # Funciones auxiliares para pruebas
├── auth.spec.js         # Pruebas de autenticación
├── products.spec.js     # Pruebas de productos y carrito
├── forms.spec.js        # Pruebas de formularios y feedback visual
├── responsive.spec.js   # Pruebas de responsividad
├── error-handling.spec.js # Pruebas de manejo de errores
├── global-setup.js      # Configuración global
└── README.md           # Esta documentación
```

## 🚀 Comandos Disponibles

### Instalación
```bash
# Instalar Playwright
npm install @playwright/test

# Instalar browsers
npx playwright install
```

### Ejecución de Pruebas
```bash
# Ejecutar todas las pruebas
npm run test:e2e

# Ejecutar con interfaz visual
npm run test:e2e:ui

# Ejecutar en modo headed (ver browser)
npm run test:e2e:headed

# Ejecutar en modo debug
npm run test:e2e:debug

# Ver reporte de resultados
npm run test:e2e:report
```

### Ejecutar Pruebas Específicas
```bash
# Solo pruebas de autenticación
npx playwright test auth.spec.js

# Solo pruebas de productos
npx playwright test products.spec.js

# Solo pruebas de responsividad
npx playwright test responsive.spec.js

# Ejecutar en navegador específico
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

## 📋 Cobertura de Pruebas

### 🔐 Autenticación (`auth.spec.js`)
- ✅ Login exitoso con credenciales válidas
- ✅ Error con credenciales inválidas
- ✅ Validación de campos requeridos
- ✅ Validación de formato de email
- ✅ Toggle de visibilidad de contraseña
- ✅ Manejo de rate limiting (429)
- ✅ Manejo de errores de red
- ✅ Registro exitoso
- ✅ Validación de coincidencia de contraseñas
- ✅ Validación de longitud mínima
- ✅ Progreso visual durante registro
- ✅ Navegación entre formularios

### 🛒 Productos (`products.spec.js`)
- ✅ Mostrar página principal con productos
- ✅ Información básica de productos
- ✅ Hover effects en tarjetas
- ✅ Wishlist button en hover
- ✅ Responsividad en móviles
- ✅ Navegación al detalle del producto
- ✅ Información completa del producto
- ✅ Cambio de imagen en galería
- ✅ Expansión de secciones
- ✅ Sección "Frequently bought together"
- ✅ Agregar al carrito desde listado
- ✅ Agregar al carrito desde detalle
- ✅ Estado de producto agotado
- ✅ Requerir autenticación para carrito
- ✅ Funcionalidad de wishlist

### 🎨 Formularios (`forms.spec.js`)
- ✅ Validación en tiempo real
- ✅ Notificaciones toast (success, error, warning, info)
- ✅ Cerrar notificaciones manualmente
- ✅ Auto-cierre de notificaciones
- ✅ Estados de formulario (loading, success, error)
- ✅ Indicador de progreso
- ✅ Actualización paso a paso
- ✅ Colores consistentes
- ✅ Animaciones y transiciones

### 📱 Responsividad (`responsive.spec.js`)
- ✅ Breakpoints móviles (375px)
- ✅ Breakpoints tablets (768px)
- ✅ Breakpoints desktop (1024px+)
- ✅ Formularios responsivos
- ✅ Página de detalle responsiva
- ✅ Galería de imágenes responsiva
- ✅ Notificaciones responsivas
- ✅ Indicadores de progreso responsivos
- ✅ Rate limiting responsivo
- ✅ Touch interactions
- ✅ Cambio de orientación

### 🚨 Manejo de Errores (`error-handling.spec.js`)
- ✅ Errores de red (conexión perdida)
- ✅ Errores HTTP (404, 400, 500)
- ✅ Rate limiting (429) con countdown
- ✅ Timeouts en requests
- ✅ Errores de validación del cliente
- ✅ Errores de validación del servidor
- ✅ Estados de error en UI
- ✅ Limpieza de errores al corregir

## 🎯 Data Test IDs Requeridos

Para que las pruebas funcionen correctamente, asegúrate de que los siguientes `data-testid` estén presentes en los componentes:

### Autenticación
- `login-form`, `email-input`, `password-input`, `login-button`
- `register-form`, `name-input`, `confirm-password-input`, `register-button`
- `password-toggle`, `login-link`, `register-link`

### Productos
- `product-grid`, `product-card`, `product-image`, `product-name`
- `product-price`, `product-rating`, `add-to-cart-button`, `product-link`
- `wishlist-button`, `product-detail`, `product-gallery`, `product-info`
- `gallery-thumbnail`, `main-product-image`, `section-toggle`

### Notificaciones y Feedback
- `notification-success`, `notification-error`, `notification-warning`, `notification-info`
- `close-button`, `success-icon`, `error-icon`, `warning-icon`, `info-icon`
- `form-status-loading`, `form-status-success`, `form-status-error`
- `form-progress`, `progress-step-1`, `progress-step-2`, `progress-step-3`

### Errores
- `rate-limit-handler`, `countdown-timer`, `retry-button`
- `error-404`, `back-button`, `error-message`

## 🔧 Configuración

### Variables de Entorno
```bash
# Para debugging
DEBUG_SCREENSHOTS=true

# Para CI/CD
CI=true
```

### Configuración de Playwright
- **Base URL**: `http://localhost:5173`
- **Timeout**: 15 segundos para requests
- **Retries**: 2 en CI, 0 en local
- **Workers**: 1 en CI, paralelo en local
- **Reporters**: HTML, JSON, JUnit

## 📊 Reportes

Los reportes se generan en:
- **HTML**: `playwright-report/index.html`
- **JSON**: `test-results/results.json`
- **JUnit**: `test-results/results.xml`
- **Screenshots**: `test-results/` (solo en fallos)
- **Videos**: `test-results/` (solo en fallos)

## 🐛 Debugging

### Screenshots de Debug
```bash
# Habilitar screenshots de debug
DEBUG_SCREENSHOTS=true npm run test:e2e
```

### Modo Debug
```bash
# Pausar en cada paso
npm run test:e2e:debug

# Ver browser en acción
npm run test:e2e:headed
```

### Trace Viewer
```bash
# Ver trace de pruebas fallidas
npx playwright show-trace test-results/trace.zip
```

## 🚀 CI/CD

### GitHub Actions
```yaml
- name: Install dependencies
  run: npm ci

- name: Install Playwright Browsers
  run: npx playwright install --with-deps

- name: Run Playwright tests
  run: npm run test:e2e

- name: Upload test results
  uses: actions/upload-artifact@v3
  if: always()
  with:
    name: playwright-report
    path: playwright-report/
```

## 📈 Mejores Prácticas

1. **Data Test IDs**: Usar `data-testid` en lugar de selectores CSS
2. **Esperas**: Usar `waitForSelector` en lugar de `waitForTimeout`
3. **Fixtures**: Reutilizar fixtures para datos de prueba
4. **Helpers**: Crear funciones auxiliares para operaciones comunes
5. **Mocking**: Usar `page.route()` para simular respuestas de API
6. **Responsive**: Probar en múltiples viewports
7. **Error Handling**: Probar todos los casos de error
8. **Performance**: Usar `fullyParallel: true` para velocidad

## 🔍 Troubleshooting

### Problemas Comunes

1. **Tests fallan por timeout**
   - Verificar que el servidor está corriendo en `localhost:5173`
   - Aumentar timeout en configuración
   - Verificar que no hay procesos bloqueando el puerto

2. **Elementos no encontrados**
   - Verificar que los `data-testid` están presentes
   - Usar `waitForSelector` antes de interactuar
   - Verificar que el elemento está visible

3. **Mocking no funciona**
   - Verificar que la ruta del mock coincide exactamente
   - Usar `page.unroute()` para limpiar mocks
   - Verificar que el mock se aplica antes de la navegación

4. **Screenshots no se generan**
   - Verificar que `DEBUG_SCREENSHOTS=true`
   - Verificar permisos de escritura en el directorio
   - Verificar que el directorio `debug-screenshots` existe
