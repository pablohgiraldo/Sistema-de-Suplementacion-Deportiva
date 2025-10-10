/**
 * Script para generar dataset de prueba para el sistema de recomendaciones
 * Crea usuarios, productos y órdenes con patrones identificables
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB } from '../src/config/db.js';
import User from '../src/models/User.js';
import Product from '../src/models/Product.js';
import Order from '../src/models/Order.js';
import Customer from '../src/models/Customer.js';

dotenv.config();

// Productos de muestra con categorías y relaciones
// Precios ajustados para estar dentro del límite del modelo ($10,000)
const productsData = [
    // Proteínas
    { name: 'Whey Protein Gold Standard', brand: 'Optimum Nutrition', price: 1800, category: 'Proteína', stock: 50 },
    { name: 'Isolate Protein Zero', brand: 'MuscleTech', price: 2200, category: 'Proteína', stock: 40 },
    { name: 'Whey Protein Syntha-6', brand: 'BSN', price: 1950, category: 'Proteína', stock: 45 },
    { name: 'Plant Protein Vegan', brand: 'Vega', price: 1650, category: 'Proteína', stock: 30 },
    
    // Pre-entrenos (frecuentemente comprados con proteínas)
    { name: 'C4 Original Pre-Workout', brand: 'Cellucor', price: 1250, category: 'Pre-Entreno', stock: 60 },
    { name: 'Pre-Jym Pre-Workout', brand: 'Jym Supplement', price: 1450, category: 'Pre-Entreno', stock: 35 },
    { name: 'NO-Xplode Pre-Workout', brand: 'BSN', price: 1350, category: 'Pre-Entreno', stock: 50 },
    
    // Creatinas (frecuentemente compradas con proteínas)
    { name: 'Creatine Monohydrate', brand: 'Optimum Nutrition', price: 850, category: 'Creatina', stock: 80 },
    { name: 'Micronized Creatine', brand: 'MuscleTech', price: 950, category: 'Creatina', stock: 70 },
    { name: 'Creatine HCL', brand: 'Kaged Muscle', price: 1100, category: 'Creatina', stock: 45 },
    
    // Aminoácidos (BCAA)
    { name: 'BCAA 2:1:1', brand: 'Optimum Nutrition', price: 1200, category: 'Aminoácidos', stock: 55 },
    { name: 'Amino Energy', brand: 'Optimum Nutrition', price: 1050, category: 'Aminoácidos', stock: 60 },
    { name: 'BCAA + Glutamine', brand: 'MuscleTech', price: 1300, category: 'Aminoácidos', stock: 40 },
    
    // Vitaminas y salud (compradas por usuarios health-conscious)
    { name: 'Multivitamínico Opti-Men', brand: 'Optimum Nutrition', price: 950, category: 'Vitaminas', stock: 70 },
    { name: 'Omega-3 Fish Oil', brand: 'Nordic Naturals', price: 750, category: 'Vitaminas', stock: 80 },
    { name: 'Vitamin D3 + K2', brand: 'Now Foods', price: 550, category: 'Vitaminas', stock: 90 },
    
    // Quemadores de grasa (nicho específico)
    { name: 'Hydroxycut Hardcore', brand: 'MuscleTech', price: 1400, category: 'Quemadores', stock: 35 },
    { name: 'Lipo-6 Black', brand: 'Nutrex', price: 1550, category: 'Quemadores', stock: 30 },
    { name: 'CLA + Carnitine', brand: 'Evlution Nutrition', price: 1150, category: 'Quemadores', stock: 40 },
    
    // Ganadores de peso (nicho específico)
    { name: 'Serious Mass', brand: 'Optimum Nutrition', price: 1850, category: 'Ganadores', stock: 25 },
    { name: 'Mass-Tech Extreme', brand: 'MuscleTech', price: 2100, category: 'Ganadores', stock: 20 },
    
    // Barras y snacks
    { name: 'Quest Protein Bar (12 pack)', brand: 'Quest Nutrition', price: 650, category: 'Snacks', stock: 100 },
    { name: 'Barebells Protein Bar (12 pack)', brand: 'Barebells', price: 700, category: 'Snacks', stock: 90 },
    { name: 'RxBar Protein Bar (12 pack)', brand: 'RxBar', price: 600, category: 'Snacks', stock: 85 }
];

// Perfiles de usuarios con patrones de compra
const userProfiles = [
    { type: 'bodybuilder', count: 5, preferences: ['Proteína', 'Creatina', 'Pre-Entreno', 'Aminoácidos'] },
    { type: 'fitness_casual', count: 8, preferences: ['Proteína', 'Vitaminas', 'Snacks'] },
    { type: 'weightloss', count: 6, preferences: ['Proteína', 'Quemadores', 'Vitaminas'] },
    { type: 'bulking', count: 4, preferences: ['Ganadores', 'Proteína', 'Creatina'] },
    { type: 'health_conscious', count: 7, preferences: ['Vitaminas', 'Proteína', 'Snacks'] }
];

// Patrones de co-ocurrencia (productos que se compran juntos)
const coOccurrencePatterns = [
    ['Proteína', 'Creatina'],          // 70% co-ocurrencia
    ['Proteína', 'Pre-Entreno'],       // 60% co-ocurrencia
    ['Proteína', 'Aminoácidos'],       // 50% co-ocurrencia
    ['Pre-Entreno', 'Aminoácidos'],    // 45% co-ocurrencia
    ['Vitaminas', 'Proteína'],         // 40% co-ocurrencia
    ['Quemadores', 'Vitaminas'],       // 55% co-ocurrencia
    ['Ganadores', 'Creatina']          // 65% co-ocurrencia
];

/**
 * Genera usuarios de prueba
 */
