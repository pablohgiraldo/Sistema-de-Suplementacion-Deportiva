import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_BASE_URL = process.env.API_URL || 'http://localhost:4000/api';

// Configuración de axios
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Función para crear usuario de prueba
async function createTestUser() {
    try {
        console.log("👤 Creando usuario de prueba...");

        const userData = {
            nombre: 'Usuario Prueba Órdenes',
            email: 'test-orders@supergains.com',
            contraseña: 'test123456',
            rol: 'usuario'
        };

        const response = await api.post('/users/register', userData);

        if (response.data.success) {
            console.log(`✅ Usuario creado: ${response.data.user.nombre}`);
            return response.data.user;
        }
    } catch (error) {
        if (error.response?.status === 400 && error.response?.data?.error?.includes('ya existe')) {
            console.log("ℹ️ Usuario ya existe, continuando...");
            return null;
        }
        console.error("❌ Error al crear usuario:", error.response?.data?.error || error.message);
        return null;
    }
}

// Función para hacer login
async function login(email, password) {
    try {
        console.log(`🔐 Iniciando sesión con ${email}...`);

        const response = await api.post('/users/login', {
            email: email,
            contraseña: password
        });

        if (response.data.success) {
            const token = response.data.data.tokens.accessToken;
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            console.log(`✅ Login exitoso: ${response.data.data.user.nombre}`);
            return { token, user: response.data.data.user };
        }
    } catch (error) {
        console.error("❌ Error en login:", error.response?.data?.error || error.message);
        return null;
    }
}

// Función para crear productos de prueba
async function createTestProducts() {
    try {
        console.log("📦 Creando productos de prueba...");

        const products = [
            {
                name: 'Proteína Whey Premium',
                brand: 'SuperGains',
                price: 85000,
                stock: 50,
                description: 'Proteína de suero de leche de alta calidad',
                categories: ['proteínas', 'suplementos'],
                imageUrl: 'https://example.com/protein.jpg'
            },
            {
                name: 'Creatina Monohidrato',
                brand: 'SuperGains',
                price: 45000,
                stock: 30,
                description: 'Creatina pura para aumentar fuerza y masa muscular',
                categories: ['creatina', 'suplementos'],
                imageUrl: 'https://example.com/creatine.jpg'
            },
            {
                name: 'Multivitamínico Completo',
                brand: 'SuperGains',
                price: 35000,
                stock: 25,
                description: 'Complejo vitamínico y mineral esencial',
                categories: ['vitaminas', 'salud'],
                imageUrl: 'https://example.com/multivitamin.jpg'
            }
        ];

        const createdProducts = [];

        for (const productData of products) {
            try {
                const response = await api.post('/products', productData);
                if (response.data.success) {
                    createdProducts.push(response.data.data);
                    console.log(`   ✅ ${productData.name} creado`);
                }
            } catch (error) {
                if (error.response?.status === 400 && error.response?.data?.error?.includes('ya existe')) {
                    console.log(`   ℹ️ ${productData.name} ya existe`);
                } else {
                    console.log(`   ❌ Error al crear ${productData.name}:`, error.response?.data?.error);
                }
            }
        }

        return createdProducts;
    } catch (error) {
        console.error("❌ Error al crear productos:", error.response?.data?.error || error.message);
        return [];
    }
}

// Función para agregar productos al carrito
async function addProductsToCart(products) {
    try {
        console.log("🛒 Agregando productos al carrito...");

        for (const product of products) {
            try {
                const response = await api.post('/cart/add', {
                    productId: product._id,
                    quantity: Math.floor(Math.random() * 3) + 1 // Cantidad aleatoria entre 1-3
                });

                if (response.data.success) {
                    console.log(`   ✅ ${product.name} agregado al carrito`);
                }
            } catch (error) {
                console.log(`   ❌ Error al agregar ${product.name}:`, error.response?.data?.error);
            }
        }
    } catch (error) {
        console.error("❌ Error al agregar productos al carrito:", error.response?.data?.error || error.message);
    }
}

