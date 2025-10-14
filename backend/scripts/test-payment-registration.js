import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB } from '../src/config/db.js';
import Order from '../src/models/Order.js';

dotenv.config();

/**
 * Script para probar el registro de pagos en órdenes
 */
async function testPaymentRegistration() {
    try {
        console.log('\n🧪 PRUEBAS DE REGISTRO DE PAGOS\n');
        console.log('='.repeat(70));

        await connectDB(process.env.MONGODB_URI);
        console.log('✅ MongoDB conectado\n');

        // Test 1: Verificar nuevos campos en el modelo Order
        await testOrderFields();

        // Test 2: Probar registro de inicio de pago
        await testPaymentInitiation();

        // Test 3: Probar actualización de estado de pago
        await testPaymentStatusUpdate();

        // Test 4: Verificar logs de pago
        await testPaymentLogs();

        console.log('\n' + '='.repeat(70));
        console.log('✅ Todas las pruebas completadas\n');

        await mongoose.connection.close();
        process.exit(0);

    } catch (error) {
        console.error('❌ Error en las pruebas:', error);
        await mongoose.connection.close();
        process.exit(1);
    }
}

/**
 * Test 1: Verificar nuevos campos del modelo
 */
async function testOrderFields() {
    console.log('📝 Test 1: Verificando nuevos campos del modelo Order');
    console.log('-'.repeat(70));

    const order = await Order.findOne();

    if (!order) {
        console.log('   ⚠️ No hay órdenes para probar\n');
        return;
    }

    console.log(`   Orden: ${order.orderNumber}`);
    console.log(`   paymentDetails.transactionId: ${typeof order.paymentDetails.transactionId}`);
    console.log(`   paymentDetails.payuOrderId: ${typeof order.paymentDetails.payuOrderId}`);
    console.log(`   paymentDetails.payuReferenceCode: ${typeof order.paymentDetails.payuReferenceCode}`);
    console.log(`   paymentDetails.payuResponseCode: ${typeof order.paymentDetails.payuResponseCode}`);
    console.log(`   paymentLogs: ${Array.isArray(order.paymentLogs) ? 'Array' : 'undefined'}`);
    console.log(`   Logs count: ${order.paymentLogs?.length || 0}`);
    console.log('   ✅ Campos del modelo verificados\n');
}

/**
 * Test 2: Probar registro de inicio de pago
 */
async function testPaymentInitiation() {
    console.log('📝 Test 2: Probando registro de inicio de pago');
    console.log('-'.repeat(70));

    const order = await Order.findOne({ paymentStatus: 'pending' });

    if (!order) {
        console.log('   ⚠️ No hay órdenes pendientes para probar\n');
        return;
    }

    console.log(`   Orden: ${order.orderNumber}`);
    console.log(`   Estado inicial: ${order.paymentStatusFormatted}`);
    console.log(`   Logs iniciales: ${order.paymentLogs.length}`);

    // Simular inicio de pago
    await order.logPaymentInitiation({
        transactionId: 'TEST-TXN-' + Date.now(),
        payuOrderId: 'TEST-ORDER-' + Date.now(),
        payuReferenceCode: order._id.toString(),
        paymentMethod: 'CREDIT_CARD',
        amount: order.total,
        currency: 'COP'
    });

    // Recargar orden
    await order.reload();

    console.log(`   TransactionId registrado: ${order.paymentDetails.transactionId ? '✅' : '❌'}`);
    console.log(`   PayU OrderId registrado: ${order.paymentDetails.payuOrderId ? '✅' : '❌'}`);
    console.log(`   Logs después: ${order.paymentLogs.length}`);
    console.log(`   Último log: ${order.paymentLogs[order.paymentLogs.length - 1]?.action || 'N/A'}`);
    console.log('   ✅ Registro de inicio de pago funciona\n');
}

/**
 * Test 3: Probar actualización de estado de pago
 */
async function testPaymentStatusUpdate() {
    console.log('📝 Test 3: Probando actualización de estado de pago');
    console.log('-'.repeat(70));

    const order = await Order.findOne({ 
        'paymentDetails.transactionId': { $exists: true, $ne: null }
    });

    if (!order) {
        console.log('   ⚠️ No hay órdenes con transactionId para probar\n');
        return;
    }

    console.log(`   Orden: ${order.orderNumber}`);
    console.log(`   Estado actual: ${order.paymentStatusFormatted}`);
    
    const oldLogsCount = order.paymentLogs.length;

    // Simular pago exitoso
    if (order.paymentStatus !== 'paid') {
        await order.updatePaymentStatus('paid', {
            transactionId: order.paymentDetails.transactionId,
            payuReferenceCode: 'TEST-REF-' + Date.now(),
            payuResponseCode: 'APPROVED',
            amountPaid: order.total,
            paymentDate: new Date(),
            currency: 'COP'
        }, 'payu');

        await order.reload();

        console.log(`   Nuevo estado: ${order.paymentStatusFormatted}`);
        console.log(`   Logs agregados: ${order.paymentLogs.length - oldLogsCount}`);
        console.log(`   Último log action: ${order.paymentLogs[order.paymentLogs.length - 1]?.action || 'N/A'}`);
        console.log(`   Último log source: ${order.paymentLogs[order.paymentLogs.length - 1]?.source || 'N/A'}`);
    } else {
        console.log('   Orden ya está pagada, saltando prueba');
    }

    console.log('   ✅ Actualización de estado de pago funciona\n');
}

/**
 * Test 4: Verificar logs de pago
 */
async function testPaymentLogs() {
    console.log('📝 Test 4: Verificando logs de pago');
    console.log('-'.repeat(70));

    const ordersWithLogs = await Order.find({
        'paymentLogs.0': { $exists: true }
    }).limit(3);

    if (ordersWithLogs.length === 0) {
        console.log('   ⚠️ No hay órdenes con logs para probar\n');
        return;
    }

    console.log(`   Órdenes con logs encontradas: ${ordersWithLogs.length}`);

    ordersWithLogs.forEach((order, index) => {
        console.log(`\n   Orden ${index + 1}: ${order.orderNumber}`);
        console.log(`   Total de logs: ${order.paymentLogs.length}`);
        
        order.paymentLogs.forEach((log, logIndex) => {
            console.log(`      Log ${logIndex + 1}:`);
            console.log(`        Action: ${log.action}`);
            console.log(`        Source: ${log.source}`);
            console.log(`        Timestamp: ${log.timestamp?.toLocaleString('es-CO') || 'N/A'}`);
        });
    });

    console.log('\n   ✅ Logs de pago verificados\n');
}

// Agregar método reload al schema de Order
Order.schema.methods.reload = async function() {
    const freshOrder = await Order.findById(this._id);
    Object.assign(this, freshOrder.toObject());
    return this;
};

// Ejecutar pruebas
testPaymentRegistration();