async function generateUsers() {
    console.log('\n📝 Generando usuarios de prueba...');
    
    const users = [];
    let userIndex = 1;
    
    for (const profile of userProfiles) {
        for (let i = 0; i < profile.count; i++) {
            const user = new User({
                nombre: `${profile.type}_user_${userIndex}`,
                email: `${profile.type}_${userIndex}@test.com`,
                contraseña: 'Test123!',
                rol: 'usuario',
                profile: {
                    type: profile.type,
                    preferences: profile.preferences
                }
            });
            
            await user.save();
            users.push({ user, profile: profile.type, preferences: profile.preferences });
            userIndex++;
        }
    }
    
    console.log(`✅ ${users.length} usuarios creados`);
    return users;
}

/**
 * Genera productos de prueba
 */
async function generateProducts() {
    console.log('\n📦 Generando productos de prueba...');
    
    const products = [];
    
    for (const productData of productsData) {
        const product = new Product({
            name: productData.name,
            brand: productData.brand,
            price: productData.price,
            stock: productData.stock,
            categories: [productData.category],
            description: `${productData.category} de alta calidad de ${productData.brand}`,
            imageUrl: 'https://via.placeholder.com/300'
        });
        
        await product.save();
        products.push({ product, category: productData.category });
    }
    
    console.log(`✅ ${products.length} productos creados`);
    return products;
}

/**
 * Obtiene productos por categoría
 */
function getProductsByCategory(products, category) {
    return products.filter(p => p.category === category).map(p => p.product);
}

/**
 * Selecciona productos aleatorios de una categoría
 */
