/**
 * Script de prueba de endpoints de Customer (CRM)
 * 
 * Prueba todos los endpoints del CRM para verificar su funcionamiento.
 * Requiere que el servidor esté corriendo.
 */

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_URL = process.env.API_URL || 'http://localhost:4000/api';
let authToken = '';
let testCustomerId = '';

// Colores para consola
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m'
};

// Helper para logs
const log = {
    success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
    error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
    info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
    warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`)
};

async function testCustomerEndpoints() {
    try {
        console.log('\n🧪 Iniciando pruebas de endpoints de Customer (CRM)...\n');

        // Test 1: Login como admin
        log.info('Test 1: Login como administrador');
        try {
            const loginResponse = await axios.post(`${API_URL}/users/login`, {
                email: 'admin@supergains.com',
                contraseña: 'admin123'
            });

            authToken = loginResponse.data.token;
            log.success(`Login exitoso - Token obtenido\n`);
        } catch (error) {
            log.error(`Login fallido: ${error.response?.data?.error || error.message}`);
            return;
        }

        // Headers con autenticación
        const headers = {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
        };

        // Test 2: Obtener dashboard del CRM
        log.info('Test 2: GET /api/customers/dashboard');
        try {
            const response = await axios.get(`${API_URL}/customers/dashboard`, { headers });
            log.success(`Dashboard obtenido`);
            console.log(`   - Total customers: ${response.data.data.overview.totalCustomers}`);
            console.log(`   - Customers activos: ${response.data.data.overview.activeCustomers}`);
            console.log(`   - Alto valor: ${response.data.data.overview.highValueCustomers}`);
            console.log(`   - Revenue total: $${response.data.data.revenue.totalRevenue.toLocaleString()}\n`);
        } catch (error) {
            log.error(`Dashboard fallido: ${error.response?.data?.error || error.message}\n`);
        }

        // Test 3: Obtener todos los customers
        log.info('Test 3: GET /api/customers (con paginación)');
        try {
            const response = await axios.get(`${API_URL}/customers?page=1&limit=10`, { headers });
            log.success(`Customers obtenidos: ${response.data.data.length}`);
            
            if (response.data.data.length > 0) {
                testCustomerId = response.data.data[0]._id;
                console.log(`   - Primer customer: ${response.data.data[0].customerCode}`);
                console.log(`   - Segmento: ${response.data.data[0].segment}`);
                console.log(`   - Nivel: ${response.data.data[0].loyaltyLevel}\n`);
            }
        } catch (error) {
            log.error(`Obtener customers fallido: ${error.response?.data?.error || error.message}\n`);
        }

        // Test 4: Obtener un customer por ID
        if (testCustomerId) {
            log.info('Test 4: GET /api/customers/:id');
            try {
                const response = await axios.get(`${API_URL}/customers/${testCustomerId}`, { headers });
                log.success(`Customer obtenido`);
                console.log(`   - Código: ${response.data.data.customerCode}`);
                console.log(`   - Usuario: ${response.data.data.user?.nombre}`);
                console.log(`   - Email: ${response.data.data.user?.email}`);
                console.log(`   - LTV: $${response.data.data.lifetimeValue.toLocaleString()}\n`);
            } catch (error) {
                log.error(`Obtener customer fallido: ${error.response?.data?.error || error.message}\n`);
            }
        }

        // Test 5: Filtrar customers por segmento
        log.info('Test 5: GET /api/customers?segment=Nuevo');
        try {
            const response = await axios.get(`${API_URL}/customers?segment=Nuevo&limit=5`, { headers });
            log.success(`Customers del segmento 'Nuevo': ${response.data.data.length}\n`);
        } catch (error) {
            log.error(`Filtrar por segmento fallido: ${error.response?.data?.error || error.message}\n`);
        }

        // Test 6: Obtener estadísticas de segmentos
        log.info('Test 6: GET /api/customers/stats/segments');
        try {
            const response = await axios.get(`${API_URL}/customers/stats/segments`, { headers });
            log.success(`Estadísticas de segmentos obtenidas`);
            
            if (response.data.data.length > 0) {
                response.data.data.forEach(stat => {
                    console.log(`   - ${stat._id}: ${stat.count} clientes - Revenue: $${stat.totalRevenue.toFixed(2)}`);
                });
                console.log('');
            }
        } catch (error) {
            log.error(`Estadísticas fallidas: ${error.response?.data?.error || error.message}\n`);
        }

        // Test 7: Actualizar un customer
        if (testCustomerId) {
            log.info('Test 7: PUT /api/customers/:id');
            try {
                const response = await axios.put(
                    `${API_URL}/customers/${testCustomerId}`,
                    {
                        tags: ['Test', 'API'],
                        notes: 'Customer actualizado desde test de API'
                    },
                    { headers }
                );
                log.success(`Customer actualizado exitosamente\n`);
            } catch (error) {
                log.error(`Actualizar customer fallido: ${error.response?.data?.error || error.message}\n`);
            }
        }

        // Test 8: Agregar interacción
        if (testCustomerId) {
            log.info('Test 8: POST /api/customers/:id/interactions');
            try {
                const response = await axios.post(
                    `${API_URL}/customers/${testCustomerId}/interactions`,
                    {
                        type: 'Visita',
                        description: 'Visitó el dashboard de admin',
                        metadata: { page: '/admin', duration: 120 }
                    },
                    { headers }
                );
                log.success(`Interacción agregada exitosamente\n`);
            } catch (error) {
                log.error(`Agregar interacción fallido: ${error.response?.data?.error || error.message}\n`);
            }
        }

        // Test 9: Actualizar métricas
        if (testCustomerId) {
            log.info('Test 9: PUT /api/customers/:id/update-metrics');
            try {
                const response = await axios.put(
                    `${API_URL}/customers/${testCustomerId}/update-metrics`,
                    {},
                    { headers }
                );
                log.success(`Métricas actualizadas exitosamente\n`);
            } catch (error) {
                log.error(`Actualizar métricas fallido: ${error.response?.data?.error || error.message}\n`);
            }
        }

        // Test 10: Actualizar puntos de fidelidad
        if (testCustomerId) {
            log.info('Test 10: PUT /api/customers/:id/loyalty-points');
            try {
                const response = await axios.put(
                    `${API_URL}/customers/${testCustomerId}/loyalty-points`,
                    {
                        points: 100,
                        operation: 'add'
                    },
                    { headers }
                );
                log.success(`Puntos de fidelidad actualizados: ${response.data.data.loyaltyPoints} puntos\n`);
            } catch (error) {
                log.error(`Actualizar puntos fallido: ${error.response?.data?.error || error.message}\n`);
            }
        }

        // Test 11: Obtener clientes de alto valor
        log.info('Test 11: GET /api/customers/high-value');
        try {
            const response = await axios.get(`${API_URL}/customers/high-value?limit=5`, { headers });
            log.success(`Clientes de alto valor: ${response.data.count}`);
            
            if (response.data.data.length > 0) {
                response.data.data.forEach((customer, index) => {
                    console.log(`   ${index + 1}. ${customer.user?.nombre} - LTV: $${customer.lifetimeValue.toLocaleString()}`);
                });
                console.log('');
            } else {
                console.log('   No hay clientes de alto valor aún\n');
            }
        } catch (error) {
            log.error(`Obtener alto valor fallido: ${error.response?.data?.error || error.message}\n`);
        }

        // Test 12: Obtener clientes en riesgo
        log.info('Test 12: GET /api/customers/churn-risk');
        try {
            const response = await axios.get(`${API_URL}/customers/churn-risk`, { headers });
            log.success(`Clientes en riesgo: ${response.data.count}\n`);
        } catch (error) {
            log.error(`Obtener riesgo fallido: ${error.response?.data?.error || error.message}\n`);
        }

        // Test 13: Buscar customers
        log.info('Test 13: GET /api/customers?search=admin');
        try {
            const response = await axios.get(`${API_URL}/customers?search=admin&limit=5`, { headers });
            log.success(`Resultados de búsqueda: ${response.data.data.length}\n`);
        } catch (error) {
            log.error(`Búsqueda fallida: ${error.response?.data?.error || error.message}\n`);
        }

        console.log('✅ Todas las pruebas de endpoints completadas!\n');

    } catch (error) {
        console.error('❌ Error en las pruebas:', error.message);
    }
}

// Ejecutar pruebas
testCustomerEndpoints()
    .then(() => {
        console.log('✨ Pruebas finalizadas');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Error fatal:', error);
        process.exit(1);
    });

