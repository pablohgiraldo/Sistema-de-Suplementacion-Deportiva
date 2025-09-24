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

function analyzeBundle() {
    log('🔍 Iniciando análisis de bundle...', 'blue');

    try {
        // Limpiar build anterior
        log('🧹 Limpiando build anterior...', 'yellow');
        if (fs.existsSync('dist')) {
            fs.rmSync('dist', { recursive: true });
        }

        // Build con análisis
        log('📦 Construyendo bundle con análisis...', 'yellow');
        execSync('npm run build:analyze', { stdio: 'inherit' });

        // Verificar que el archivo de análisis se creó
        const analysisFile = 'dist/bundle-analysis.html';
        if (fs.existsSync(analysisFile)) {
            log('✅ Análisis completado exitosamente!', 'green');
            log(`📊 Reporte generado en: ${analysisFile}`, 'blue');

            // Obtener estadísticas del bundle
            const statsFile = 'dist/assets';
            if (fs.existsSync(statsFile)) {
                const files = fs.readdirSync(statsFile);
                const jsFiles = files.filter(file => file.endsWith('.js'));
                const cssFiles = files.filter(file => file.endsWith('.css'));

                log('\n📈 Estadísticas del Bundle:', 'bold');
                log(`📄 Archivos JS: ${jsFiles.length}`, 'blue');
                log(`🎨 Archivos CSS: ${cssFiles.length}`, 'blue');

                // Calcular tamaños
                let totalJsSize = 0;
                let totalCssSize = 0;

                jsFiles.forEach(file => {
                    const filePath = path.join(statsFile, file);
                    const stats = fs.statSync(filePath);
                    totalJsSize += stats.size;
                });

                cssFiles.forEach(file => {
                    const filePath = path.join(statsFile, file);
                    const stats = fs.statSync(filePath);
                    totalCssSize += stats.size;
                });

                log(`📦 Tamaño total JS: ${(totalJsSize / 1024).toFixed(2)} KB`, 'green');
                log(`🎨 Tamaño total CSS: ${(totalCssSize / 1024).toFixed(2)} KB`, 'green');
                log(`📊 Tamaño total: ${((totalJsSize + totalCssSize) / 1024).toFixed(2)} KB`, 'bold');

                // Análisis de chunks
                log('\n🔍 Análisis de Chunks:', 'bold');
                jsFiles.forEach(file => {
                    const filePath = path.join(statsFile, file);
                    const stats = fs.statSync(filePath);
                    const sizeKB = (stats.size / 1024).toFixed(2);
                    const color = stats.size > 100000 ? 'red' : stats.size > 50000 ? 'yellow' : 'green';
                    log(`  📄 ${file}: ${sizeKB} KB`, color);
                });

                // Recomendaciones
                log('\n💡 Recomendaciones:', 'bold');
                if (totalJsSize > 500000) {
                    log('  ⚠️ Bundle JS muy grande (>500KB). Considera:', 'yellow');
                    log('    - Implementar más lazy loading', 'yellow');
                    log('    - Optimizar imports de librerías', 'yellow');
                    log('    - Usar tree shaking', 'yellow');
                } else {
                    log('  ✅ Bundle JS en buen tamaño', 'green');
                }

                if (totalCssSize > 100000) {
                    log('  ⚠️ CSS muy grande (>100KB). Considera:', 'yellow');
                    log('    - Purge CSS no utilizado', 'yellow');
                    log('    - Separar CSS por componentes', 'yellow');
                } else {
                    log('  ✅ CSS en buen tamaño', 'green');
                }

                // Verificar chunks grandes
                const largeChunks = jsFiles.filter(file => {
                    const filePath = path.join(statsFile, file);
                    const stats = fs.statSync(filePath);
                    return stats.size > 100000;
                });

                if (largeChunks.length > 0) {
                    log('  ⚠️ Chunks grandes detectados:', 'yellow');
                    largeChunks.forEach(file => {
                        const filePath = path.join(statsFile, file);
                        const stats = fs.statSync(filePath);
                        log(`    - ${file}: ${(stats.size / 1024).toFixed(2)} KB`, 'yellow');
                    });
                    log('    Considera dividir estos chunks', 'yellow');
                }

            }

            log('\n🚀 Para ver el análisis visual:', 'blue');
            log('  1. Abre el archivo dist/bundle-analysis.html en tu navegador', 'blue');
            log('  2. O ejecuta: npm run analyze', 'blue');

        } else {
            log('❌ Error: No se pudo generar el archivo de análisis', 'red');
            process.exit(1);
        }

    } catch (error) {
        log(`❌ Error durante el análisis: ${error.message}`, 'red');
        process.exit(1);
    }
}

// Ejecutar análisis
analyzeBundle();
