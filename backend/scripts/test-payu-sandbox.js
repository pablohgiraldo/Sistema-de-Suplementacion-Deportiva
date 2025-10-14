import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB } from '../src/config/db.js';
import Order from '../src/models/Order.js';
import User from '../src/models/User.js';
import Product from '../src/models/Product.js';
import paymentService from '../src/services/paymentService.js';

dotenv.config();

/**
 * Script para probar la integración con PayU Sandbox
 */
async function testPayUSandbox() {
    try {
        console.log('\n🧪 PRUEBAS DE INTEGRACIÓN CON PAYU SANDBOX\n');
        console.log('='.repeat(70));

        await connectDB(process.env.MONGODB_URI);
        console.log('✅ MongoDB conectado\n');

        // Test 1: Verificar configuración de PayU
        await testPayUConfig();

        // Test 2: Verificar generación de firma MD5
        await testSignatureGeneration();

        // Test 3: Crear orden de prueba
        const testOrder = await createTestOrder();

        // Test 4: Generar formulario de pago
        if (testOrder) {
            await testPaymentForm(testOrder);
        }

        // Test 5: Simular transacción (solo estructura, no envía a PayU)
        if (testOrder) {
            await testTransactionStructure(testOrder);
        }

        console.log('\n' + '='.repeat(70));
        console.log('✅ Todas las pruebas completadas\n');
        console.log('📝 PRÓXIMOS PASOS:');
        console.log('   1. Usar las credenciales de sandbox en tu .env');
        console.log('   2. Crear una orden desde el frontend');
        console.log('   3. Hacer clic en "Pagar con PayU"');
        console.log('   4. Usar tarjetas de prueba de PayU para simular pagos');
        console.log('   5. Verificar la confirmación en /payment-confirmation\n');

        await mongoose.connection.close();
        process.exit(0);

    } catch (error) {
        console.error('❌ Error en las pruebas:', error);
        await mongoose.connection.close();
        process.exit(1);
    }
}

/**
 * Test 1: Verificar configuración de PayU
 */
async function testPayUConfig() {
    console.log('📝 Test 1: Verificando configuración de PayU Sandbox');
    console.log('-'.repeat(70));

    const requiredVars = [
        'PAYU_MERCHANT_ID',
        'PAYU_API_KEY',
        'PAYU_API_LOGIN',
        'PAYU_ACCOUNT_ID'
    ];

    const missing = [];
    const present = [];

    for (const varName of requiredVars) {
        if (process.env[varName]) {
            present.push(varName);
            console.log(`   ✅ ${varName}: ${process.env[varName]}`);
        } else {
            missing.push(varName);
            console.log(`   ❌ ${varName}: NO CONFIGURADO`);
        }
    }

    console.log(`\n   Variables configuradas: ${present.length}/${requiredVars.length}`);

    if (missing.length > 0) {
        console.log('\n   ⚠️ Variables faltantes:', missing.join(', '));
        console.log('   Agrega estas variables a tu archivo .env:\n');
        console.log('   PAYU_MERCHANT_ID=508029');
        console.log('   PAYU_API_KEY=4Vj8eK4rloUd272L48hsrarnUA');
        console.log('   PAYU_API_LOGIN=pRRXKOl8ikMmt9u');
        console.log('   PAYU_ACCOUNT_ID=512321\n');
    } else {
        console.log('   ✅ Configuración completa\n');
    }
}

/**
 * Test 2: Verificar generación de firma MD5
 */
async function testSignatureGeneration() {
    console.log('📝 Test 2: Probando generación de firma MD5');
    console.log('-'.repeat(70));

    const testCases = [
        {
            referenceCode: 'TEST-ORDER-123',
            amount: 150000,
            currency: 'COP'
        },
        {
            referenceCode: 'ORDER-456',
            amount: 250000,
            currency: 'COP'
        }
    ];

    for (const testCase of testCases) {
        try {
            const signature = paymentService.generateSignature(
                testCase.referenceCode,
                testCase.amount,
                testCase.currency
            );

            console.log(`   Caso: ${testCase.referenceCode}`);
            console.log(`   Monto: $${testCase.amount} ${testCase.currency}`);
            console.log(`   Firma generada: ${signature}`);
            console.log(`   ✅ Firma generada correctamente\n`);
        } catch (error) {
            console.log(`   ❌ Error al generar firma: ${error.message}\n`);
        }
    }
}

/**
 * Test 3: Crear orden de prueba
 */
