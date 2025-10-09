# Guía del Sistema de Notificaciones por Email

Este documento detalla la implementación y configuración del sistema de notificaciones por email para SuperGains usando Nodemailer.

## 🎯 Objetivo

Implementar un sistema completo de notificaciones por email para alertas de inventario, permitiendo a los administradores recibir notificaciones automáticas cuando el stock de productos alcanza umbrales críticos.

## 🚀 Funcionalidades Implementadas

### 1. **Configuración de Email (Nodemailer)**

#### **Archivo: `backend/src/config/email.js`**
- **Transporter configurado** para Gmail y otros proveedores SMTP
- **Verificación de configuración** automática
- **Templates HTML** para diferentes tipos de notificaciones
- **Manejo de errores** robusto

#### **Características:**
- ✅ Soporte para Gmail con App Passwords
- ✅ Soporte para proveedores SMTP personalizados
- ✅ Templates HTML responsivos y profesionales
- ✅ Verificación automática de configuración
- ✅ Manejo de errores y reintentos

### 2. **Servicio de Notificaciones**

#### **Archivo: `backend/src/services/notificationService.js`**
- **Cola de notificaciones** para procesamiento asíncrono
- **Procesamiento inteligente** de alertas
- **Integración completa** con el sistema de alertas
- **Estado del servicio** en tiempo real

#### **Características:**
- ✅ Cola de notificaciones asíncrona
- ✅ Procesamiento por lotes
- ✅ Integración con AlertConfig
- ✅ Verificación de frecuencia de envío
- ✅ Estado del servicio en tiempo real

### 3. **Controlador de Notificaciones**

#### **Archivo: `backend/src/controllers/notificationController.js`**
- **Endpoints RESTful** para gestión de notificaciones
- **Verificación de configuración** de email
- **Envío de emails de prueba**
- **Procesamiento de alertas** masivo

#### **Endpoints disponibles:**
- `GET /api/notifications/verify` - Verificar configuración de email
- `GET /api/notifications/status` - Estado del servicio
- `POST /api/notifications/test` - Enviar email de prueba
- `POST /api/notifications/process-alerts` - Procesar todas las alertas
- `POST /api/notifications/send-alert` - Enviar alerta específica
- `POST /api/notifications/send-summary` - Enviar resumen de alertas

### 4. **Tipos de Notificaciones**

#### **A. Email de Prueba**
- **Propósito**: Verificar configuración de email
- **Contenido**: Información básica del sistema
- **Uso**: Testing y verificación

#### **B. Alerta de Stock Individual**
- **Propósito**: Notificar sobre un producto específico con stock bajo
- **Contenido**: 
  - Información del producto (imagen, nombre, marca)
  - Detalles del inventario actual
  - Alertas específicas (bajo, crítico, agotado)
  - Información de thresholds
  - Recomendaciones de acción

#### **C. Resumen de Alertas**
- **Propósito**: Vista general de todas las alertas activas
- **Contenido**:
  - Estadísticas generales (total, críticas, errores, advertencias)
  - Lista de productos con alertas
  - Recomendaciones generales

## 🔧 Configuración

### **Variables de Entorno Requeridas**

```env
# Email del administrador
ADMIN_EMAIL=admin@supergains.com

# Habilitar notificaciones
EMAIL_NOTIFICATIONS_ENABLED=true

# Configuración de Gmail
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-app-password

# Configuración SMTP personalizada (opcional)
SMTP_HOST=smtp.tu-proveedor.com
SMTP_PORT=587
SMTP_SECURE=false
```

### **Configuración de Gmail (Recomendado)**

1. **Activar verificación en 2 pasos** en tu cuenta de Google
2. **Ir a** https://myaccount.google.com/apppasswords
3. **Generar App Password** para "Mail"
4. **Usar la contraseña de 16 caracteres** como `EMAIL_PASS`
5. **Usar tu email de Gmail** como `EMAIL_USER`

### **Configuración de Otros Proveedores**

#### **Outlook/Hotmail:**
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
```

#### **Yahoo:**
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_SECURE=false
```

## 📧 Templates de Email

### **1. Email de Prueba**
- **Diseño**: Simple y limpio
- **Contenido**: Información del sistema y timestamp
- **Uso**: Verificación de configuración

### **2. Alerta de Stock Individual**
- **Diseño**: Profesional con colores por severidad
- **Contenido**:
  - Header con nivel de severidad
  - Información del producto con imagen
  - Detalles de la alerta
  - Información del inventario
  - Recomendaciones de acción
