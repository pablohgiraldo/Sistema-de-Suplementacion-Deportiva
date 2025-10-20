#!/usr/bin/env node

/**
 * Script para ejecutar pruebas unitarias específicas
 * Enfoque en CRM, checkout y recomendaciones (HU43)
 */

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

console.log('🧪 Ejecutando Pruebas Unitarias - HU43\n');

// Cambiar al directorio del proyecto
process.chdir(projectRoot);

const testSuites = [
    {
        name: 'CRM (Customer Management)',
        command: 'npm run test:unit:crm',
        description: 'Pruebas para gestión de clientes y CRM'
    },
    {
        name: 'Checkout (Order Management)',
        command: 'npm run test:unit:checkout',
        description: 'Pruebas para procesamiento de órdenes y checkout'
    },
    {
        name: 'Recommendations (Recommendation Engine)',
        command: 'npm run test:unit:recommendations',
        description: 'Pruebas para sistema de recomendaciones'
    },
    {
        name: 'Security (Encryption)',
        command: 'npm run test:unit:security',
        description: 'Pruebas para servicios de cifrado'
    }
];

async function runTestSuite(suite) {
    console.log(`\n📋 ${suite.name}`);
    console.log(`   ${suite.description}`);
    console.log('   ' + '─'.repeat(50));
    
    try {
        const output = execSync(suite.command, { 
            encoding: 'utf8',
            stdio: 'inherit',
            timeout: 60000 // 60 segundos timeout
        });
        
        console.log(`✅ ${suite.name} - PRUEBAS EXITOSAS\n`);
        return { success: true, suite: suite.name };
    } catch (error) {
        console.log(`❌ ${suite.name} - PRUEBAS FALLIDAS`);
        console.log(`   Error: ${error.message}\n`);
        return { success: false, suite: suite.name, error: error.message };
    }
}

async function runAllTests() {
    console.log('🎯 Iniciando pruebas unitarias para HU43\n');
    
    const results = [];
    
    for (const suite of testSuites) {
        const result = await runTestSuite(suite);
        results.push(result);
    }
    
    // Resumen final
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN DE PRUEBAS UNITARIAS');
    console.log('='.repeat(60));
    
    const successful = results.filter(r => r.success).length;
    const failed = results.length - successful;
    
    results.forEach(result => {
        const status = result.success ? '✅' : '❌';
        console.log(`${status} ${result.suite}`);
    });
    
    console.log('\n📈 ESTADÍSTICAS:');
    console.log(`   Total de suites: ${results.length}`);
    console.log(`   Exitosas: ${successful}`);
    console.log(`   Fallidas: ${failed}`);
    
    if (failed === 0) {
        console.log('\n🎉 ¡TODAS LAS PRUEBAS UNITARIAS PASARON!');
        console.log('   El sistema está listo para HU43.');
        process.exit(0);
    } else {
        console.log('\n⚠️  ALGUNAS PRUEBAS FALLARON');
        console.log('   Revisar la salida anterior para detalles.');
        process.exit(1);
    }
}

// Ejecutar todas las pruebas
runAllTests().catch(error => {
    console.error('❌ Error ejecutando pruebas:', error.message);
    process.exit(1);
});
