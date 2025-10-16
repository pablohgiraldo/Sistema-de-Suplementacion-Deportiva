// Usar fetch nativo de Node.js 18+

const API_BASE_URL = 'http://localhost:4000/api';

// Función para hacer requests con autenticación
const makeRequest = async (endpoint, options = {}) => {
    try {
        const url = `${API_BASE_URL}${endpoint}`;
        console.log(`🔍 Haciendo request a: ${url}`);
        
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });

        const data = await response.json();
        
        if (response.ok) {
            console.log(`✅ ${response.status} - ${endpoint}`);
            return { success: true, data, status: response.status };
        } else {
            console.log(`❌ ${response.status} - ${endpoint}`);
            console.log(`   Error: ${data.message || data.error}`);
            return { success: false, data, status: response.status };
        }
    } catch (error) {
        console.log(`💥 Error de conexión - ${endpoint}`);
        console.log(`   ${error.message}`);
        return { success: false, error: error.message };
    }
};

// Función para probar el dashboard omnicanal
const testOmnichannelDashboard = async () => {
    console.log('🚀 PROBANDO DASHBOARD OMNICANAL');
    console.log('================================\n');

    // 1. Probar endpoint principal del dashboard
    console.log('1️⃣ Probando dashboard principal...');
    const dashboardResult = await makeRequest('/dashboard/omnichannel?period=monthly');
    
    if (dashboardResult.success) {
        const dashboard = dashboardResult.data.data;
        console.log('📊 Métricas del Dashboard:');
        console.log(`   📅 Período: ${dashboard.period.days} días`);
        console.log(`   💰 Ingresos totales: $${dashboard.sales.consolidated.totalRevenue?.toLocaleString() || '0'}`);
        console.log(`   🛒 Órdenes totales: ${dashboard.sales.consolidated.totalOrders || '0'}`);
        console.log(`   📦 Productos en inventario: ${dashboard.inventory.overview.totalProducts || '0'}`);
        console.log(`   ⚠️ Discrepancias: ${dashboard.inventory.discrepancies?.length || '0'}`);
        console.log(`   🔄 Pendientes sync: ${dashboard.inventory.pendingSync?.length || '0'}`);
        
        if (dashboard.sales.channelStats?.length > 0) {
            console.log('\n📈 Ventas por Canal:');
            dashboard.sales.channelStats.forEach(channel => {
                console.log(`   ${channel.channel}: $${channel.totalRevenue?.toLocaleString()} (${channel.totalOrders} órdenes)`);
            });
        }
    }

    // 2. Probar métricas en tiempo real
    console.log('\n2️⃣ Probando métricas en tiempo real...');
    const realtimeResult = await makeRequest('/dashboard/realtime');
    
    if (realtimeResult.success) {
        const realtime = realtimeResult.data.data;
        console.log('⏱️ Métricas en Tiempo Real:');
        console.log(`   🔄 Discrepancias actuales: ${realtime.stockDiscrepancies || '0'}`);
        console.log(`   ⏳ Pendientes sync: ${realtime.pendingSync || '0'}`);
        console.log(`   🏪 Ventas físicas últimas 24h: ${realtime.physicalSalesLast24h || '0'}`);
        console.log(`   💾 MongoDB: ${realtime.systemHealth?.database?.mongodb ? '✅' : '❌'}`);
        console.log(`   🚀 Redis: ${realtime.systemHealth?.database?.redis ? '✅' : '❌'}`);
    }

    // 3. Probar resumen ejecutivo
    console.log('\n3️⃣ Probando resumen ejecutivo...');
    const executiveResult = await makeRequest('/dashboard/executive-summary?period=monthly');
    
    if (executiveResult.success) {
        const executive = executiveResult.data.data;
        console.log('📋 Resumen Ejecutivo:');
        console.log(`   💰 Ingresos: $${executive.summary.totalRevenue?.toLocaleString() || '0'}`);
        console.log(`   🛒 Órdenes: ${executive.summary.totalOrders || '0'}`);
        console.log(`   💵 Valor promedio por orden: $${executive.summary.averageOrderValue || '0'}`);
        
        if (executive.recommendations?.length > 0) {
            console.log('\n💡 Recomendaciones:');
            executive.recommendations.forEach((rec, index) => {
                console.log(`   ${index + 1}. [${rec.priority.toUpperCase()}] ${rec.message}`);
            });
        }
    }

    // 4. Probar endpoints de inventario omnicanal
    console.log('\n4️⃣ Probando endpoints de inventario omnicanal...');
    
    const inventoryStats = await makeRequest('/inventory/omnichannel/stats');
    if (inventoryStats.success) {
        console.log('📊 Estadísticas de Inventario Omnicanal:');
        const stats = inventoryStats.data.data;
        console.log(`   📦 Total productos: ${stats.totalProducts || '0'}`);
        console.log(`   🏪 Stock físico: ${stats.totalPhysicalStock || '0'}`);
        console.log(`   💻 Stock digital: ${stats.totalDigitalStock || '0'}`);
        console.log(`   ⚠️ Con discrepancias: ${stats.productsWithDiscrepancies || '0'}`);
    }

    const discrepancies = await makeRequest('/inventory/omnichannel/discrepancies');
    if (discrepancies.success) {
        console.log(`\n⚠️ Discrepancias encontradas: ${discrepancies.data.data?.length || '0'}`);
        if (discrepancies.data.data?.length > 0) {
            discrepancies.data.data.slice(0, 3).forEach((item, index) => {
                console.log(`   ${index + 1}. ${item.productName}: Físico(${item.physicalStock}) vs Digital(${item.digitalStock})`);
            });
        }
    }

    const lowPhysical = await makeRequest('/inventory/omnichannel/low-physical');
    if (lowPhysical.success) {
        console.log(`\n🏪 Stock físico bajo: ${lowPhysical.data.data?.length || '0'} productos`);
    }

    const lowDigital = await makeRequest('/inventory/omnichannel/low-digital');
    if (lowDigital.success) {
        console.log(`💻 Stock digital bajo: ${lowDigital.data.data?.length || '0'} productos`);
    }

    // 5. Probar endpoint de sincronización
    console.log('\n5️⃣ Probando endpoint de sincronización...');
    const syncResult = await makeRequest('/inventory/sync', {
        method: 'POST',
        body: JSON.stringify({ dryRun: true })
    });
    
    if (syncResult.success) {
        const sync = syncResult.data.data;
        console.log('🔄 Resultado de Sincronización (Dry Run):');
        console.log(`   📊 Productos procesados: ${sync.productsProcessed || '0'}`);
        console.log(`   ⚠️ Discrepancias encontradas: ${sync.discrepanciesFound || '0'}`);
        console.log(`   ✅ Sincronizaciones exitosas: ${sync.successfulSyncs || '0'}`);
        console.log(`   ❌ Errores: ${sync.errors || '0'}`);
    }

    console.log('\n🎯 PRUEBAS COMPLETADAS');
    console.log('======================');
};

