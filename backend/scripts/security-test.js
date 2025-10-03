#!/usr/bin/env node

/**
 * Script de pruebas de seguridad simuladas para SuperGains
 * Simula las pruebas que realizaría OWASP ZAP
 */

import fs from 'fs';
import path from 'path';

const SECURITY_TESTS = {
    // URLs a probar
    targets: [
        'http://localhost:4000/api/health',
        'http://localhost:4000/api/products',
        'http://localhost:4000/api/users/login',
        'http://localhost:4000/api/users/register',
        'http://localhost:5173/',
        'http://localhost:5173/login',
        'http://localhost:5173/products'
    ],

    // Configuración
    outputDir: './security-reports',
    timeout: 5000
};

class SecurityTester {
    constructor() {
        this.results = {
            timestamp: new Date().toISOString(),
            tests: [],
            summary: {
                total: 0,
                passed: 0,
                failed: 0,
                warnings: 0
            }
        };
    }

    /**
     * Verificar si el servidor está ejecutándose
     */
    async checkServerStatus() {
        console.log('🔍 Verificando estado del servidor...');

        try {
            const response = await fetch('http://localhost:4000/api/health', {
                timeout: SECURITY_TESTS.timeout
            });

            if (response.ok) {
                console.log('✅ Servidor backend ejecutándose en puerto 4000');
                return true;
            } else {
                console.log('⚠️  Servidor backend respondiendo con error');
                return false;
            }
        } catch (error) {
            console.log('❌ Servidor backend no disponible');
            return false;
        }
    }

    /**
     * Probar headers de seguridad
     */
    async testSecurityHeaders() {
        console.log('🔒 Probando headers de seguridad...');

        const tests = [
            {
                name: 'X-Content-Type-Options',
                description: 'Verificar header X-Content-Type-Options',
                test: async () => {
                    const response = await fetch('http://localhost:4000/api/health');
                    const header = response.headers.get('x-content-type-options');
                    return header === 'nosniff';
                }
            },
            {
                name: 'X-Frame-Options',
                description: 'Verificar header X-Frame-Options',
                test: async () => {
                    const response = await fetch('http://localhost:4000/api/health');
                    const header = response.headers.get('x-frame-options');
                    return header && (header === 'DENY' || header === 'SAMEORIGIN');
                }
            },
            {
                name: 'X-XSS-Protection',
                description: 'Verificar header X-XSS-Protection',
                test: async () => {
                    const response = await fetch('http://localhost:4000/api/health');
                    const header = response.headers.get('x-xss-protection');
                    return header && header.includes('1');
                }
            },
            {
                name: 'Strict-Transport-Security',
                description: 'Verificar header HSTS',
                test: async () => {
                    const response = await fetch('http://localhost:4000/api/health');
                    const header = response.headers.get('strict-transport-security');
                    return header && header.includes('max-age');
                }
            }
        ];

        for (const test of tests) {
            try {
                const result = await test.test();
                this.addTestResult(test.name, test.description, result,
                    result ? 'PASS' : 'FAIL',
                    result ? 'Header configurado correctamente' : 'Header faltante o mal configurado');
            } catch (error) {
                this.addTestResult(test.name, test.description, false, 'ERROR', error.message);
            }
        }
    }

