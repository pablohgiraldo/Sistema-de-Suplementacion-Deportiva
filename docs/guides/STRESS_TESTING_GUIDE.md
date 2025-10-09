# Guía de Pruebas de Estrés para SuperGains

## 1. Introducción
Este documento detalla las estrategias y herramientas implementadas para realizar pruebas de estrés en la aplicación SuperGains, utilizando Artillery como herramienta principal para simular carga de usuarios y evaluar el rendimiento bajo condiciones extremas.

## 2. Herramientas y Configuración

### 2.1. Artillery
**Artillery** es una herramienta de pruebas de carga y rendimiento que permite simular múltiples usuarios concurrentes realizando diferentes tipos de operaciones en la aplicación.

**Instalación:**
```bash
cd backend
npm install --save-dev artillery
```

### 2.2. Configuraciones de Pruebas

#### 2.2.1. Prueba Básica (`artillery.config.yml`)
- **Objetivo**: Evaluar el rendimiento bajo carga normal y picos moderados
- **Fases**:
  - Calentamiento (5 usuarios/min por 1 min)
  - Carga normal (10 usuarios/min por 2 min)
  - Pico de estrés (25 usuarios/min por 1 min)
  - Recuperación (5 usuarios/min por 1 min)
- **Escenarios**: Navegación básica, búsqueda, autenticación, carrito, administración

#### 2.2.2. Prueba Intensiva (`artillery-stress.yml`)
- **Objetivo**: Evaluar el rendimiento bajo carga extrema
- **Fases**:
  - Calentamiento rápido (10 usuarios/min por 30s)
  - Carga sostenida (20 usuarios/min por 3 min)
  - Estrés máximo (50 usuarios/min por 2 min)
  - Pico extremo (100 usuarios/min por 1 min)
  - Recuperación (10 usuarios/min por 1 min)
- **Escenarios**: Bombardeo de productos, autenticación masiva, carrito intensivo, inventario intensivo

#### 2.2.3. Prueba de Base de Datos (`artillery-database.yml`)
- **Objetivo**: Evaluar el rendimiento específico de operaciones de base de datos
- **Fases**:
  - Calentamiento de DB (5 usuarios/min por 1 min)
  - Carga de DB (15 usuarios/min por 3 min)
  - Estrés de DB (30 usuarios/min por 2 min)
  - Pico de DB (50 usuarios/min por 1 min)
  - Recuperación de DB (5 usuarios/min por 1 min)
- **Escenarios**: Consultas complejas, CRUD intensivo, inventario complejo, carrito con DB

## 3. Scripts de Ejecución

### 3.1. Script Principal (`run-stress-tests.js`)
Ejecuta todas las pruebas de estrés de forma secuencial y genera reportes automáticamente.

**Uso:**
```bash
npm run stress-test
```

**Características:**
- Verificación automática del servidor
- Ejecución secuencial de todas las pruebas
- Generación automática de reportes HTML
- Almacenamiento de resultados con timestamp
- Manejo de errores y logging detallado

### 3.2. Scripts Individuales
```bash
# Prueba básica
npm run stress-test:basic

# Prueba intensiva
npm run stress-test:intensive

# Prueba de base de datos
npm run stress-test:database
```

### 3.3. Monitoreo en Tiempo Real (`performance-monitor.js`)
Monitorea el rendimiento del servidor durante las pruebas de estrés.

**Uso:**
```bash
npm run performance-monitor
```

**Características:**
- Monitoreo cada 5 segundos
- Métricas de sistema (CPU, memoria, uptime)
- Métricas de MongoDB (conexiones, colecciones)
- Métricas de rendimiento (tiempo de respuesta)
- Almacenamiento de métricas en archivos JSON
- Duración configurable (por defecto 5 minutos)

## 4. Endpoints de Monitoreo

### 4.1. Endpoints de Salud (`/api/health`)
- **`GET /api/health`**: Estado general del servidor
- **`GET /api/health/database`**: Estado de la base de datos
- **`GET /api/health/performance`**: Métricas de rendimiento
- **`GET /api/health/stress`**: Endpoint de prueba de estrés

### 4.2. Métricas Disponibles
- **Sistema**: Uptime, memoria, CPU, plataforma
- **Base de datos**: Estado de conexión, colecciones, host
- **Rendimiento**: Tiempo de respuesta, carga del sistema
- **Aplicación**: Versión, ambiente, arquitectura

## 5. Escenarios de Prueba

### 5.1. Navegación Básica (30% de peso)
- Carga de página principal
- Lista de productos
- Categorías de productos
- **Objetivo**: Evaluar rendimiento de endpoints públicos