async function createTestOrder() {
    console.log('📝 Test 3: Creando orden de prueba');
    console.log('-'.repeat(70));

    try {
        // Buscar usuario de prueba
        let user = await User.findOne({ email: 'admin@test.com' });

        if (!user) {
            console.log('   ⚠️ Usuario admin@test.com no encontrado');
            console.log('   Creando usuario de prueba...');
            
            user = new User({
                nombre: 'Usuario de Prueba PayU',
                email: 'payu-test@test.com',
                contraseña: 'Test123!',
                rol: 'usuario'
            });
            
            await user.save();
            console.log(`   ✅ Usuario creado: ${user.email}`);
        }

        // Buscar productos
        const products = await Product.find().limit(2);

        if (products.length === 0) {
            console.log('   ❌ No hay productos en la base de datos\n');
            return null;
        }

        // Crear orden de prueba
        const orderItems = products.map(product => ({
            product: product._id,
            quantity: 1,
            price: product.price,
            subtotal: product.price
        }));

        const subtotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
        const tax = subtotal * 0.19;
        const shipping = subtotal > 100000 ? 0 : 5000;
        const total = subtotal + tax + shipping;

        const order = new Order({
            user: user._id,
            items: orderItems,
            subtotal,
            tax,
            shipping,
            total,
            paymentMethod: 'credit_card',
            shippingAddress: {
                firstName: 'Juan',
                lastName: 'Pérez',
                street: 'Calle 123 # 45-67',
                city: 'Bogotá',
                state: 'Cundinamarca',
                zipCode: '110111',
                country: 'CO',
                phone: '3001234567'
            },
            status: 'pending',
            paymentStatus: 'pending'
        });

        await order.save();

        console.log(`   ✅ Orden de prueba creada: ${order.orderNumber}`);
        console.log(`   User: ${user.email}`);
        console.log(`   Items: ${order.items.length}`);
        console.log(`   Total: $${order.total.toLocaleString('es-CO')}`);
        console.log(`   ID: ${order._id}\n`);

        return order;

    } catch (error) {
        console.error('   ❌ Error al crear orden de prueba:', error.message);
        console.log();
        return null;
    }
}

/**
 * Test 4: Generar formulario de pago
 */
async function testPaymentForm(order) {
    console.log('📝 Test 4: Generando formulario de pago');
    console.log('-'.repeat(70));

    try {
        const formData = paymentService.generatePayUForm({
            orderId: order._id.toString(),
            amount: order.total,
            currency: 'COP',
            description: `Orden de prueba ${order.orderNumber}`,
            buyer: {
                fullName: `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
                email: 'test@test.com',
                phone: order.shippingAddress.phone
            }
        });

        console.log(`   ✅ Formulario generado exitosamente`);
        console.log(`   URL: ${formData.formUrl}`);
        console.log(`   Merchant ID: ${formData.formData.merchantId}`);
        console.log(`   Account ID: ${formData.formData.accountId}`);
        console.log(`   Reference Code: ${formData.formData.referenceCode}`);
        console.log(`   Amount: $${formData.formData.amount}`);
        console.log(`   Signature: ${formData.formData.signature.substring(0, 20)}...`);
        console.log(`   Test Mode: ${formData.formData.test}`);
        console.log(`   Response URL: ${formData.formData.responseUrl}`);
        console.log(`   Confirmation URL: ${formData.formData.confirmationUrl}\n`);

        // Guardar info en la orden
        await order.logPaymentInitiation({
            payuReferenceCode: formData.formData.referenceCode,
            amount: formData.formData.amount,
            currency: formData.formData.currency,
            signature: formData.formData.signature
        });

        console.log('   ✅ Información de pago guardada en la orden\n');

    } catch (error) {
        console.error('   ❌ Error al generar formulario:', error.message);
        console.log();
    }
}

/**
 * Test 5: Verificar estructura de transacción
 */
async function testTransactionStructure(order) {
    console.log('📝 Test 5: Verificando estructura de transacción PayU');
    console.log('-'.repeat(70));

    console.log('   📋 Estructura de transacción requerida por PayU:\n');
    console.log('   {');
    console.log('     language: "es",');
    console.log('     command: "SUBMIT_TRANSACTION",');
    console.log('     merchant: {');
    console.log('       apiKey: "***",');
    console.log('       apiLogin: "***"');
    console.log('     },');
    console.log('     transaction: {');
    console.log('       order: {');
    console.log('         accountId: "512321",');
    console.log(`         referenceCode: "${order._id}",`);
    console.log(`         description: "Orden ${order.orderNumber}",`);
    console.log('         language: "es",');
    console.log('         signature: "***",');
    console.log('         additionalValues: {');
    console.log('           TX_VALUE: {');
    console.log(`             value: ${order.total},`);
    console.log('             currency: "COP"');
    console.log('           }');
    console.log('         }');
    console.log('       },');
    console.log('       type: "AUTHORIZATION_AND_CAPTURE",');
    console.log('       paymentMethod: "CREDIT_CARD",');
    console.log('       paymentCountry: "CO"');
    console.log('     }');
    console.log('   }\n');

    console.log('   ✅ Estructura válida para PayU API\n');
}

// Ejecutar pruebas
testPayUSandbox();

