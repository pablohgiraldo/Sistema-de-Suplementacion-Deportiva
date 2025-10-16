// Script para probar CORS del backend de producción
const testCORS = async () => {
    console.log('🧪 Probando configuración CORS del backend de producción...\n');

    const backendUrl = 'https://supergains-backend.onrender.com';
    const frontendUrl = 'https://supergains-frontend.vercel.app';

    try {
        // 1. Probar endpoint de salud
        console.log('1️⃣ Probando endpoint de salud...');
        const healthResponse = await fetch(`${backendUrl}/api/health`);
        console.log(`   Status: ${healthResponse.status}`);
        console.log(`   Headers: ${JSON.stringify(Object.fromEntries(healthResponse.headers.entries()), null, 2)}`);

        // 2. Probar OPTIONS request (preflight)
        console.log('\n2️⃣ Probando OPTIONS request (preflight)...');
        const optionsResponse = await fetch(`${backendUrl}/api/users/login`, {
            method: 'OPTIONS',
            headers: {
                'Origin': frontendUrl,
                'Access-Control-Request-Method': 'POST',
                'Access-Control-Request-Headers': 'Content-Type, Authorization'
            }
        });
        console.log(`   Status: ${optionsResponse.status}`);
        console.log(`   Headers: ${JSON.stringify(Object.fromEntries(optionsResponse.headers.entries()), null, 2)}`);

        // 3. Probar POST request con Origin
        console.log('\n3️⃣ Probando POST request con Origin...');
        const postResponse = await fetch(`${backendUrl}/api/users/login`, {
            method: 'POST',
            headers: {
                'Origin': frontendUrl,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'test@test.com',
                contraseña: 'test123'
            })
        });
        console.log(`   Status: ${postResponse.status}`);
        console.log(`   Headers: ${JSON.stringify(Object.fromEntries(postResponse.headers.entries()), null, 2)}`);

        // 4. Verificar headers específicos de CORS
        console.log('\n4️⃣ Verificando headers de CORS...');
        const corsHeaders = {
            'Access-Control-Allow-Origin': optionsResponse.headers.get('Access-Control-Allow-Origin'),
            'Access-Control-Allow-Methods': optionsResponse.headers.get('Access-Control-Allow-Methods'),
            'Access-Control-Allow-Headers': optionsResponse.headers.get('Access-Control-Allow-Headers'),
            'Access-Control-Allow-Credentials': optionsResponse.headers.get('Access-Control-Allow-Credentials')
        };
        console.log(`   CORS Headers: ${JSON.stringify(corsHeaders, null, 2)}`);

        console.log('\n✅ Pruebas de CORS completadas');

    } catch (error) {
        console.error('❌ Error en pruebas de CORS:', error);
    }
};

// Ejecutar pruebas
testCORS();