- **Colores**:
  - Crítico: Rojo (`#dc2626`)
  - Error: Naranja (`#ea580c`)
  - Advertencia: Amarillo (`#f59e0b`)

### **3. Resumen de Alertas**
- **Diseño**: Dashboard-style con estadísticas
- **Contenido**:
  - Estadísticas generales en grid
  - Lista de productos con alertas
  - Recomendaciones generales
- **Layout**: Responsive y profesional

## 🧪 Pruebas

### **Script de Prueba Completa**
```bash
npm run test-email-notifications
```

### **Funcionalidades Probadas:**
- ✅ Verificación de configuración de email
- ✅ Envío de email de prueba
- ✅ Creación de datos de prueba
- ✅ Envío de alerta individual
- ✅ Procesamiento masivo de alertas
- ✅ Cola de notificaciones
- ✅ Integración con sistema de alertas

### **Pruebas Manuales:**
```bash
# Verificar configuración
curl -H "Authorization: Bearer TOKEN" http://localhost:4000/api/notifications/verify

# Enviar email de prueba
curl -X POST -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" \
  -d '{"email":"admin@supergains.com","subject":"Prueba"}' \
  http://localhost:4000/api/notifications/test

# Procesar todas las alertas
curl -X POST -H "Authorization: Bearer TOKEN" \
  http://localhost:4000/api/notifications/process-alerts
```

## 🔄 Flujo de Notificaciones

### **1. Detección de Alerta**
1. Sistema detecta stock bajo en inventario
2. Verifica configuración de alerta del producto
3. Valida frecuencia de envío
4. Agrega notificación a la cola

### **2. Procesamiento**
1. Servicio de notificaciones procesa la cola
2. Obtiene datos completos del producto e inventario
3. Genera template HTML apropiado
4. Envía email usando Nodemailer

### **3. Seguimiento**
1. Actualiza timestamp de última alerta enviada
2. Registra resultado del envío
3. Maneja errores y reintentos

## 📊 Monitoreo

### **Estado del Servicio**
```javascript
{
  enabled: true,
  queueLength: 0,
  processing: false,
  adminEmail: "admin@supergains.com",
  emailConfigured: true
}
```

### **Métricas Disponibles**
- Número de notificaciones en cola
- Estado de procesamiento
- Configuración de email
- Email del administrador

## 🚨 Manejo de Errores

### **Errores Comunes:**
1. **Configuración de email incorrecta**
   - Verificar EMAIL_USER y EMAIL_PASS
   - Verificar App Password de Gmail

2. **Proveedor SMTP no disponible**
   - Verificar SMTP_HOST y SMTP_PORT
   - Verificar credenciales

3. **Email del administrador no válido**
   - Verificar formato de ADMIN_EMAIL
   - Verificar que el email existe

### **Logs de Debugging:**
- ✅ Configuración verificada
- ✅ Email enviado exitosamente
- ❌ Error en configuración
- ❌ Error enviando email

## 🔒 Seguridad

### **Mejores Prácticas:**
- ✅ Usar App Passwords, no contraseñas normales
- ✅ Variables de entorno para credenciales
- ✅ Validación de emails de destino
- ✅ Rate limiting en endpoints
- ✅ Autenticación requerida para todos los endpoints

### **Variables Sensibles:**
- `EMAIL_PASS` - Nunca commitear al repositorio
- `EMAIL_USER` - Usar variable de entorno
- `ADMIN_EMAIL` - Configurar en producción

## 📈 Rendimiento

### **Optimizaciones Implementadas:**
- ✅ Cola de notificaciones asíncrona
- ✅ Procesamiento por lotes
- ✅ Templates HTML optimizados
- ✅ Manejo de errores sin bloqueo
- ✅ Verificación de configuración una sola vez

### **Límites Recomendados:**
- Máximo 100 emails por minuto
- Cola máxima de 1000 notificaciones
- Timeout de 30 segundos por email

## 🎉 Conclusión

El sistema de notificaciones por email está completamente implementado y listo para producción. Proporciona:

- ✅ **Notificaciones automáticas** para alertas de stock
- ✅ **Templates profesionales** y responsivos
- ✅ **Configuración flexible** para diferentes proveedores
- ✅ **Manejo robusto de errores**
- ✅ **Monitoreo en tiempo real**
- ✅ **Integración completa** con el sistema de alertas

El sistema está diseñado para ser escalable, confiable y fácil de mantener, proporcionando una experiencia de notificación profesional para los administradores de SuperGains.
