# Guía de Cifrado de Datos Sensibles - SuperGains

## 📋 Introducción

Este documento describe la implementación del sistema de cifrado para datos sensibles en SuperGains, cumpliendo con los estándares GDPR y mejores prácticas de seguridad.

---

## 🔐 Arquitectura del Sistema de Cifrado

### **Algoritmo Utilizado**
- **Algoritmo:** AES-256-GCM (Advanced Encryption Standard)
- **Longitud de clave:** 256 bits (32 bytes)
- **Modo:** GCM (Galois/Counter Mode) - proporciona autenticación y confidencialidad
- **Derivación de clave:** PBKDF2 con SHA-512 y 100,000 iteraciones

### **Componentes del Sistema**

#### 1. **Servicio de Cifrado** (`encryptionService.js`)
- Funciones principales: `encrypt()`, `decrypt()`
- Validación de claves y configuración
- Detección automática de datos cifrados
- Manejo de errores robusto

#### 2. **Middleware de Mongoose** (`encryptionMiddleware.js`)
- Cifrado automático antes de guardar (`pre-save`)
- Descifrado automático después de consultas (`post-find`)
- Soporte para campos anidados (ej: `contactInfo.phone`)
- Métodos de descifrado manual

#### 3. **Configuración por Modelo**
- **User:** `nombre`
- **Customer:** `contactInfo.*`, `birthDate`, `notes`
- **Order:** `shippingAddress.*`, `billingAddress.*`, `paymentDetails.*`

---

## 🛠️ Configuración

### **Variables de Entorno**

```bash
# Clave de cifrado (OBLIGATORIA)
ENCRYPTION_KEY=TU_CLAVE_BASE64_AQUI
```

### **Generar Clave de Cifrado**

```bash
# Generar una nueva clave
node scripts/generate-encryption-key.js

# Generar para producción
node scripts/generate-encryption-key.js --env=production
```

### **Formato de la Clave**
- **Tipo:** Base64
- **Longitud:** 32 bytes (256 bits)
- **Ejemplo:** `xK8v2mP9nQ4sR7tU1wZ5eA3bC6dF8gH0jK2lM4nP7qS0uV3wY6z`

---

## 📊 Campos Cifrados

### **Modelo User**
```javascript
const sensitiveFields = ['nombre'];
// El email se mantiene sin cifrar para búsquedas
```

### **Modelo Customer**
```javascript
const sensitiveCustomerFields = [
    'contactInfo.phone',
    'contactInfo.alternativeEmail',
    'contactInfo.address.street',
    'contactInfo.address.city',
    'contactInfo.address.state',
    'contactInfo.address.zipCode',
    'birthDate',
    'notes'
];
```

### **Modelo Order**
```javascript
const sensitiveOrderFields = [
    // Direcciones de envío
    'shippingAddress.firstName',
    'shippingAddress.lastName',
    'shippingAddress.street',
    'shippingAddress.city',
    'shippingAddress.state',
    'shippingAddress.zipCode',
    'shippingAddress.phone',
    
    // Direcciones de facturación
    'billingAddress.firstName',
    'billingAddress.lastName',
    'billingAddress.street',
    'billingAddress.city',
    'billingAddress.state',
    'billingAddress.zipCode',
    'billingAddress.phone',
    
    // Datos de pago
    'paymentDetails.cardLastFour',
    'paymentDetails.transactionId'
];
```

---

## 🔧 Uso del Sistema

### **Cifrado Automático**

El sistema cifra automáticamente los campos sensibles cuando se guardan documentos:

```javascript
// Al crear un usuario, el nombre se cifra automáticamente
const user = new User({
    nombre: 'Juan Pérez',  // Se cifra automáticamente
    email: 'juan@email.com' // Se mantiene sin cifrar
});
await user.save();
```

### **Descifrado Automático**

Los datos se descifran automáticamente al hacer consultas:

```javascript
// Al consultar, los datos se descifran automáticamente
const user = await User.findById(userId);
console.log(user.nombre); // 'Juan Pérez' (descifrado automáticamente)
```

### **Descifrado Manual**

Para casos especiales, se puede descifrar manualmente:

```javascript
const user = await User.findById(userId);
const decryptedData = user.decryptSensitiveFields();
console.log(decryptedData.nombre);
```

### **Cifrado/Descifrado Programático**

```javascript
import { encrypt, decrypt } from '../services/encryptionService.js';

// Cifrar datos manualmente
const encryptedData = encrypt('Dato sensible');

// Descifrar datos manualmente
const decryptedData = decrypt(encryptedData);
```

---

## 🚨 Consideraciones de Seguridad

### **Gestión de Claves**

