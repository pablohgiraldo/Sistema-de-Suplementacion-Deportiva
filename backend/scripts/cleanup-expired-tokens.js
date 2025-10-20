#!/usr/bin/env node

/**
 * Script para limpiar refresh tokens expirados y revocados
 * 
 * Uso:
 * node scripts/cleanup-expired-tokens.js
 * 
 * O programar con cron:
 * 0 2 * * * node scripts/cleanup-expired-tokens.js
 */

import "dotenv/config";
import mongoose from "mongoose";
import RefreshToken from "../src/models/RefreshToken.js";

async function cleanupExpiredTokens() {
    try {
        console.log('🧹 Iniciando limpieza de refresh tokens expirados...');
        
        // Conectar a la base de datos
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI no está definido en las variables de entorno');
        }
        
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Conectado a MongoDB');

        // Ejecutar limpieza
        const result = await RefreshToken.cleanupExpiredTokens();
        
        if (result.success) {
            console.log(`✅ Limpieza completada: ${result.deletedCount} tokens eliminados`);
        } else {
            console.error('❌ Error durante la limpieza:', result.error);
            process.exit(1);
        }

    } catch (error) {
        console.error('❌ Error ejecutando limpieza:', error.message);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('👋 Desconectado de MongoDB');
    }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    cleanupExpiredTokens();
}

export default cleanupExpiredTokens;
