# 🚀 Guía de Despliegue - Backend SuperGains

## 📋 Variables de Entorno Requeridas

### En Render Dashboard, configura estas variables:

```
KEY: MONGODB_URI
VALUE: mongodb+srv://usuario:password@cluster0.abc123.mongodb.net/supergains?retryWrites=true&w=majority

KEY: JWT_SECRET
VALUE: tu_secreto_jwt_muy_seguro_aqui

KEY: CORS_ORIGIN
VALUE: https://tu-frontend.vercel.app

KEY: NODE_ENV
VALUE: production

KEY: PORT
VALUE: 10000
```

## 🔍 Cómo Obtener la URI de MongoDB

1. Ve a [cloud.mongodb.com](https://cloud.mongodb.com)
2. Login en tu cuenta
3. Selecciona tu cluster
4. Click en "Connect"
5. Selecciona "Connect your application"
6. Copia la URI completa

## 🧪 Pruebas Locales

### Antes de deployar, prueba localmente:

```bash
# Instalar dependencias
npm install

# Crear archivo .env con tus variables
cp env.example .env
# Edita .env con tus valores reales

# Probar conexión a MongoDB
npm run test:mongodb

# Probar servidor local
npm run dev
```

## ⚠️ Problemas Comunes

### Error: ENOTFOUND _mongodb._tcp.supergains.mongodb.net
- **Solución:** La URI debe incluir el nombre completo del cluster
- **Ejemplo correcto:** `mongodb+srv://usuario:password@cluster0.abc123.mongodb.net/supergains`

### Error: Authentication failed
- **Solución:** Verifica usuario y contraseña en MongoDB Atlas
- **Verifica:** Database Access > Usuario tiene permisos de lectura/escritura

### Error: Network Access denied
- **Solución:** En MongoDB Atlas > Network Access > Add IP Address > 0.0.0.0/0

## ✅ Checklist de Despliegue

- [ ] Variables de entorno configuradas en Render
- [ ] MongoDB URI es correcta y accesible
- [ ] CORS_ORIGIN apunta a tu frontend
- [ ] Build Command: `npm install`
- [ ] Start Command: `npm start`
- [ ] Branch: `develop` (o la rama donde esté tu código)
- [ ] Root Directory: `backend`

## ⚠️ **ERROR IDENTIFICADO:**

El error `CRYPT_E_NO_REVOCATION_CHECK` es un problema de certificados SSL en Windows, no de tu backend.

---

## 🔧 **SOLUCIÓN 1: IGNORAR VERIFICACIÓN SSL (RÁPIDA)**

```bash
<code_block_to_apply_changes_from>
```

---

## 🔧 **SOLUCIÓN 2: USAR POWERSHELL (RECOMENDADA)**

```powershell
# En PowerShell, usa Invoke-WebRequest
Invoke-WebRequest -Uri "https://tu-backend-render.onrender.com/api/health"

# O más simple
Invoke-RestMethod -Uri "https://tu-backend-render.onrender.com/api/health"
```

---

## 🔧 **SOLUCIÓN 3: USAR NAVEGADOR**

1. **Abre tu navegador**
2. **Ve a:** `https://tu-backend-render.onrender.com/api/health`
3. **Deberías ver:**
```json
{
  "status": "OK",
  "message": "Server is running",
  "timestamp": "2025-01-XX..."
}
```

---

## 🔧 **SOLUCIÓN 4: USAR POSTMAN**

1. **Abre Postman**
2. **GET:** `https://tu-backend-render.onrender.com/api/health`
3. **Send**

---

## 🔧 **SOLUCIÓN 5: VERIFICAR DESDE RENDER DASHBOARD**

1. **Ve a tu Web Service en Render**
2. **Click en "Logs"**
3. **Verifica que no hay errores**
4. **Busca mensajes como:**
   - `✅ MongoDB conectado exitosamente`
   - `🚀 API escuchando en puerto 10000`

---

##  **PRUEBAS ALTERNATIVAS:**

### **Test 1: Endpoint de productos**
```bash
curl -k https://tu-backend-render.onrender.com/api/products
```

### **Test 2: Con headers**
```bash
curl -k -H "Accept: application/json" https://tu-backend-render.onrender.com/api/health
```

---

##  **VERIFICAR ESTADO DEL SERVICIO:**

### **En Render Dashboard:**
1. **Ve a tu Web Service**
2. **Verifica el estado:**
   - ✅ **Live** = Funcionando
   - ⚠️ **Building** = En construcción
   - ❌ **Failed** = Falló

3. **Click en "Logs" para ver errores**

---

## 📱 **VERIFICAR DESDE EL FRONTEND:**

### **En tu frontend (Vercel):**
1. **Abre las DevTools (F12)**
2. **Ve a Console**
3. **Verifica que no 
