import axios from 'axios';

async function testOrdersSimple() {
    try {
        console.log('🧪 Probando endpoint de órdenes directamente...');
        
        // URL del backend en producción
        const baseURL = 'https://supergains-backend.onrender.com/api';
        
        // Probar el endpoint de órdenes sin autenticación para ver si hay algún error específico
        console.log('\n1. Probando endpoint de órdenes sin autenticación...');
        try {
            const ordersResponse = await axios.get(`${baseURL}/orders`, {
                timeout: 30000
            });
            console.log('✅ Endpoint responde:', ordersResponse.status);
        } catch (error) {
            if (error.response?.status === 401) {
                console.log('✅ Endpoint requiere autenticación (esperado)');
            } else {
                console.log('❌ Error inesperado:', error.response?.status, error.response?.data);
            }
        }
        
        // Probar el endpoint de salud
        console.log('\n2. Probando endpoint de salud...');
        try {
            const healthResponse = await axios.get(`${baseURL}/health`, {
                timeout: 10000
            });
            console.log('✅ Endpoint de salud:', healthResponse.data);
        } catch (error) {
            console.log('❌ Error en endpoint de salud:', error.response?.data || error.message);
        }
        
        // Probar el endpoint de productos
        console.log('\n3. Probando endpoint de productos...');
        try {
            const productsResponse = await axios.get(`${baseURL}/products?limit=5`, {
                timeout: 15000
            });
            console.log('✅ Endpoint de productos:', productsResponse.data.success ? 'OK' : 'Error');
        } catch (error) {
            console.log('❌ Error en endpoint de productos:', error.response?.data || error.message);
        }
        
    } catch (error) {
        console.error('❌ Error general:', error.message);
    }
}

testOrdersSimple();