// Función para crear órdenes de prueba
async function createTestOrders() {
    try {
        console.log("📋 Creando órdenes de prueba...");

        const shippingAddresses = [
            {
                street: 'Calle 123 #45-67',
                city: 'Bogotá',
                state: 'Cundinamarca',
                zipCode: '110111',
                country: 'Colombia'
            },
            {
                street: 'Carrera 45 #78-90',
                city: 'Medellín',
                state: 'Antioquia',
                zipCode: '050001',
                country: 'Colombia'
            },
            {
                street: 'Avenida 80 #12-34',
                city: 'Cali',
                state: 'Valle del Cauca',
                zipCode: '760001',
                country: 'Colombia'
            }
        ];

        const paymentMethods = ['credit_card', 'debit_card', 'paypal', 'cash', 'bank_transfer'];
        const createdOrders = [];

        // Crear 3 órdenes de prueba
        for (let i = 0; i < 3; i++) {
            try {
                const orderData = {
                    paymentMethod: paymentMethods[i % paymentMethods.length],
                    shippingAddress: shippingAddresses[i],
                    notes: `Orden de prueba ${i + 1} - Generada automáticamente`
                };

                const response = await api.post('/orders', orderData);

                if (response.data.success) {
                    createdOrders.push(response.data.data);
                    console.log(`   ✅ Orden ${i + 1} creada: ${response.data.data.orderNumber}`);
                }
            } catch (error) {
                console.log(`   ❌ Error al crear orden ${i + 1}:`, error.response?.data?.error);
            }
        }

        return createdOrders;
    } catch (error) {
        console.error("❌ Error al crear órdenes:", error.response?.data?.error || error.message);
        return [];
    }
}

// Función para simular diferentes estados de órdenes
async function simulateOrderStates(orders) {
    try {
        console.log("🔄 Simulando estados de órdenes...");

        const states = ['processing', 'shipped', 'delivered'];

        for (let i = 0; i < orders.length && i < states.length; i++) {
            try {
                const response = await api.patch(`/orders/${orders[i]._id}/status`, {
                    status: states[i],
                    notes: `Estado actualizado a ${states[i]} - Simulación automática`
                });

                if (response.data.success) {
                    console.log(`   ✅ Orden ${orders[i].orderNumber} actualizada a: ${states[i]}`);
                }
            } catch (error) {
                console.log(`   ❌ Error al actualizar orden ${orders[i].orderNumber}:`, error.response?.data?.error);
            }
        }
    } catch (error) {
        console.error("❌ Error al simular estados:", error.response?.data?.error || error.message);
    }
}

// Función para mostrar estadísticas finales
async function showFinalStats() {
    try {
        console.log("\n📊 Estadísticas finales:");

        // Obtener estadísticas de ventas
        const statsResponse = await api.get('/orders/reports/stats');
        if (statsResponse.data.success) {
            const stats = statsResponse.data.data;
            console.log(`   📈 Total de órdenes: ${stats.totalOrders}`);
            console.log(`   💰 Ingresos totales: $${stats.totalRevenue}`);
            console.log(`   📦 Items vendidos: ${stats.totalItemsSold}`);
            console.log(`   💵 Valor promedio: $${stats.averageOrderValue}`);
        }

        // Obtener productos más vendidos
        const topProductsResponse = await api.get('/orders/reports/top-products?limit=3');
        if (topProductsResponse.data.success) {
            console.log(`   🏆 Top productos:`);
            topProductsResponse.data.data.forEach((product, index) => {
                console.log(`      ${index + 1}. ${product.product.name}: ${product.totalQuantity} unidades`);
            });
        }

    } catch (error) {
        console.error("❌ Error al obtener estadísticas:", error.response?.data?.error || error.message);
    }
}

// Función principal
async function runOrderSeed() {
    console.log("🌱 Iniciando seed de datos para órdenes...\n");

    // 1. Login como admin para crear productos
    const adminLogin = await login('admin@test.com', 'Admin123!');
    if (!adminLogin) {
        console.log("❌ No se pudo hacer login como admin. Terminando.");
        return;
    }

    // 2. Crear productos de prueba
    const products = await createTestProducts();
    if (products.length === 0) {
        console.log("❌ No se pudieron crear productos. Terminando.");
        return;
    }

    // 3. Crear usuario de prueba
    await createTestUser();

    // 4. Login como usuario de prueba
    const userLogin = await login('test-orders@supergains.com', 'test123456');
    if (!userLogin) {
        console.log("❌ No se pudo hacer login como usuario de prueba. Terminando.");
        return;
    }

    // 5. Agregar productos al carrito
    await addProductsToCart(products);

    // 6. Crear órdenes de prueba
    const orders = await createTestOrders();
    if (orders.length === 0) {
        console.log("❌ No se pudieron crear órdenes. Terminando.");
        return;
    }

    // 7. Simular estados de órdenes
    await simulateOrderStates(orders);

    // 8. Mostrar estadísticas finales
    await showFinalStats();

    console.log("\n✅ Seed de órdenes completado exitosamente!");
    console.log(`📋 Se crearon ${orders.length} órdenes de prueba`);
    console.log(`🔗 Puedes verificar los datos en la base de datos o usar los endpoints de reportes`);
}

// Ejecutar seed
runOrderSeed().catch(error => {
    console.error("❌ Error durante el seed:", error);
    process.exit(1);
});