// Función para mostrar estadísticas generales
const showGeneralStats = async () => {
    console.log('\n📈 ESTADÍSTICAS GENERALES');
    console.log('==========================');

    // Estadísticas de órdenes por canal
    const ordersStats = await makeRequest('/orders/channel-stats');
    if (ordersStats.success) {
        console.log('🛒 Estadísticas de Órdenes por Canal:');
        ordersStats.data.data.forEach(stat => {
            console.log(`   ${stat._id}: ${stat.totalOrders} órdenes, $${stat.totalRevenue?.toLocaleString()}`);
        });
    }

    // Estadísticas de ventas físicas
    const physicalSales = await makeRequest('/orders/physical-sales?limit=5');
    if (physicalSales.success) {
        console.log(`\n🏪 Últimas 5 ventas físicas:`);
        physicalSales.data.data.forEach((sale, index) => {
            console.log(`   ${index + 1}. ${sale.orderNumber}: $${sale.total} - ${sale.physicalSale.storeLocation}`);
        });
    }
};

// Función principal
const main = async () => {
    console.log('🧪 SCRIPT DE PRUEBAS DASHBOARD OMNICANAL');
    console.log('==========================================\n');

    try {
        await testOmnichannelDashboard();
        await showGeneralStats();
        
        console.log('\n✅ Todas las pruebas completadas exitosamente!');
        console.log('🎉 El dashboard omnicanal está funcionando correctamente.');
        
    } catch (error) {
        console.error('\n❌ Error durante las pruebas:', error);
    }
};

// Ejecutar pruebas
main();