    /**
     * Probar autenticación y autorización
     */
    async testAuthentication() {
        console.log('🔐 Probando autenticación y autorización...');

        const tests = [
            {
                name: 'Login con credenciales inválidas',
                description: 'Verificar que el login rechaza credenciales inválidas',
                test: async () => {
                    const response = await fetch('http://localhost:4000/api/users/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            email: 'invalid@test.com',
                            password: 'wrongpassword'
                        })
                    });
                    return response.status === 400 || response.status === 401;
                }
            },
            {
                name: 'Acceso sin autenticación',
                description: 'Verificar que endpoints protegidos requieren autenticación',
                test: async () => {
                    const response = await fetch('http://localhost:4000/api/users');
                    return response.status === 401;
                }
            },
            {
                name: 'Rate limiting en login',
                description: 'Verificar que el rate limiting funciona en login',
                test: async () => {
                    // Hacer múltiples requests rápidos
                    const promises = Array(10).fill().map(() =>
                        fetch('http://localhost:4000/api/users/login', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                email: 'test@test.com',
                                password: 'test'
                            })
                        })
                    );

                    const responses = await Promise.all(promises);
                    const rateLimited = responses.some(r => r.status === 429);
                    return rateLimited;
                }
            }
        ];

        for (const test of tests) {
            try {
                const result = await test.test();
                this.addTestResult(test.name, test.description, result,
                    result ? 'PASS' : 'FAIL',
                    result ? 'Autenticación funcionando correctamente' : 'Problema de autenticación detectado');
            } catch (error) {
                this.addTestResult(test.name, test.description, false, 'ERROR', error.message);
            }
        }
    }

    /**
     * Probar validación de entrada
     */
    async testInputValidation() {
        console.log('📝 Probando validación de entrada...');

        const tests = [
            {
                name: 'SQL Injection en productos',
                description: 'Verificar protección contra SQL injection',
                test: async () => {
                    const response = await fetch('http://localhost:4000/api/products?search=1\' OR \'1\'=\'1');
                    return response.status !== 500; // No debería causar error del servidor
                }
            },
            {
                name: 'XSS en búsqueda',
                description: 'Verificar protección contra XSS',
                test: async () => {
                    const response = await fetch('http://localhost:4000/api/products?search=<script>alert("xss")</script>');
                    const text = await response.text();
                    return !text.includes('<script>');
                }
            },
            {
                name: 'Validación de email',
                description: 'Verificar validación de formato de email',
                test: async () => {
                    const response = await fetch('http://localhost:4000/api/users/register', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            email: 'invalid-email',
                            password: 'password123',
                            name: 'Test User'
                        })
                    });
                    return response.status === 400;
                }
            }
        ];

        for (const test of tests) {
            try {
                const result = await test.test();
                this.addTestResult(test.name, test.description, result,
                    result ? 'PASS' : 'FAIL',
                    result ? 'Validación de entrada funcionando' : 'Vulnerabilidad de validación detectada');
            } catch (error) {
                this.addTestResult(test.name, test.description, false, 'ERROR', error.message);
            }
        }
    }

    /**
     * Probar CORS
     */
    async testCORS() {
        console.log('🌐 Probando configuración CORS...');

        const tests = [
            {
                name: 'CORS desde origen no permitido',
                description: 'Verificar que CORS bloquea orígenes no permitidos',
                test: async () => {
                    const response = await fetch('http://localhost:4000/api/health', {
                        headers: { 'Origin': 'http://malicious-site.com' }
                    });
                    const corsHeader = response.headers.get('access-control-allow-origin');
                    return !corsHeader || corsHeader !== 'http://malicious-site.com';
                }
            },
            {
                name: 'CORS desde localhost',
                description: 'Verificar que CORS permite localhost',
                test: async () => {
                    const response = await fetch('http://localhost:4000/api/health', {
                        headers: { 'Origin': 'http://localhost:5173' }
                    });
                    const corsHeader = response.headers.get('access-control-allow-origin');
                    return corsHeader === 'http://localhost:5173';
                }
            }
        ];

        for (const test of tests) {
            try {
                const result = await test.test();
                this.addTestResult(test.name, test.description, result,
                    result ? 'PASS' : 'FAIL',
                    result ? 'CORS configurado correctamente' : 'Problema de CORS detectado');
            } catch (error) {
                this.addTestResult(test.name, test.description, false, 'ERROR', error.message);
            }
        }
    }

    /**
     * Agregar resultado de prueba
     */
    addTestResult(name, description, passed, status, message) {
        const result = {
            name,
            description,
            passed,
            status,
            message,
            timestamp: new Date().toISOString()
        };

        this.results.tests.push(result);
        this.results.summary.total++;

        if (status === 'PASS') {
            this.results.summary.passed++;
        } else if (status === 'FAIL') {
            this.results.summary.failed++;
        } else {
            this.results.summary.warnings++;
        }
    }

    /**
     * Generar reporte de seguridad
     */
    async generateReport() {
        console.log('📊 Generando reporte de seguridad...');

        // Crear directorio si no existe
        if (!fs.existsSync(SECURITY_TESTS.outputDir)) {
            fs.mkdirSync(SECURITY_TESTS.outputDir, { recursive: true });
        }

        const reportPath = path.join(SECURITY_TESTS.outputDir, 'security-test-report.json');
        const htmlPath = path.join(SECURITY_TESTS.outputDir, 'security-test-report.html');

        // Guardar reporte JSON
        fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));

        // Generar reporte HTML
        const htmlReport = this.generateHTMLReport();
        fs.writeFileSync(htmlPath, htmlReport);

        console.log(`✅ Reporte generado: ${reportPath}`);
        console.log(`📄 Reporte HTML: ${htmlPath}`);

        return this.results;
    }

    /**
     * Generar reporte HTML
     */
    generateHTMLReport() {
        const { summary, tests } = this.results;

        return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reporte de Pruebas de Seguridad - SuperGains</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px; margin-bottom: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 30px 0; }
        .metric { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; border-left: 4px solid #007bff; }
        .metric.passed { border-left-color: #28a745; }
        .metric.failed { border-left-color: #dc3545; }
        .metric.warnings { border-left-color: #ffc107; }
        .test-result { margin: 15px 0; padding: 15px; border-radius: 6px; border-left: 4px solid #ddd; }
        .test-result.pass { background: #d4edda; border-left-color: #28a745; }
        .test-result.fail { background: #f8d7da; border-left-color: #dc3545; }
        .test-result.error { background: #fff3cd; border-left-color: #ffc107; }
        .status { font-weight: bold; padding: 4px 8px; border-radius: 4px; font-size: 0.9em; }
        .status.PASS { background: #28a745; color: white; }
        .status.FAIL { background: #dc3545; color: white; }
        .status.ERROR { background: #ffc107; color: black; }
        .recommendations { background: #e7f3ff; padding: 20px; border-radius: 8px; margin-top: 30px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔒 Reporte de Pruebas de Seguridad</h1>
            <h2>SuperGains - ${this.results.timestamp}</h2>
            <p>Pruebas automatizadas de seguridad realizadas con herramientas simuladas</p>
        </div>
        
        <div class="summary">
            <div class="metric">
                <h3>${summary.total}</h3>
                <p>Total de Pruebas</p>
            </div>
            <div class="metric passed">
                <h3>${summary.passed}</h3>
                <p>Exitosas</p>
            </div>
            <div class="metric failed">
                <h3>${summary.failed}</h3>
                <p>Fallidas</p>
            </div>
            <div class="metric warnings">
                <h3>${summary.warnings}</h3>
                <p>Advertencias</p>
            </div>
        </div>
        
        <h2>📋 Resultados Detallados</h2>
        
        ${tests.map(test => `
            <div class="test-result ${test.status.toLowerCase()}">
                <h3>${test.name}</h3>
                <p><strong>Descripción:</strong> ${test.description}</p>
                <p><strong>Estado:</strong> <span class="status ${test.status}">${test.status}</span></p>
                <p><strong>Mensaje:</strong> ${test.message}</p>
                <p><strong>Timestamp:</strong> ${test.timestamp}</p>
            </div>
        `).join('')}
        
        <div class="recommendations">
            <h2>💡 Recomendaciones de Seguridad</h2>
            <ul>
                <li>Implementar Content Security Policy (CSP) más estricta</li>
                <li>Configurar headers de seguridad adicionales</li>
                <li>Implementar logging de seguridad más detallado</li>
                <li>Realizar pruebas de penetración regulares</li>
                <li>Implementar monitoreo de seguridad en tiempo real</li>
                <li>Configurar alertas de seguridad automáticas</li>
            </ul>
        </div>
    </div>
</body>
</html>`;
    }

    /**
     * Ejecutar todas las pruebas de seguridad
     */
    async runAllTests() {
        console.log('🔒 Iniciando pruebas de seguridad automatizadas');
        console.log('='.repeat(60));

        try {
            // Verificar servidor
            const serverRunning = await this.checkServerStatus();
            if (!serverRunning) {
                console.log('⚠️  Servidor no disponible, ejecutando pruebas limitadas...');
            }

            // Ejecutar pruebas
            await this.testSecurityHeaders();
            await this.testAuthentication();
            await this.testInputValidation();
            await this.testCORS();

            // Generar reporte
            const report = await this.generateReport();

            console.log('='.repeat(60));
            console.log('✅ Pruebas de seguridad completadas');
            console.log(`📊 Total: ${report.summary.total}`);
            console.log(`✅ Exitosas: ${report.summary.passed}`);
            console.log(`❌ Fallidas: ${report.summary.failed}`);
            console.log(`⚠️  Advertencias: ${report.summary.warnings}`);

            return report;

        } catch (error) {
            console.error('❌ Error durante las pruebas:', error);
            throw error;
        }
    }
}

// Ejecutar pruebas si el script se ejecuta directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    const tester = new SecurityTester();
    tester.runAllTests()
        .then(() => {
            console.log('🎉 Pruebas de seguridad finalizadas');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Error en las pruebas:', error);
            process.exit(1);
        });
}

export default SecurityTester;
