# SuperGains - Monorepo

Este es un monorepo que contiene tanto el frontend como el backend de la aplicación SuperGains.

## Estructura del Proyecto

```
supergains/
├── frontend/          # Aplicación React con Vite
├── backend/           # API Express con MongoDB
├── package.json       # Configuración del monorepo
└── README.md         # Este archivo
```

## Requisitos Previos

- Node.js >= 18.0.0
- npm >= 8.0.0
- MongoDB (para el backend)

## Instalación

1. **Instalar dependencias del monorepo:**
   ```bash
   npm run install:all
   ```

2. **O instalar por separado:**
   ```bash
   npm install
   npm install --workspace=frontend
   npm install --workspace=backend
   ```

## Scripts Disponibles

### Scripts del Monorepo (desde la raíz)

- **`npm run dev`** - Ejecuta frontend y backend en modo desarrollo
- **`npm run dev:frontend`** - Solo frontend en modo desarrollo
- **`npm run dev:backend`** - Solo backend en modo desarrollo
- **`npm run build`** - Construye todos los proyectos
- **`npm run start`** - Inicia el backend en producción
- **`npm run seed`** - Ejecuta el script de seed de la base de datos

### Scripts Individuales

#### Frontend
- `npm run dev --workspace=frontend` - Modo desarrollo
- `npm run build --workspace=frontend` - Construir para producción
- `npm run preview --workspace=frontend` - Vista previa de producción

#### Backend
- `npm run dev --workspace=backend` - Modo desarrollo con nodemon
- `npm run start --workspace=backend` - Modo producción
- `npm run seed --workspace=backend` - Poblar base de datos

## Desarrollo

Para desarrollo local, ejecuta ambos servicios:

```bash
npm run dev
```

Esto iniciará:
- Frontend en `http://localhost:5173` (Vite)
- Backend en `http://localhost:3000` (Express)

## Construcción

Para construir todos los proyectos para producción:

```bash
npm run build
```

## Tecnologías

- **Frontend**: React 19, Vite, Tailwind CSS
- **Backend**: Express.js, MongoDB, Mongoose
- **Monorepo**: npm Workspaces, Concurrently
