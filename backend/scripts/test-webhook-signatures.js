import crypto from 'crypto';
import dotenv from 'dotenv';
import webhookService from '../src/services/webhookService.js';

dotenv.config();

/**
 * Script para probar validación de firmas de webhooks
 */
async function testWebhookSignatures() {
    try {
        console.log('\n🔐 PRUEBAS DE VALIDACIÓN DE FIRMAS DE WEBHOOKS\n');
        console.log('='.repeat(70));

        // Test 1: Generar firma válida
        await testValidSignatureGeneration();

        // Test 2: Verificar firma válida
        await testValidSignatureVerification();

        // Test 3: Detectar firma inválida
        await testInvalidSignatureDetection();

        // Test 4: Detectar timestamp expirado
        await testExpiredTimestamp();

        // Test 5: Detectar timestamp futuro
        await testFutureTimestamp();

        console.log('\n' + '='.repeat(70));
        console.log('✅ Todas las pruebas de firma completadas\n');

        process.exit(0);

    } catch (error) {
        console.error('❌ Error en las pruebas:', error);
        process.exit(1);
    }
}

/**
 * Test 1: Generar firma HMAC-SHA256 válida
 */
async function testValidSignatureGeneration() {
    console.log('📝 Test 1: Generación de firma HMAC-SHA256');
    console.log('-'.repeat(70));

    const secret = webhookService.generateWebhookSecret();
    const timestamp = Date.now();
    const payload = {
        event: 'order.created',
        orderId: 'TEST123',
        amount: 150000
    };

    // Generar firma
    const data = timestamp + '.' + JSON.stringify(payload);
    const signature = crypto.createHmac('sha256', secret).update(data).digest('hex');

    console.log(`   Secret: ${secret.substring(0, 20)}...`);
    console.log(`   Timestamp: ${timestamp}`);
    console.log(`   Payload: ${JSON.stringify(payload)}`);
    console.log(`   Data string: ${data.substring(0, 50)}...`);
    console.log(`   Firma generada: ${signature}`);
    console.log(`   Longitud: ${signature.length} caracteres`);
    console.log('   ✅ Firma HMAC-SHA256 generada correctamente\n');
}

/**
 * Test 2: Verificar firma válida
 */
async function testValidSignatureVerification() {
    console.log('📝 Test 2: Verificación de firma válida');
    console.log('-'.repeat(70));

    const secret = 'test_secret_123456789';
    const timestamp = Date.now();
    const payload = {
        event: 'payment.approved',
        orderId: 'ORD-123',
        amount: 200000
    };

    // Generar firma correcta
    const data = timestamp + '.' + JSON.stringify(payload);
    const validSignature = crypto.createHmac('sha256', secret).update(data).digest('hex');

    // Verificar
    const isValid = webhookService.verifyWebhookSignature(
        secret,
        validSignature,
        timestamp,
        payload
    );

    console.log(`   Firma: ${validSignature}`);
    console.log(`   Resultado: ${isValid ? '✅ VÁLIDA' : '❌ INVÁLIDA'}`);

    if (isValid) {
        console.log('   ✅ Verificación de firma válida funciona correctamente\n');
    } else {
        console.log('   ❌ ERROR: Firma válida no fue aceptada\n');
    }
}

/**
 * Test 3: Detectar firma inválida
 */
async function testInvalidSignatureDetection() {
    console.log('📝 Test 3: Detección de firma inválida');
    console.log('-'.repeat(70));

    const secret = 'test_secret_123456789';
    const timestamp = Date.now();
    const payload = {
        event: 'payment.approved',
        orderId: 'ORD-123',
        amount: 200000
    };

    // Firma incorrecta (manipulada)
    const invalidSignature = crypto.createHmac('sha256', 'wrong_secret').update('invalid').digest('hex');

    // Verificar
    const isValid = webhookService.verifyWebhookSignature(
        secret,
        invalidSignature,
        timestamp,
        payload
    );

    console.log(`   Firma manipulada: ${invalidSignature}`);
    console.log(`   Resultado: ${isValid ? '❌ ACEPTADA (ERROR)' : '✅ RECHAZADA'}`);

    if (!isValid) {
        console.log('   ✅ Detección de firma inválida funciona correctamente\n');
    } else {
        console.log('   ❌ ERROR: Firma inválida fue aceptada\n');
    }
}

/**
 * Test 4: Detectar timestamp expirado
 */
async function testExpiredTimestamp() {
    console.log('📝 Test 4: Detección de timestamp expirado');
    console.log('-'.repeat(70));

    const secret = 'test_secret_123456789';
    const timestamp = Date.now() - (10 * 60 * 1000); // 10 minutos atrás
    const payload = {
        event: 'payment.approved',
        orderId: 'ORD-123'
    };

    // Generar firma válida pero con timestamp antiguo
    const data = timestamp + '.' + JSON.stringify(payload);
    const signature = crypto.createHmac('sha256', secret).update(data).digest('hex');

    // Verificar
    const isValid = webhookService.verifyWebhookSignature(
        secret,
        signature,
        timestamp,
        payload
    );

    const age = Date.now() - timestamp;
    const ageMinutes = Math.floor(age / 1000 / 60);

    console.log(`   Timestamp: ${timestamp} (hace ${ageMinutes} minutos)`);
    console.log(`   Edad: ${ageMinutes} minutos (máx: 5 minutos)`);
    console.log(`   Resultado: ${isValid ? '❌ ACEPTADO (ERROR)' : '✅ RECHAZADO'}`);

    if (!isValid) {
        console.log('   ✅ Detección de timestamp expirado funciona correctamente\n');
    } else {
        console.log('   ❌ ERROR: Timestamp expirado fue aceptado\n');
    }
}

/**
 * Test 5: Detectar timestamp futuro
 */
async function testFutureTimestamp() {
    console.log('📝 Test 5: Detección de timestamp futuro');
    console.log('-'.repeat(70));

    const secret = 'test_secret_123456789';
    const timestamp = Date.now() + (10 * 60 * 1000); // 10 minutos en el futuro
    const payload = {
        event: 'payment.approved',
        orderId: 'ORD-123'
    };

    // Generar firma válida pero con timestamp futuro
    const data = timestamp + '.' + JSON.stringify(payload);
    const signature = crypto.createHmac('sha256', secret).update(data).digest('hex');

    // Verificar
    const isValid = webhookService.verifyWebhookSignature(
        secret,
        signature,
        timestamp,
        payload
    );

    const age = Date.now() - timestamp;
    const ageMinutes = Math.floor(Math.abs(age) / 1000 / 60);

    console.log(`   Timestamp: ${timestamp} (en ${ageMinutes} minutos)`);
    console.log(`   Resultado: ${isValid ? '❌ ACEPTADO (ERROR)' : '✅ RECHAZADO'}`);

    if (!isValid) {
        console.log('   ✅ Detección de timestamp futuro funciona correctamente\n');
    } else {
        console.log('   ❌ ERROR: Timestamp futuro fue aceptado\n');
    }
}

// Ejecutar pruebas
testWebhookSignatures();

