import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/supergains';

// Función para obtener estadísticas de rendimiento
async function getPerformanceStats() {
    try {
        await mongoose.connect(MONGODB_URI);

        const db = mongoose.connection.db;

        // Obtener estadísticas de la base de datos
        const dbStats = await db.stats();

        // Obtener estadísticas de operaciones
        const serverStatus = await db.admin().serverStatus();

        // Obtener estadísticas de colecciones
        const collections = await db.listCollections().toArray();
        const collectionStats = {};

        for (const collection of collections) {
            try {
                const stats = await db.collection(collection.name).stats();
                collectionStats[collection.name] = {
                    count: stats.count,
                    size: stats.size,
                    avgObjSize: stats.avgObjSize,
                    storageSize: stats.storageSize,
                    totalIndexSize: stats.totalIndexSize,
                    indexSizes: stats.indexSizes
                };
            } catch (error) {
                // Si stats() no está disponible, usar count() y otros métodos
                const count = await db.collection(collection.name).countDocuments();
                collectionStats[collection.name] = {
                    count: count,
                    size: 0,
                    avgObjSize: 0,
                    storageSize: 0,
                    totalIndexSize: 0,
                    indexSizes: {}
                };
            }
        }

        // Obtener información de índices
        const indexInfo = {};
        for (const collection of collections) {
            const indexes = await db.collection(collection.name).indexes();
            indexInfo[collection.name] = indexes.map(index => ({
                name: index.name,
                key: index.key,
                unique: index.unique || false,
                sparse: index.sparse || false,
                size: index.size || 0
            }));
        }

        return {
            dbStats,
            serverStatus,
            collectionStats,
            indexInfo
        };

    } catch (error) {
        console.error('Error obteniendo estadísticas:', error);
        return null;
    } finally {
        await mongoose.disconnect();
    }
}

// Función para mostrar estadísticas formateadas
function displayStats(stats) {
    if (!stats) {
        console.log('❌ No se pudieron obtener las estadísticas');
        return;
    }

    console.log('\n📊 ESTADÍSTICAS DE RENDIMIENTO DE MONGODB');
    console.log('='.repeat(60));

    // Estadísticas generales de la base de datos
    console.log('\n🗄️  BASE DE DATOS:');
    console.log(`  - Tamaño de datos: ${(stats.dbStats.dataSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  - Tamaño de índices: ${(stats.dbStats.indexSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  - Tamaño total: ${(stats.dbStats.dataSize + stats.dbStats.indexSize) / 1024 / 1024} MB`);
    console.log(`  - Número de colecciones: ${stats.dbStats.collections}`);
    console.log(`  - Número de documentos: ${stats.dbStats.objects}`);
    console.log(`  - Número de índices: ${stats.dbStats.indexes}`);

    // Estadísticas del servidor
    console.log('\n🖥️  SERVIDOR:');
    console.log(`  - Versión: ${stats.serverStatus.version}`);
    console.log(`  - Uptime: ${Math.floor(stats.serverStatus.uptime / 60)} minutos`);
    console.log(`  - Conexiones actuales: ${stats.serverStatus.connections.current}`);
    console.log(`  - Conexiones disponibles: ${stats.serverStatus.connections.available}`);

    // Estadísticas de colecciones
    console.log('\n📁 COLECCIONES:');
    Object.entries(stats.collectionStats).forEach(([name, stats]) => {
        console.log(`\n  ${name.toUpperCase()}:`);
        console.log(`    - Documentos: ${stats.count.toLocaleString()}`);
        console.log(`    - Tamaño: ${(stats.size / 1024).toFixed(2)} KB`);
        console.log(`    - Tamaño promedio por documento: ${stats.avgObjSize.toFixed(2)} bytes`);
        console.log(`    - Tamaño de almacenamiento: ${(stats.storageSize / 1024).toFixed(2)} KB`);
        console.log(`    - Tamaño de índices: ${(stats.totalIndexSize / 1024).toFixed(2)} KB`);
        console.log(`    - Número de índices: ${Object.keys(stats.indexSizes).length}`);
    });

    // Información de índices
    console.log('\n🔍 ÍNDICES:');
    Object.entries(stats.indexInfo).forEach(([collectionName, indexes]) => {
        console.log(`\n  ${collectionName.toUpperCase()}:`);
        indexes.forEach(index => {
            const keyStr = Object.entries(index.key)
                .map(([field, direction]) => `${field}:${direction}`)
                .join(', ');
            const flags = [];
            if (index.unique) flags.push('UNIQUE');
            if (index.sparse) flags.push('SPARSE');
            const flagStr = flags.length > 0 ? ` (${flags.join(', ')})` : '';
            console.log(`    - ${index.name}: ${keyStr}${flagStr}`);
        });
    });

    // Recomendaciones de optimización
    console.log('\n💡 RECOMENDACIONES:');

    // Verificar si hay índices faltantes
    const recommendations = [];

    if (stats.collectionStats.users && stats.collectionStats.users.count > 1000) {
        recommendations.push('Considerar índices adicionales para búsquedas de usuarios');
    }

    if (stats.collectionStats.products && stats.collectionStats.products.count > 1000) {
        recommendations.push('Verificar índices de texto para búsquedas de productos');
    }

    if (stats.collectionStats.inventories && stats.collectionStats.inventories.count > 1000) {
        recommendations.push('Optimizar índices para consultas de inventario frecuentes');
    }

    // Verificar tamaño de índices vs datos
    const indexRatio = stats.dbStats.indexSize / stats.dbStats.dataSize;
    if (indexRatio > 0.5) {
        recommendations.push('El tamaño de índices es alto, revisar índices innecesarios');
    } else if (indexRatio < 0.1) {
        recommendations.push('Considerar añadir más índices para mejorar el rendimiento');
    }

    if (recommendations.length === 0) {
        console.log('  ✅ La base de datos está bien optimizada');
    } else {
        recommendations.forEach((rec, index) => {
            console.log(`  ${index + 1}. ${rec}`);
        });
    }

    // Métricas de rendimiento
    console.log('\n⚡ MÉTRICAS DE RENDIMIENTO:');
    const totalSize = stats.dbStats.dataSize + stats.dbStats.indexSize;
    const efficiency = (stats.dbStats.dataSize / totalSize) * 100;
    console.log(`  - Eficiencia de almacenamiento: ${efficiency.toFixed(1)}%`);
    console.log(`  - Ratio de índices: ${(indexRatio * 100).toFixed(1)}%`);
    console.log(`  - Documentos por colección promedio: ${Math.round(stats.dbStats.objects / stats.dbStats.collections)}`);
}

// Función principal
async function monitorPerformance() {
    console.log('🔍 Monitoreando rendimiento de MongoDB...\n');

    const stats = await getPerformanceStats();
    displayStats(stats);

    console.log('\n✅ Monitoreo completado');
}

// Ejecutar el monitoreo
monitorPerformance();
