import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

async function testOrdersEndpoint() {
    try {
        console.log('🧪 Probando endpoint de órdenes...');
        
        // URL del backend en producción
        const baseURL = 'https://supergains-backend.onrender.com/api';
        
        // Primero, intentar hacer login para obtener un token
        console.log('\n1. Intentando hacer login...');
        const loginResponse = await axios.post(`${baseURL}/users/login`, {
            email: 'admin@test.com',
            contraseña: 'admin123'
        });
        
        if (loginResponse.data.success) {
            const token = loginResponse.data.data.tokens.accessToken;
            console.log('✅ Login exitoso');
            
            // Ahora probar el endpoint de órdenes
            console.log('\n2. Probando endpoint de órdenes...');
            const ordersResponse = await axios.get(`${baseURL}/orders`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                timeout: 30000
            });
            
            if (ordersResponse.data.success) {
                console.log('✅ Endpoint de órdenes funcionando');
                console.log(`📊 Total de órdenes: ${ordersResponse.data.data.length}`);
                console.log(`📄 Paginación:`, ordersResponse.data.pagination);
                
                if (ordersResponse.data.data.length > 0) {
                    console.log('\n📋 Primeras órdenes:');
                    ordersResponse.data.data.slice(0, 3).forEach((order, index) => {
                        console.log(`${index + 1}. Orden #${order.orderNumber} - Estado: ${order.status} - Total: $${order.total}`);
                    });
                }
            } else {
                console.log('❌ Error en endpoint de órdenes:', ordersResponse.data);
            }
        } else {
            console.log('❌ Error en login:', loginResponse.data);
        }
        
    } catch (error) {
        console.error('❌ Error en la prueba:', error.response?.data || error.message);
        
        if (error.code === 'ECONNABORTED') {
            console.log('⏰ Timeout - El servidor está tardando demasiado en responder');
        }
    }
}

testOrdersEndpoint();
