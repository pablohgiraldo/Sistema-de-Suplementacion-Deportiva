#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const colors = {
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    blue: '\x1b[34m',
    reset: '\x1b[0m',
    bold: '\x1b[1m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function getBundleStats(dir) {
    if (!fs.existsSync(dir)) {
        return null;
    }

    const assetsDir = path.join(dir, 'assets');
    if (!fs.existsSync(assetsDir)) {
        return null;
    }

    const files = fs.readdirSync(assetsDir);
    const jsFiles = files.filter(file => file.endsWith('.js'));
    const cssFiles = files.filter(file => file.endsWith('.css'));

    let totalJsSize = 0;
    let totalCssSize = 0;
    const chunks = [];

    jsFiles.forEach(file => {
        const filePath = path.join(assetsDir, file);
        const stats = fs.statSync(filePath);
        totalJsSize += stats.size;
        chunks.push({
            name: file,
            size: stats.size,
            type: 'js'
        });
    });

    cssFiles.forEach(file => {
        const filePath = path.join(assetsDir, file);
        const stats = fs.statSync(filePath);
        totalCssSize += stats.size;
        chunks.push({
            name: file,
            size: stats.size,
            type: 'css'
        });
    });

    return {
        totalJsSize,
        totalCssSize,
        totalSize: totalJsSize + totalCssSize,
        chunks,
        jsCount: jsFiles.length,
        cssCount: cssFiles.length
    };
}

function compareBundles() {
    log('🔍 Comparando bundles...', 'blue');

    const baselineDir = 'dist-baseline';
    const currentDir = 'dist';

    // Verificar que existe el build actual
    if (!fs.existsSync(currentDir)) {
        log('❌ No existe build actual. Ejecuta npm run build primero.', 'red');
        process.exit(1);
    }

    const currentStats = getBundleStats(currentDir);
    if (!currentStats) {
        log('❌ No se pudieron obtener estadísticas del build actual.', 'red');
        process.exit(1);
    }

    log('\n📊 Estadísticas del Build Actual:', 'bold');
    log(`📦 Tamaño total: ${(currentStats.totalSize / 1024).toFixed(2)} KB`, 'blue');
    log(`📄 JS: ${(currentStats.totalJsSize / 1024).toFixed(2)} KB (${currentStats.jsCount} archivos)`, 'blue');
    log(`🎨 CSS: ${(currentStats.totalCssSize / 1024).toFixed(2)} KB (${currentStats.cssCount} archivos)`, 'blue');

    // Análisis de chunks
    log('\n🔍 Análisis de Chunks:', 'bold');
    const sortedChunks = currentStats.chunks.sort((a, b) => b.size - a.size);

    sortedChunks.forEach((chunk, index) => {
        const sizeKB = (chunk.size / 1024).toFixed(2);
        const percentage = ((chunk.size / currentStats.totalSize) * 100).toFixed(1);
        const color = chunk.size > 100000 ? 'red' : chunk.size > 50000 ? 'yellow' : 'green';
        const icon = chunk.type === 'js' ? '📄' : '🎨';

        log(`  ${index + 1}. ${icon} ${chunk.name}: ${sizeKB} KB (${percentage}%)`, color);
    });

    // Comparar con baseline si existe
    if (fs.existsSync(baselineDir)) {
        const baselineStats = getBundleStats(baselineDir);
        if (baselineStats) {
            log('\n📈 Comparación con Baseline:', 'bold');

            const jsDiff = currentStats.totalJsSize - baselineStats.totalJsSize;
            const cssDiff = currentStats.totalCssSize - baselineStats.totalCssSize;
            const totalDiff = currentStats.totalSize - baselineStats.totalSize;

            const jsDiffPercent = ((jsDiff / baselineStats.totalJsSize) * 100).toFixed(1);
            const cssDiffPercent = ((cssDiff / baselineStats.totalCssSize) * 100).toFixed(1);
            const totalDiffPercent = ((totalDiff / baselineStats.totalSize) * 100).toFixed(1);

            log(`📄 JS: ${jsDiff > 0 ? '+' : ''}${(jsDiff / 1024).toFixed(2)} KB (${jsDiffPercent}%)`,
                jsDiff > 0 ? 'red' : 'green');
            log(`🎨 CSS: ${cssDiff > 0 ? '+' : ''}${(cssDiff / 1024).toFixed(2)} KB (${cssDiffPercent}%)`,
                cssDiff > 0 ? 'red' : 'green');
            log(`📦 Total: ${totalDiff > 0 ? '+' : ''}${(totalDiff / 1024).toFixed(2)} KB (${totalDiffPercent}%)`,
                totalDiff > 0 ? 'red' : 'green');
        }
    } else {
        log('\n💡 Para comparar con baseline:', 'yellow');
        log('  1. Ejecuta: npm run build', 'yellow');
        log('  2. Renombra dist a dist-baseline: mv dist dist-baseline', 'yellow');
        log('  3. Ejecuta este script nuevamente', 'yellow');
    }

    // Recomendaciones
    log('\n💡 Recomendaciones:', 'bold');

    const largeChunks = currentStats.chunks.filter(chunk => chunk.size > 100000);
    if (largeChunks.length > 0) {
        log('  ⚠️ Chunks grandes detectados:', 'yellow');
        largeChunks.forEach(chunk => {
            log(`    - ${chunk.name}: ${(chunk.size / 1024).toFixed(2)} KB`, 'yellow');
        });
        log('    Considera dividir estos chunks o implementar lazy loading', 'yellow');
    }

    if (currentStats.totalSize > 500000) {
        log('  ⚠️ Bundle total muy grande (>500KB). Considera:', 'yellow');
        log('    - Implementar más lazy loading', 'yellow');
        log('    - Optimizar imports de librerías', 'yellow');
        log('    - Usar tree shaking más agresivo', 'yellow');
    } else {
        log('  ✅ Bundle en buen tamaño', 'green');
    }

    if (currentStats.jsCount > 10) {
        log('  ⚠️ Muchos chunks JS. Considera:', 'yellow');
        log('    - Consolidar chunks pequeños', 'yellow');
        log('    - Optimizar configuración de chunks', 'yellow');
    } else {
        log('  ✅ Número de chunks apropiado', 'green');
    }

    log('\n🚀 Para análisis visual:', 'blue');
    log('  npm run analyze', 'blue');
}

// Ejecutar comparación
compareBundles();