function selectRandomProducts(products, count = 1) {
    const shuffled = [...products].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

/**
 * Genera una orden con productos relacionados
 */
async function generateOrder(user, products, preferences, daysAgo = 0) {
    const orderDate = new Date();
    orderDate.setDate(orderDate.getDate() - daysAgo);
    
    // Seleccionar categoría principal basada en preferencias
    const mainCategory = preferences[Math.floor(Math.random() * preferences.length)];
    const mainProducts = getProductsByCategory(products, mainCategory);
    
    if (mainProducts.length === 0) return null;
    
    const orderItems = [];
    const selectedProduct = selectRandomProducts(mainProducts, 1)[0];
    
    // Agregar producto principal
    orderItems.push({
        product: selectedProduct._id,
        quantity: Math.floor(Math.random() * 2) + 1, // 1-2 unidades
        price: selectedProduct.price,
        subtotal: selectedProduct.price * (Math.floor(Math.random() * 2) + 1)
    });
    
    // 60% probabilidad de agregar producto relacionado
    if (Math.random() < 0.6) {
        // Buscar patrón de co-ocurrencia
        const relatedPattern = coOccurrencePatterns.find(p => p.includes(mainCategory));
        if (relatedPattern) {
            const relatedCategory = relatedPattern.find(c => c !== mainCategory);
            const relatedProducts = getProductsByCategory(products, relatedCategory);
            
            if (relatedProducts.length > 0) {
                const relatedProduct = selectRandomProducts(relatedProducts, 1)[0];
                orderItems.push({
                    product: relatedProduct._id,
                    quantity: 1,
                    price: relatedProduct.price,
                    subtotal: relatedProduct.price
                });
            }
        }
    }
    
    // 30% probabilidad de agregar un tercer producto
    if (Math.random() < 0.3 && preferences.length > 1) {
        const thirdCategory = preferences[Math.floor(Math.random() * preferences.length)];
        const thirdProducts = getProductsByCategory(products, thirdCategory);
        
        if (thirdProducts.length > 0) {
            const thirdProduct = selectRandomProducts(thirdProducts, 1)[0];
            orderItems.push({
                product: thirdProduct._id,
                quantity: 1,
                price: thirdProduct.price,
                subtotal: thirdProduct.price
            });
        }
    }
    
    // Calcular totales
    const subtotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
    const tax = subtotal * 0.19; // IVA 19%
    const shipping = subtotal > 1500 ? 0 : 150; // Envío gratis sobre $1500
    const total = subtotal + tax + shipping;
    
    // Crear orden
    const order = new Order({
        user: user._id,
        items: orderItems,
        subtotal,
        tax,
        shipping,
        total,
        status: 'delivered', // Todas las órdenes históricas están entregadas
        paymentStatus: 'paid',
        paymentMethod: 'credit_card',
        shippingAddress: {
            firstName: 'Usuario',
            lastName: 'Test',
            street: 'Calle Test 123',
            city: 'Medellín',
            state: 'Antioquia',
            zipCode: '050001',
            country: 'Colombia',
            phone: '3001234567'
        },
        createdAt: orderDate,
        updatedAt: orderDate
    });
    
    await order.save();
    return order;
}

/**
 * Genera órdenes históricas para todos los usuarios
 */
async function generateOrders(users, products) {
    console.log('\n🛒 Generando órdenes históricas...');
    
    let totalOrders = 0;
    
    for (const userData of users) {
        // Cada usuario tiene entre 2 y 8 órdenes en los últimos 6 meses
        const orderCount = Math.floor(Math.random() * 7) + 2; // 2-8 órdenes
        
        for (let i = 0; i < orderCount; i++) {
            // Distribuir órdenes en los últimos 180 días (6 meses)
            const daysAgo = Math.floor(Math.random() * 180);
            
            const order = await generateOrder(
                userData.user,
                products,
                userData.preferences,
                daysAgo
            );
            
            if (order) {
                totalOrders++;
            }
        }
    }
    
    console.log(`✅ ${totalOrders} órdenes históricas creadas`);
}

/**
 * Sincroniza métricas de customers basado en las órdenes
 */
async function syncCustomerMetrics() {
    console.log('\n📊 Sincronizando métricas de customers...');
    
    const users = await User.find({});
    let syncedCount = 0;
    
    for (const user of users) {
        // Buscar o crear customer
        let customer = await Customer.findOne({ user: user._id });
        
        if (!customer) {
            customer = new Customer({
                user: user._id,
                contactInfo: {
                    email: user.email,
                    phone: '+57300000000'
                }
            });
        }
        
        // Actualizar métricas desde órdenes
        await customer.updateMetricsFromOrders();
        await customer.autoSegment();
        
        syncedCount++;
    }
    
    console.log(`✅ ${syncedCount} customers sincronizados`);
}

/**
 * Genera reporte del dataset
 */
async function generateReport() {
    console.log('\n📈 REPORTE DEL DATASET DE RECOMENDACIONES\n');
    console.log('='.repeat(60));
    
    // Usuarios
    const totalUsers = await User.countDocuments();
    console.log(`\n👥 USUARIOS: ${totalUsers}`);
    
    const usersByType = await User.aggregate([
        {
            $group: {
                _id: '$profile.type',
                count: { $sum: 1 }
            }
        }
    ]);
    
    usersByType.forEach(type => {
        console.log(`   - ${type._id || 'sin tipo'}: ${type.count}`);
    });
    
    // Productos
    const totalProducts = await Product.countDocuments();
    console.log(`\n📦 PRODUCTOS: ${totalProducts}`);
    
    const productsByCategory = await Product.aggregate([
        { $unwind: '$categories' },
        {
            $group: {
                _id: '$categories',
                count: { $sum: 1 },
                avgPrice: { $avg: '$price' }
            }
        },
        { $sort: { count: -1 } }
    ]);
    
    productsByCategory.forEach(cat => {
        console.log(`   - ${cat._id}: ${cat.count} productos (Precio promedio: $${Math.round(cat.avgPrice).toLocaleString('es-CO')})`);
    });
    
    // Órdenes
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
        {
            $group: {
                _id: null,
                total: { $sum: '$total' }
            }
        }
    ]);
    
    console.log(`\n🛒 ÓRDENES: ${totalOrders}`);
    console.log(`   - Revenue total: $${Math.round(totalRevenue[0]?.total || 0).toLocaleString('es-CO')}`);
    
    // Items más vendidos
    const topProducts = await Order.aggregate([
        { $unwind: '$items' },
        {
            $group: {
                _id: '$items.product',
                totalQuantity: { $sum: '$items.quantity' },
                totalRevenue: { $sum: '$items.subtotal' }
            }
        },
        { $sort: { totalQuantity: -1 } },
        { $limit: 5 },
        {
            $lookup: {
                from: 'products',
                localField: '_id',
                foreignField: '_id',
                as: 'product'
            }
        },
        { $unwind: '$product' }
    ]);
    
    console.log(`\n🔥 TOP 5 PRODUCTOS MÁS VENDIDOS:`);
    topProducts.forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.product.name}`);
        console.log(`      - Unidades vendidas: ${item.totalQuantity}`);
        console.log(`      - Revenue: $${Math.round(item.totalRevenue).toLocaleString('es-CO')}`);
    });
    
    // Co-ocurrencias (productos comprados juntos)
    console.log(`\n🔗 PATRONES DE CO-OCURRENCIA DETECTADOS:`);
    
    const coOccurrences = await Order.aggregate([
        { $match: { 'items.1': { $exists: true } } }, // Solo órdenes con 2+ items
        { $unwind: '$items' },
        {
            $lookup: {
                from: 'products',
                localField: 'items.product',
                foreignField: '_id',
                as: 'productData'
            }
        },
        { $unwind: '$productData' },
        {
            $group: {
                _id: '$_id',
                categories: { $addToSet: { $arrayElemAt: ['$productData.categories', 0] } }
            }
        },
        { $match: { 'categories.1': { $exists: true } } },
        { $unwind: '$categories' },
        {
            $group: {
                _id: '$categories',
                orders: { $addToSet: '$_id' }
            }
        }
    ]);
    
    // Encontrar pares de categorías
    const categoryPairs = {};
    for (const order of await Order.find({ 'items.1': { $exists: true } }).populate('items.product')) {
        const categories = [...new Set(order.items.map(item => item.product?.categories[0]).filter(Boolean))];
        
        for (let i = 0; i < categories.length; i++) {
            for (let j = i + 1; j < categories.length; j++) {
                const pair = [categories[i], categories[j]].sort().join(' + ');
                categoryPairs[pair] = (categoryPairs[pair] || 0) + 1;
            }
        }
    }
    
    const sortedPairs = Object.entries(categoryPairs)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);
    
    sortedPairs.forEach(([pair, count], index) => {
        console.log(`   ${index + 1}. ${pair}: ${count} veces`);
    });
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Dataset generado exitosamente\n');
}

/**
 * Función principal
 */
async function main() {
    try {
        console.log('🚀 Iniciando generación de dataset para recomendaciones...\n');
        
        // Conectar a la base de datos
        await connectDB(process.env.MONGODB_URI);
        
        // Limpiar datos existentes de prueba
        console.log('🧹 Limpiando datos de prueba existentes...');
        await User.deleteMany({ email: /@test\.com$/ });
        
        // Eliminar productos de prueba (por nombres específicos)
        const testProductNames = productsData.map(p => p.name);
        await Product.deleteMany({ name: { $in: testProductNames } });
        
        // Limpiar órdenes y customers de usuarios de prueba
        const testUsers = await User.find({ email: /@test\.com$/ });
        const testUserIds = testUsers.map(u => u._id);
        await Order.deleteMany({ user: { $in: testUserIds } });
        await Customer.deleteMany({ user: { $in: testUserIds } });
        
        console.log('✅ Datos de prueba limpiados');
        
        // Generar datos
        const users = await generateUsers();
        const products = await generateProducts();
        await generateOrders(users, products);
        await syncCustomerMetrics();
        
        // Generar reporte
        await generateReport();
        
        // Cerrar conexión
        await mongoose.connection.close();
        console.log('🔌 Conexión cerrada');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        await mongoose.connection.close();
        process.exit(1);
    }
}

// Ejecutar
main();

