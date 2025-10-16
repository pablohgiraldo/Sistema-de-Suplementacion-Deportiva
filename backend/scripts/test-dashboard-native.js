/**
 * Script de prueba para el Dashboard Omnicanal usando HTTP nativo
 * Verifica que todos los endpoints del dashboard funcionen correctamente
 */

import http from 'http';

// Colores para la consola
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(color, message) {
    console.log(`${color}${message}${colors.reset}`);
}

function makeRequest(url) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        
        const options = {
            hostname: urlObj.hostname,
            port: urlObj.port || 80,
            path: urlObj.pathname + urlObj.search,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    body: data
                });
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.setTimeout(5000, () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });

        req.end();
    });
}

async function testEndpoint(endpoint, description) {
    try {
        log(colors.blue, `\n🧪 Probando: ${description}`);
        log(colors.cyan, `   Endpoint: ${endpoint}`);
        
        const response = await makeRequest(endpoint);
        
        if (response.statusCode === 200) {
            log(colors.green, `   ✅ ${description} - ÉXITO (${response.statusCode})`);
            
            try {
                const data = JSON.parse(response.body);
                if (data.success) {
                    log(colors.cyan, `   📊 Respuesta exitosa: ${data.message || 'OK'}`);
                } else {
                    log(colors.yellow, `   ⚠️ Respuesta con error: ${data.message || data.error}`);
                }
            } catch (parseError) {
                log(colors.cyan, `   📄 Respuesta recibida (${response.body.length} caracteres)`);
            }
            
            return true;
        } else {
            log(colors.red, `   ❌ ${description} - ERROR (${response.statusCode})`);
            log(colors.red, `   Respuesta: ${response.body.substring(0, 200)}...`);
            return false;
        }
    } catch (error) {
        log(colors.red, `   ❌ ${description} - EXCEPCIÓN`);
        log(colors.red, `   Error: ${error.message}`);
        return false;
    }
}

async function testDashboardEndpoints() {
    console.log('\n' + '='.repeat(80));
    log(colors.cyan, '🎯 PRUEBA DEL DASHBOARD OMNICANAL');
    console.log('='.repeat(80) + '\n');

    const BASE_URL = 'http://localhost:4000';
    log(colors.yellow, `🔗 URL Base: ${BASE_URL}`);

    const endpoints = [
        {
            url: `${BASE_URL}/api/dashboard/omnichannel`,
            description: 'Dashboard Principal Omnicanal'
        },
        {
            url: `${BASE_URL}/api/dashboard/realtime`,
            description: 'Métricas en Tiempo Real'
        },
        {
            url: `${BASE_URL}/api/dashboard/executive-summary`,
            description: 'Resumen Ejecutivo'
        },
        {
            url: `${BASE_URL}/api/health`,
            description: 'Health Check (para comparar)'
        }
    ];

    let successCount = 0;
    const totalTests = endpoints.length;

    for (const endpoint of endpoints) {
        const success = await testEndpoint(endpoint.url, endpoint.description);
        if (success) successCount++;
        
        // Pequeña pausa entre pruebas
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Resumen final
    console.log('\n' + '='.repeat(80));
    log(colors.cyan, '📊 RESUMEN DE PRUEBAS');
    console.log('='.repeat(80));
    
    log(colors.green, `✅ Pruebas exitosas: ${successCount}/${totalTests}`);
    log(colors.red, `❌ Pruebas fallidas: ${totalTests - successCount}/${totalTests}`);
    
    if (successCount === totalTests) {
        log(colors.green, '\n🎉 ¡TODAS LAS PRUEBAS DEL DASHBOARD PASARON!');
        log(colors.green, '   El dashboard omnicanal está funcionando correctamente.');
    } else if (successCount > 0) {
        log(colors.yellow, '\n⚠️  Algunas pruebas fallaron.');
        log(colors.yellow, '   Los endpoints del dashboard pueden requerir autenticación de administrador.');
    } else {
        log(colors.red, '\n❌ Todas las pruebas fallaron.');
        log(colors.red, '   Verifica que el servidor esté ejecutándose en el puerto 4000.');
    }

    console.log('\n' + '='.repeat(80));
    log(colors.blue, '📋 ENDPOINTS DISPONIBLES:');
    log(colors.blue, '   GET /api/dashboard/omnichannel - Dashboard principal');
    log(colors.blue, '   GET /api/dashboard/realtime - Métricas en tiempo real');
    log(colors.blue, '   GET /api/dashboard/executive-summary - Resumen ejecutivo');
    log(colors.blue, '   GET /api/health - Health check');
    console.log('='.repeat(80) + '\n');
}

// Función principal
async function main() {
    try {
        await testDashboardEndpoints();
        
        log(colors.green, '\n✅ Pruebas del dashboard completadas');
        
    } catch (error) {
        log(colors.red, '\n❌ Error ejecutando pruebas:');
        console.error(error);
        process.exit(1);
    }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export { testDashboardEndpoints };
