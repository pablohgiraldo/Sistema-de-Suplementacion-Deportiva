// Script de prueba para verificar la visualización de stock en el frontend
import { inventoryService } from './services/inventoryService';

async function testStockDisplay() {
    console.log('🧪 Probando visualización de stock en frontend...');

    try {
        // 1. Probar servicio de inventario
        console.log('\n1️⃣ Probando servicio de inventario...');
        const inventories = await inventoryService.getInventories({ limit: 5 });
        console.log('✅ Inventarios obtenidos:', inventories.data.length, 'productos');

        // 2. Probar inventario de producto específico
        if (inventories.data.length > 0) {
            const firstProduct = inventories.data[0];
            console.log('\n2️⃣ Probando inventario de producto específico...');
            const productInventory = await inventoryService.getProductInventory(firstProduct.product._id);
            console.log('✅ Inventario del producto:', {
                productId: firstProduct.product._id,
                currentStock: productInventory.data.currentStock,
                availableStock: productInventory.data.availableStock,
                status: productInventory.data.status,
                stockStatus: productInventory.data.stockStatus
            });
        }

        // 3. Probar estadísticas
        console.log('\n3️⃣ Probando estadísticas de inventario...');
        const stats = await inventoryService.getInventoryStats();
        console.log('✅ Estadísticas:', stats.data);

        // 4. Probar productos con stock bajo
        console.log('\n4️⃣ Probando productos con stock bajo...');
        const lowStock = await inventoryService.getLowStockProducts();
        console.log('✅ Productos con stock bajo:', lowStock.data.length);

        // 5. Probar productos agotados
        console.log('\n5️⃣ Probando productos agotados...');
        const outOfStock = await inventoryService.getOutOfStockProducts();
        console.log('✅ Productos agotados:', outOfStock.data.length);

        console.log('\n🎉 Todas las pruebas de stock display pasaron exitosamente');

    } catch (error) {
        console.log('❌ Error en pruebas de stock display:', error.message);
    }
}

// Ejecutar si se llama directamente
if (typeof window === 'undefined') {
    testStockDisplay();
}

export default testStockDisplay;
