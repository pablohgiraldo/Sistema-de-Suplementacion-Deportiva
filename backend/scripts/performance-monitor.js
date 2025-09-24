#!/usr/bin/env node

/**
 * Script de monitoreo de rendimiento en tiempo real
 * SuperGains - Monitoreo durante pruebas de estrés
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuración
const CONFIG = {
  serverUrl: 'http://localhost:4000',
  outputDir: path.join(__dirname, '..', 'performance-monitoring'),
  interval: 5000, // 5 segundos
  duration: 300000 // 5 minutos
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

// Función para obtener métricas del sistema
async function getSystemMetrics() {
  try {
    const response = await fetch(`${CONFIG.serverUrl}/api/health`);
    if (response.ok) {
      const data = await response.json();
      return data;
    }
  } catch (error) {
    log(`❌ Error obteniendo métricas: ${error.message}`, 'red');
    return null;
  }
}

// Función para obtener métricas de MongoDB
async function getMongoMetrics() {
  try {
    const response = await fetch(`${CONFIG.serverUrl}/api/inventory/stats`);
    if (response.ok) {
      const data = await response.json();
      return data;
    }
  } catch (error) {
    log(`❌ Error obteniendo métricas de MongoDB: ${error.message}`, 'red');
    return null;
  }
}

// Función para obtener métricas de rendimiento
async function getPerformanceMetrics() {
  try {
    const response = await fetch(`${CONFIG.serverUrl}/api/products`);
    const startTime = Date.now();
    
    if (response.ok) {
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      return {
        responseTime,
        status: response.status,
        timestamp: new Date().toISOString()
      };
    }
  } catch (error) {
    log(`❌ Error obteniendo métricas de rendimiento: ${error.message}`, 'red');
    return null;
  }
}

// Función para crear directorio de monitoreo
function createMonitoringDir() {
  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
    log(`📁 Directorio de monitoreo creado: ${CONFIG.outputDir}`, 'blue');
  }
}

// Función para guardar métricas
function saveMetrics(metrics) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = path.join(CONFIG.outputDir, `metrics-${timestamp}.json`);
  
  fs.writeFileSync(filename, JSON.stringify(metrics, null, 2));
  log(`💾 Métricas guardadas: ${filename}`, 'blue');
}

// Función para mostrar métricas en consola
function displayMetrics(metrics) {
  log('\n📊 Métricas de Rendimiento', 'bright');
  log('=' .repeat(40), 'cyan');
  
  if (metrics.system) {
    log(`🖥️  Sistema:`, 'blue');
    log(`   Uptime: ${metrics.system.uptime}s`, 'green');
    log(`   Memory: ${metrics.system.memory}MB`, 'green');
    log(`   CPU: ${metrics.system.cpu}%`, 'green');
  }
  
  if (metrics.mongo) {
    log(`🗄️  MongoDB:`, 'blue');
    log(`   Total productos: ${metrics.mongo.totalProducts}`, 'green');
    log(`   Stock bajo: ${metrics.mongo.lowStockCount}`, 'yellow');
    log(`   Stock total: ${metrics.mongo.totalStock}`, 'green');
  }
  
  if (metrics.performance) {
    log(`⚡ Rendimiento:`, 'blue');
    log(`   Tiempo de respuesta: ${metrics.performance.responseTime}ms`, 'green');
    log(`   Status: ${metrics.performance.status}`, 'green');
    log(`   Timestamp: ${metrics.performance.timestamp}`, 'blue');
  }
}

// Función principal de monitoreo
async function startMonitoring() {
  log('🎯 SuperGains - Monitoreo de Rendimiento en Tiempo Real', 'bright');
  log('=' .repeat(60), 'cyan');
  
  createMonitoringDir();
  
  let startTime = Date.now();
  let intervalId;
  
  const monitor = async () => {
    const currentTime = Date.now();
    const elapsed = currentTime - startTime;
    
    log(`\n⏱️  Tiempo transcurrido: ${Math.floor(elapsed / 1000)}s`, 'yellow');
    
    // Obtener métricas
    const systemMetrics = await getSystemMetrics();
    const mongoMetrics = await getMongoMetrics();
    const performanceMetrics = await getPerformanceMetrics();
    
    const metrics = {
      timestamp: new Date().toISOString(),
      elapsed: elapsed,
      system: systemMetrics,
      mongo: mongoMetrics,
      performance: performanceMetrics
    };
    
    // Mostrar métricas
    displayMetrics(metrics);
    
    // Guardar métricas
    saveMetrics(metrics);
    
    // Verificar si hemos alcanzado la duración máxima
    if (elapsed >= CONFIG.duration) {
      log('\n⏰ Duración máxima alcanzada, deteniendo monitoreo...', 'yellow');
      clearInterval(intervalId);
      process.exit(0);
    }
  };
  
  // Ejecutar monitoreo inicial
  await monitor();
  
  // Configurar intervalo
  intervalId = setInterval(monitor, CONFIG.interval);
  
  // Manejar señales de terminación
  process.on('SIGINT', () => {
    log('\n🛑 Deteniendo monitoreo...', 'yellow');
    clearInterval(intervalId);
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    log('\n🛑 Deteniendo monitoreo...', 'yellow');
    clearInterval(intervalId);
    process.exit(0);
  });
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  startMonitoring();
}

module.exports = { startMonitoring, getSystemMetrics, getMongoMetrics, getPerformanceMetrics };
