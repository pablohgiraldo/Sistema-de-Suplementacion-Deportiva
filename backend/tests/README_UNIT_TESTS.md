# Pruebas Unitarias - Backend SuperGains

## 📋 Resumen

Este directorio contiene las pruebas unitarias para el backend de SuperGains, enfocadas en las funcionalidades críticas de **CRM**, **checkout** y **recomendaciones** según el requerimiento **HU43**.

---

## 🎯 Cobertura de Pruebas

### **Controladores (Controllers)**
- ✅ **customerController.test.js** - Gestión de clientes y CRM
- ✅ **orderController.test.js** - Procesamiento de órdenes y checkout  
- ✅ **recommendationController.test.js** - Sistema de recomendaciones

### **Servicios (Services)**
- ✅ **recommendationService.test.js** - Algoritmos de recomendación
- ✅ **customerSyncService.test.js** - Sincronización de datos CRM
- ✅ **encryptionService.test.js** - Servicios de cifrado de datos

---

## 🚀 Ejecutar Pruebas

### **Comando General**
```bash
# Todas las pruebas unitarias
npm run test:unit

# Con cobertura
npm run test:coverage
```

### **Por Categorías**
```bash
# CRM - Gestión de clientes
npm run test:unit:crm

# Checkout - Procesamiento de órdenes
npm run test:unit:checkout

# Recomendaciones
npm run test:unit:recommendations

# Seguridad y cifrado
npm run test:unit:security
```

### **Por Archivos Específicos**
```bash
# Solo controladores
npm run test:unit:controllers

# Solo servicios
npm run test:unit:services

# Archivo específico
npx jest tests/controllers/customerController.test.js
```

### **Script Personalizado**
```bash
# Script con resumen detallado
node scripts/run-unit-tests.js
```

---

## 🧪 Estructura de las Pruebas

### **Patrón de Pruebas**
Cada archivo de prueba sigue la estructura:

```javascript
describe('Componente', () => {
    describe('Funcionalidad Específica', () => {
        it('debería [comportamiento esperado]', () => {
            // Arrange - Configurar datos de prueba
            // Act - Ejecutar función a probar  
            // Assert - Verificar resultados
        });
    });
});
```

### **Mocks Utilizados**
- **Modelos**: Customer, User, Order, Product, Inventory
- **Servicios**: recommendationService, webhookService, notificationService
- **Crypto**: Funciones de cifrado y hashing

---

## 📊 Casos de Prueba Cubiertos

### **CRM (Customer Controller)**
- ✅ Listado de clientes con filtros
- ✅ Búsqueda de clientes por término
- ✅ Creación de nuevos clientes
- ✅ Actualización de datos de clientes
- ✅ Segmentación de clientes
- ✅ Analytics y métricas
- ✅ Manejo de errores

### **Checkout (Order Controller)**
- ✅ Creación de órdenes desde carrito
- ✅ Validación de stock disponible
- ✅ Cálculo de totales e impuestos
- ✅ Detección de marca de tarjeta
- ✅ Actualización de estado de órdenes
- ✅ Cancelación de órdenes
- ✅ Manejo de errores de pago

### **Recomendaciones**
- ✅ Recomendaciones basadas en usuario
- ✅ Productos similares (item-based)
- ✅ Productos populares
- ✅ Productos en tendencia
- ✅ Sistema de feedback
- ✅ Algoritmos de similitud

### **Seguridad**
- ✅ Cifrado AES-256-GCM
- ✅ Descifrado de datos
- ✅ Cifrado de objetos complejos
- ✅ Validación de claves
- ✅ Manejo de errores de cifrado

---

## 🛠️ Configuración

### **Variables de Entorno de Prueba**
```bash
NODE_ENV=test
MONGODB_URI=mongodb://localhost:27017/supergains_test
JWT_SECRET=test-jwt-secret-key-for-testing-only
ENCRYPTION_KEY=test-encryption-key-base64-32-bytes-long===
```

### **Setup Automático**
- ✅ Conexión a BD de test
- ✅ Limpieza entre pruebas
- ✅ Mocks configurados
- ✅ Timeouts apropiados

---

## 📈 Métricas y Coverage

### **Objetivos de Cobertura**
- **Líneas de código**: > 80%
- **Funciones**: > 90%
- **Branches**: > 75%

### **Verificar Cobertura**
```bash
npm run test:coverage
```

Los reportes se generan en:
- `coverage/lcov-report/index.html` (navegador)
- `coverage/lcov.info` (CI/CD)

---

## 🐛 Debugging

### **Ejecutar Prueba Específica**
```bash
# Con verbose para debugging
npx jest tests/controllers/customerController.test.js --verbose

# En modo watch para desarrollo
npm run test:watch
```

### **Logs de Debug**
```javascript
// En pruebas, usar console.log temporalmente
console.log('Debug info:', mockData);
```

---

## 🔄 Integración CI/CD

### **Scripts para CI**
```bash
# Para GitHub Actions, Jenkins, etc.
npm run test:unit
npm run test:coverage
```

### **Umbrales de Coverage**
Configurado en `jest.config.js`:
```javascript
coverageThreshold: {
    global: {
        branches: 75,
        functions: 90,
        lines: 80,
        statements: 80
    }
}
```

---

## 📚 Mejores Prácticas

### **✅ Hacer:**
- Usar nombres descriptivos para tests
- Seguir el patrón AAA (Arrange, Act, Assert)
- Mockear dependencias externas
- Limpiar mocks entre pruebas
- Probar casos edge y errores

### **❌ Evitar:**
- Tests que dependan entre sí
- Mocks excesivamente complejos
- Datos de prueba hardcodeados en múltiples lugares
- Tests que no sean determinísticos

---

## 🔗 Referencias

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [SuperGains Testing Guide](../docs/testing/README.md)

---

**Última actualización**: Enero 2025  
**Mantenido por**: Equipo de Desarrollo SuperGains