1. **Nunca commitees la clave a Git**
2. **Usa diferentes claves para desarrollo/producción**
3. **Guarda la clave en un lugar seguro**
4. **Considera usar un gestor de secretos en producción**

### **Datos Existentes**

⚠️ **IMPORTANTE:** Si cambias la clave de cifrado después de tener datos en la base de datos, **NO PODRÁS DESCIFRAR los datos existentes**.

### **Migración de Datos**

Para migrar datos existentes a cifrado:

1. Genera la nueva clave
2. Crea un script de migración
3. Descifra con la clave antigua (si existe)
4. Cifra con la nueva clave
5. Actualiza la configuración

---

## 🔍 Monitoreo y Logging

### **Logs de Cifrado**

El sistema registra errores de cifrado en la consola:

```javascript
// Ejemplos de logs
console.error('Error cifrando datos:', error);
console.error(`Error cifrando campo ${fieldPath}:`, error);
```

### **Detección de Errores**

El sistema maneja errores gracefully:
- Si no puede cifrar, mantiene el valor original
- Si no puede descifrar, logea el error pero no rompe la aplicación
- Valida la clave de cifrado al inicio

---

## 🧪 Testing

### **Probar el Sistema**

```javascript
// Test básico de cifrado
import { encrypt, decrypt } from '../services/encryptionService.js';

const testData = 'Dato de prueba';
const encrypted = encrypt(testData);
const decrypted = decrypt(encrypted);

console.assert(testData === decrypted, 'Cifrado/descifrado funciona');
console.assert(encrypted !== testData, 'Los datos están cifrados');
```

### **Verificar Implementación**

```bash
# Verificar que los modelos cargan correctamente
node -e "
import User from './src/models/User.js';
import Customer from './src/models/Customer.js';
import Order from './src/models/Order.js';
console.log('✅ Modelos cargados correctamente');
"
```

---

## 📋 Checklist de Implementación

### **Configuración Inicial**
- [ ] Generar clave de cifrado con `generate-encryption-key.js`
- [ ] Agregar `ENCRYPTION_KEY` al archivo `.env`
- [ ] Verificar que no se commit la clave a Git
- [ ] Reiniciar el servidor para cargar nueva configuración

### **Verificación**
- [ ] Crear un usuario de prueba
- [ ] Verificar que el nombre se cifra en la base de datos
- [ ] Consultar el usuario y verificar descifrado automático
- [ ] Probar con diferentes modelos (Customer, Order)

### **Producción**
- [ ] Usar un gestor de secretos (AWS Secrets Manager, etc.)
- [ ] Configurar rotación automática de claves
- [ ] Activar auditoría de acceso a secretos
- [ ] Backup seguro de la clave de cifrado

---

## 🆘 Troubleshooting

### **Error: "ENCRYPTION_KEY no está definido"**

```
Error: ENCRYPTION_KEY no está definido. No se puede cifrar/descifrar datos.
```

**Solución:**
1. Agregar `ENCRYPTION_KEY` al archivo `.env`
2. Generar nueva clave si no existe
3. Reiniciar el servidor

### **Error: "Error al descifrar datos sensibles"**

```
Error: Error al descifrar datos sensibles: Invalid authentication tag
```

**Posibles causas:**
1. Clave de cifrado incorrecta
2. Datos corruptos
3. Formato de datos inválido

**Solución:**
1. Verificar la clave de cifrado
2. Verificar integridad de los datos
3. Revisar logs para más detalles

### **Datos no se cifran**

**Verificar:**
1. Middleware aplicado correctamente al modelo
2. Campos definidos en `encryptFields`
3. Documento marcado como modificado (`isModified()`)
4. Clave de cifrado configurada correctamente

---

## 📚 Referencias

- [AES-GCM Wikipedia](https://en.wikipedia.org/wiki/Galois/Counter_Mode)
- [PBKDF2 RFC 2898](https://tools.ietf.org/html/rfc2898)
- [GDPR Encryption Requirements](https://gdpr-info.eu/art-32-gdpr/)
- [OWASP Cryptographic Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html)

---

## 🔄 Mantenimiento

### **Rotación de Claves** (Recomendado: Anualmente)

1. Generar nueva clave
2. Crear script de migración
3. Probar en entorno de desarrollo
4. Ejecutar en producción durante ventana de mantenimiento
5. Actualizar configuración
6. Eliminar clave antigua de forma segura

### **Monitoreo Regular**

- Verificar logs de errores de cifrado
- Auditar acceso a datos sensibles
- Revisar cumplimiento GDPR
- Actualizar documentación según cambios

---

**Última actualización:** Octubre 2025  
**Responsable:** Equipo de Seguridad SuperGains
