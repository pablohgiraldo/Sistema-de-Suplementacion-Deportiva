#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync, copyFileSync } from 'fs';
import { join } from 'path';

console.log('🚀 Configurando monorepo SuperGains...\n');

// Verificar si existe .env
if (!existsSync('.env')) {
    console.log('📝 Creando archivo .env desde env.example...');
    try {
        copyFileSync('env.example', '.env');
        console.log('✅ Archivo .env creado exitosamente');
    } catch (error) {
        console.log('⚠️  No se pudo crear .env automáticamente. Por favor, copia env.example a .env manualmente');
    }
}

// Instalar dependencias del monorepo
console.log('\n📦 Instalando dependencias del monorepo...');
try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dependencias del monorepo instaladas');
} catch (error) {
    console.log('❌ Error instalando dependencias del monorepo');
    process.exit(1);
}

// Instalar dependencias de frontend
console.log('\n📦 Instalando dependencias de frontend...');
try {
    execSync('npm install --workspace=frontend', { stdio: 'inherit' });
    console.log('✅ Dependencias de frontend instaladas');
} catch (error) {
    console.log('❌ Error instalando dependencias de frontend');
    process.exit(1);
}

// Instalar dependencias de backend
console.log('\n📦 Instalando dependencias de backend...');
try {
    execSync('npm install --workspace=backend', { stdio: 'inherit' });
    console.log('✅ Dependencias de backend instaladas');
} catch (error) {
    console.log('❌ Error instalando dependencias de backend');
    process.exit(1);
}

console.log('\n🎉 ¡Monorepo configurado exitosamente!');
console.log('\n📋 Comandos disponibles:');
console.log('  npm run dev          - Ejecutar frontend y backend en desarrollo');
console.log('  npm run dev:frontend - Solo frontend en desarrollo');
console.log('  npm run dev:backend  - Solo backend en desarrollo');
console.log('  npm run build        - Construir todos los proyectos');
console.log('  npm run seed         - Poblar base de datos');
console.log('\n🚀 ¡Comienza a desarrollar!');
