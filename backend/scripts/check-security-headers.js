#!/usr/bin/env node

/**
 * Script para verificar headers de seguridad manualmente
 */

const SECURITY_HEADERS = [
    'X-XSS-Protection',
    'X-Content-Type-Options',
    'X-Frame-Options',
    'Strict-Transport-Security',
    'Referrer-Policy',
    'Permissions-Policy',
    'Content-Security-Policy',
    'X-Request-ID',
    'Server'
];

async function checkSecurityHeaders() {
    console.log('🔒 Verificando headers de seguridad...');
    console.log('='.repeat(50));

    try {
        const response = await fetch('http://localhost:4000/api/health');

        console.log(`📊 Status: ${response.status} ${response.statusText}`);
        console.log(`🌐 URL: ${response.url}`);
        console.log('');

        console.log('🔍 Headers de Seguridad Encontrados:');
        console.log('-'.repeat(50));

        let securityHeadersFound = 0;

        for (const headerName of SECURITY_HEADERS) {
            const headerValue = response.headers.get(headerName);
            if (headerValue) {
                console.log(`✅ ${headerName}: ${headerValue}`);
                securityHeadersFound++;
            } else {
                console.log(`❌ ${headerName}: No encontrado`);
            }
        }

        console.log('');
        console.log('📋 Todos los Headers:');
        console.log('-'.repeat(50));

        for (const [name, value] of response.headers.entries()) {
            console.log(`${name}: ${value}`);
        }

        console.log('');
        console.log('='.repeat(50));
        console.log(`📊 Resumen: ${securityHeadersFound}/${SECURITY_HEADERS.length} headers de seguridad encontrados`);

        if (securityHeadersFound === SECURITY_HEADERS.length) {
            console.log('🎉 ¡Todos los headers de seguridad están configurados correctamente!');
        } else {
            console.log('⚠️  Algunos headers de seguridad faltan o están mal configurados');
        }

    } catch (error) {
        console.error('❌ Error al verificar headers:', error.message);
    }
}

// Ejecutar verificación
checkSecurityHeaders();