### 5.2. Búsqueda de Productos (25% de peso)
- Búsqueda aleatoria de productos
- Filtros por categoría
- **Objetivo**: Evaluar rendimiento de consultas de búsqueda

### 5.3. Autenticación de Usuario (20% de peso)
- Login de usuarios
- Obtención de perfil
- Acceso al carrito
- **Objetivo**: Evaluar rendimiento de autenticación

### 5.4. Operaciones de Carrito (15% de peso)
- Agregar productos al carrito
- Actualizar cantidades
- Eliminar productos
- **Objetivo**: Evaluar rendimiento de operaciones de carrito

### 5.5. Operaciones de Administrador (10% de peso)
- Login de administrador
- Listado de usuarios
- Gestión de inventario
- Estadísticas de inventario
- **Objetivo**: Evaluar rendimiento de operaciones administrativas

## 6. Métricas y Análisis

### 6.1. Métricas Clave
- **Tiempo de respuesta**: Latencia promedio, percentiles (50%, 95%, 99%)
- **Throughput**: Requests por segundo
- **Tasa de error**: Porcentaje de requests fallidos
- **Tiempo de conexión**: Tiempo para establecer conexión
- **Tiempo de procesamiento**: Tiempo de procesamiento del servidor

### 6.2. Umbrales de Rendimiento
- **Tiempo de respuesta**: < 200ms (objetivo), < 500ms (aceptable)
- **Tasa de error**: < 1% (objetivo), < 5% (aceptable)
- **Throughput**: > 100 req/s (objetivo), > 50 req/s (aceptable)
- **Disponibilidad**: > 99.9% (objetivo), > 99% (aceptable)

### 6.3. Análisis de Resultados
- **Reportes HTML**: Generados automáticamente por Artillery
- **Métricas JSON**: Almacenadas para análisis posterior
- **Logs de monitoreo**: Métricas en tiempo real durante las pruebas
- **Comparación**: Entre diferentes configuraciones y versiones

## 7. Mejores Prácticas

### 7.1. Preparación
- **Servidor estable**: Asegurar que el servidor esté funcionando correctamente
- **Base de datos limpia**: Usar datos de prueba consistentes
- **Recursos disponibles**: Monitorear CPU, memoria y red
- **Ambiente aislado**: Evitar interferencias de otros procesos

### 7.2. Ejecución
- **Inicio gradual**: Comenzar con cargas bajas y aumentar gradualmente
- **Monitoreo continuo**: Observar métricas durante las pruebas
- **Documentación**: Registrar condiciones y resultados
- **Reproducibilidad**: Usar configuraciones consistentes

### 7.3. Análisis
- **Múltiples ejecuciones**: Ejecutar varias veces para obtener promedios
- **Comparación**: Comparar con pruebas anteriores
- **Identificación de cuellos de botella**: Analizar endpoints problemáticos
- **Optimización**: Implementar mejoras basadas en resultados

## 8. Troubleshooting

### 8.1. Problemas Comunes
- **Servidor no responde**: Verificar que el servidor esté corriendo
- **Errores de conexión**: Verificar configuración de red y CORS
- **Timeouts**: Ajustar configuración de timeout en Artillery
- **Memoria insuficiente**: Reducir carga o aumentar recursos

### 8.2. Soluciones
- **Verificación automática**: El script verifica el estado del servidor
- **Configuración flexible**: Ajustar parámetros según necesidades
- **Logging detallado**: Información completa para debugging
- **Manejo de errores**: Continuación de pruebas a pesar de errores

## 9. Integración con CI/CD

### 9.1. Automatización
- **Ejecución automática**: Integrar en pipeline de CI/CD
- **Umbrales automáticos**: Fallar build si no se cumplen métricas
- **Reportes automáticos**: Generar reportes en cada ejecución
- **Notificaciones**: Alertas en caso de problemas

### 9.2. Configuración
```yaml
# Ejemplo de configuración para GitHub Actions
- name: Run Stress Tests
  run: |
    cd backend
    npm run stress-test
    npm run performance-monitor
```

## 10. Conclusión

Las pruebas de estrés implementadas proporcionan una evaluación completa del rendimiento de SuperGains bajo diferentes condiciones de carga. La configuración modular permite adaptar las pruebas a diferentes escenarios, mientras que el monitoreo en tiempo real y los reportes automáticos facilitan el análisis y la optimización continua del rendimiento.

**Beneficios principales:**
- Identificación temprana de cuellos de botella
- Validación de optimizaciones de rendimiento
- Garantía de escalabilidad
- Mejora continua del rendimiento
- Documentación completa de métricas y resultados
