#!/usr/bin/env node

/**
 * Script para ejecutar pruebas de estrés con Artillery
 * SuperGains - Pruebas de rendimiento
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuración
const CONFIG = {
  artilleryConfig: path.join(__dirname, '..', 'artillery.config.yml'),
  artilleryStress: path.join(__dirname, '..', 'artillery-stress.yml'),
  artilleryDatabase: path.join(__dirname, '..', 'artillery-database.yml'),
  outputDir: path.join(__dirname, '..', 'stress-test-results'),
  serverUrl: 'http://localhost:4000'
};

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Función para log con colores
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Función para verificar si el servidor está corriendo
async function checkServer() {
  try {
    const response = await fetch(CONFIG.serverUrl);
    if (response.ok) {
      log('✅ Servidor está corriendo', 'green');
      return true;
    }
  } catch (error) {
    log('❌ Servidor no está corriendo', 'red');
    log(`   Inicia el servidor con: npm run dev`, 'yellow');
    return false;
  }
}

// Función para crear directorio de resultados
function createOutputDir() {
  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
    log(`📁 Directorio de resultados creado: ${CONFIG.outputDir}`, 'blue');
  }
}

// Función para ejecutar prueba de Artillery
function runArtilleryTest(configFile, testName) {
  return new Promise((resolve, reject) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputFile = path.join(CONFIG.outputDir, `${testName}-${timestamp}.json`);
    
    log(`\n🚀 Iniciando prueba: ${testName}`, 'cyan');
    log(`   Configuración: ${configFile}`, 'blue');
    log(`   Resultados: ${outputFile}`, 'blue');
    
    const artillery = spawn('npx', ['artillery', 'run', configFile, '--output', outputFile], {
      stdio: 'inherit',
      shell: true
    });
    
    artillery.on('close', (code) => {
      if (code === 0) {
        log(`✅ Prueba completada: ${testName}`, 'green');
        resolve(outputFile);
      } else {
        log(`❌ Prueba falló: ${testName}`, 'red');
        reject(new Error(`Artillery exit code: ${code}`));
      }
    });
    
    artillery.on('error', (error) => {
      log(`❌ Error ejecutando Artillery: ${error.message}`, 'red');
      reject(error);
    });
  });
}

// Función para generar reporte HTML
function generateReport(outputFile) {
  return new Promise((resolve, reject) => {
    const reportFile = outputFile.replace('.json', '.html');
    
    log(`📊 Generando reporte HTML: ${reportFile}`, 'blue');
    
    const artillery = spawn('npx', ['artillery', 'report', outputFile, '--output', reportFile], {
      stdio: 'inherit',
      shell: true
    });
    
    artillery.on('close', (code) => {
      if (code === 0) {
        log(`✅ Reporte generado: ${reportFile}`, 'green');
        resolve(reportFile);
      } else {
        log(`❌ Error generando reporte: ${reportFile}`, 'red');
        reject(new Error(`Artillery report exit code: ${code}`));
      }
    });
    
    artillery.on('error', (error) => {
      log(`❌ Error generando reporte: ${error.message}`, 'red');
      reject(error);
    });
  });
}

// Función principal
async function main() {
  log('🎯 SuperGains - Pruebas de Estrés con Artillery', 'bright');
  log('=' .repeat(50), 'cyan');
  
  try {
    // Verificar servidor
    const serverRunning = await checkServer();
    if (!serverRunning) {
      process.exit(1);
    }
    
    // Crear directorio de resultados
    createOutputDir();
    
    // Ejecutar pruebas
    const tests = [
      { config: CONFIG.artilleryConfig, name: 'prueba-basica' },
      { config: CONFIG.artilleryStress, name: 'prueba-estres' },
      { config: CONFIG.artilleryDatabase, name: 'prueba-base-datos' }
    ];
    
    const results = [];
    
    for (const test of tests) {
      try {
        const outputFile = await runArtilleryTest(test.config, test.name);
        const reportFile = await generateReport(outputFile);
        results.push({ test: test.name, output: outputFile, report: reportFile });
      } catch (error) {
        log(`❌ Error en prueba ${test.name}: ${error.message}`, 'red');
      }
    }
    
    // Resumen final
    log('\n📋 Resumen de Pruebas de Estrés', 'bright');
    log('=' .repeat(50), 'cyan');
    
    results.forEach(result => {
      log(`✅ ${result.test}:`, 'green');
      log(`   Resultados: ${result.output}`, 'blue');
      log(`   Reporte: ${result.report}`, 'blue');
    });
    
    log('\n🎉 Pruebas de estrés completadas', 'green');
    log(`📁 Resultados guardados en: ${CONFIG.outputDir}`, 'blue');
    
  } catch (error) {
    log(`❌ Error general: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = { main, runArtilleryTest, generateReport };
