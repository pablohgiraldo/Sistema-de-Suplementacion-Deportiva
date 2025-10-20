#!/usr/bin/env node

/**
 * Script para generar una clave de cifrado AES-256-GCM
 * 
 * Uso:
 * node scripts/generate-encryption-key.js
 */

import crypto from 'crypto';

// Parsear argumentos simples desde process.argv
const args = process.argv.slice(2);
const environment = args.includes('--env=production') ? 'production' : 'development';
const countArg = args.find(arg => arg.startsWith('--count='));
const count = countArg ? parseInt(countArg.split('=')[1]) || 1 : 1;

function generateEncryptionKey() {
    // Generar 32 bytes aleatorios (256 bits)
    const key = crypto.randomBytes(32);
    
    // Convertir a base64 para almacenamiento seguro
    return key.toString('base64');
}

function generateKeyWithMetadata() {
    const key = generateEncryptionKey();
    const timestamp = new Date().toISOString();
    const keyId = crypto.randomBytes(8).toString('hex');
    
    return {
        key,
        keyId,
        timestamp,
        algorithm: 'AES-256-GCM',
        usage: 'Encryption of sensitive data (GDPR compliance)'
    };
}

console.log('🔐 Generador de Claves de Cifrado - SuperGains\n');

// Los valores ya están parseados arriba

console.log(`📋 Configuración:`);
console.log(`   Entorno: ${environment}`);
console.log(`   Cantidad: ${count} clave(s)\n`);

console.log('🛡️  IMPORTANTE:');
console.log('   - Guarda estas claves en un lugar SEGURO');
console.log('   - NUNCA las commits a git');
console.log('   - Usa diferentes claves para desarrollo/producción');
console.log('   - Las claves deben tener 32 bytes (256 bits)');
console.log('   - Formato: Base64\n');

if (count === 1) {
    const keyData = generateKeyWithMetadata();
    
    console.log('🔑 Clave generada:');
    console.log(`   Key ID: ${keyData.keyId}`);
    console.log(`   Timestamp: ${keyData.timestamp}`);
    console.log(`   Algorithm: ${keyData.algorithm}`);
    console.log(`   Usage: ${keyData.usage}`);
    console.log('\n📝 Variable de entorno:');
    console.log(`ENCRYPTION_KEY=${keyData.key}`);
    
} else {
    const keys = [];
    
    for (let i = 0; i < count; i++) {
        keys.push(generateKeyWithMetadata());
    }
    
    console.log('🔑 Claves generadas:\n');
    
    keys.forEach((keyData, index) => {
        console.log(`   ${index + 1}. Key ID: ${keyData.keyId}`);
        console.log(`      Timestamp: ${keyData.timestamp}`);
        console.log(`      ENCRYPTION_KEY=${keyData.key}\n`);
    });
}

console.log('📋 Instrucciones de configuración:');
console.log('   1. Copia la clave generada');
console.log('   2. Agrega ENCRYPTION_KEY=<clave> a tu archivo .env');
console.log('   3. Reinicia el servidor');
console.log('   4. ¡Los datos sensibles se cifrarán automáticamente!\n');

console.log('⚠️  ADVERTENCIAS:');
console.log('   - Si cambias la clave, los datos existentes NO se podrán descifrar');
console.log('   - Hacer backup de la clave antes de cambios importantes');
console.log('   - En producción, usa un sistema de gestión de secretos');
console.log('   - Considera rotación periódica de claves\n');

if (environment === 'production') {
    console.log('🚨 CONFIGURACIÓN DE PRODUCCIÓN:');
    console.log('   - Usa un gestor de secretos (AWS Secrets Manager, Azure Key Vault, etc.)');
    console.log('   - No uses la misma clave en diferentes entornos');
    console.log('   - Configura rotación automática de claves');
    console.log('   - Activa auditoría de acceso a secretos\n');
}

console.log('✅ ¡Clave(s) generada(s) exitosamente!');
