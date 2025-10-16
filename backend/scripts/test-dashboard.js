/**
 * Script de prueba para el Dashboard Omnicanal
 * Verifica que todos los endpoints del dashboard funcionen correctamente
 */

import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = process.env.API_URL || 'http://localhost:4000';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'your_admin_token_here';

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

async function testDashboardEndpoint(endpoint, description) {
    try {
        log(colors.blue, `\n🧪 Probando: ${description}`);
        log(colors.cyan, `   Endpoint: ${endpoint}`);

        const response = await fetch(`${BASE_URL}${endpoint}`, {
            headers: {
                'Authorization': `Bearer ${ADMIN_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (response.ok && data.success) {
            log(colors.green, `   ✅ ${description} - ÉXITO`);

            // Mostrar métricas clave
            if (data.data) {
                if (data.data.sales) {
                    log(colors.cyan, `   📊 Ventas: ${data.data.sales.consolidated?.totalOrders || 0} órdenes, $${data.data.sales.consolidated?.totalRevenue || 0} ingresos`);
                }
                if (data.data.inventory) {
                    log(colors.cyan, `   📦 Inventario: ${data.data.inventory.overview?.totalProducts || 0} productos, ${data.data.inventory.overview?.discrepancyRate || 0}% discrepancias`);
                }
                if (data.data.system) {
                    log(colors.cyan, `   🔧 Sistema: ${data.data.system.health?.orders?.total || 0} órdenes totales`);
                }
            }

            return true;
        } else {
            log(colors.red, `   ❌ ${description} - ERROR`);
            log(colors.red, `   Status: ${response.status}`);
            log(colors.red, `   Error: ${data.message || data.error || 'Error desconocido'}`);
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

    log(colors.yellow, `🔗 URL Base: ${BASE_URL}`);
    log(colors.yellow, `🔑 Token: ${ADMIN_TOKEN.substring(0, 20)}...`);

    const endpoints = [
        {
            url: '/api/dashboard/omnichannel',
            description: 'Dashboard Principal Omnicanal'
        },
        {
            url: '/api/dashboard/realtime',
            description: 'Métricas en Tiempo Real'
        },
        {
            url: '/api/dashboard/executive-summary',
            description: 'Resumen Ejecutivo'
        }
    ];

    let successCount = 0;
    const totalTests = endpoints.length;

    for (const endpoint of endpoints) {
        const success = await testDashboardEndpoint(endpoint.url, endpoint.description);
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
    } else {
        log(colors.yellow, '\n⚠️  Algunas pruebas fallaron.');
        log(colors.yellow, '   Revisa los errores anteriores y verifica la configuración.');
    }

    console.log('\n' + '='.repeat(80));
    log(colors.blue, '📋 ENDPOINTS DISPONIBLES:');
    log(colors.blue, '   GET /api/dashboard/omnichannel - Dashboard principal');
    log(colors.blue, '   GET /api/dashboard/realtime - Métricas en tiempo real');
    log(colors.blue, '   GET /api/dashboard/executive-summary - Resumen ejecutivo');
    console.log('='.repeat(80) + '\n');
}

// Función para probar endpoints específicos con parámetros
async function testDashboardWithParams() {
    console.log('\n' + '='.repeat(80));
    log(colors.cyan, '🔧 PRUEBAS CON PARÁMETROS');
    console.log('='.repeat(80) + '\n');

    const testCases = [
        {
            url: '/api/dashboard/omnichannel?startDate=2024-01-01&endDate=2024-12-31&period=monthly',
            description: 'Dashboard con rango de fechas específico'
        },
        {
            url: '/api/dashboard/executive-summary?startDate=2024-01-01&endDate=2024-12-31',
            description: 'Resumen ejecutivo con fechas personalizadas'
        }
    ];

    for (const testCase of testCases) {
        await testDashboardEndpoint(testCase.url, testCase.description);
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

// Función principal
async function main() {
    try {
        await testDashboardEndpoints();
        await testDashboardWithParams();

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

export { testDashboardEndpoints, testDashboardWithParams };
