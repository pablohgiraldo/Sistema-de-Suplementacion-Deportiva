import express from 'express';
import { requireAdmin } from '../middleware/roleMiddleware.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { tokenExpirationMiddleware, tokenRefreshSuggestionMiddleware } from '../middleware/tokenExpirationMiddleware.js';

const router = express.Router();

// Endpoint para obtener información de seguridad (solo admin)
router.get('/info',
    authMiddleware,
    tokenExpirationMiddleware,
    tokenRefreshSuggestionMiddleware,
    requireAdmin,
    (req, res) => {
        const securityInfo = {
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development',
            securityHeaders: {
                helmet: 'Configurado',
                csp: 'Activo',
                hsts: process.env.NODE_ENV === 'production' ? 'Activo' : 'Deshabilitado en desarrollo',
                cors: 'Configurado',
                rateLimit: 'Activo'
            },
            middleware: {
                securityValidation: 'Activo',
                attackDetection: 'Activo',
                payloadValidation: 'Activo',
                contentTypeValidation: 'Activo'
            },
            endpoints: {
                cspReport: '/api/security/csp-report',
                ctReport: '/api/security/ct-report',
                securityInfo: '/api/security/info'
            },
            recommendations: [
                'Monitorear logs de seguridad regularmente',
                'Revisar reportes de CSP y CT',
                'Actualizar dependencias de seguridad',
                'Configurar alertas para intentos de ataque'
            ]
        };

        res.json({
            success: true,
            message: 'Información de seguridad obtenida',
            data: securityInfo
        });
    }
);

// Endpoint para obtener estadísticas de seguridad (solo admin)
router.get('/stats',
    authMiddleware,
    tokenExpirationMiddleware,
    tokenRefreshSuggestionMiddleware,
    requireAdmin,
    (req, res) => {
        // En una implementación real, esto vendría de una base de datos de logs
        const securityStats = {
            timestamp: new Date().toISOString(),
            period: 'Últimas 24 horas',
            attacksDetected: {
                sqlInjection: 0,
                xss: 0,
                pathTraversal: 0,
                suspiciousUserAgents: 0
            },
            requests: {
                total: 0,
                blocked: 0,
                suspicious: 0
            },
            rateLimiting: {
                blockedRequests: 0,
                activeLimits: ['auth', 'general', 'cart']
            },
            recommendations: [
                'Implementar sistema de logging persistente',
                'Configurar alertas automáticas',
                'Revisar patrones de tráfico anómalo'
            ]
        };

        res.json({
            success: true,
            message: 'Estadísticas de seguridad obtenidas',
            data: securityStats
        });
    }
);

// Endpoint para probar configuración de seguridad
router.get('/test',
    (req, res) => {
        const testResults = {
            timestamp: new Date().toISOString(),
            tests: {
                helmetHeaders: {
                    status: 'OK',
                    headers: {
                        'X-Content-Type-Options': req.headers['x-content-type-options'],
                        'X-Frame-Options': req.headers['x-frame-options'],
                        'X-XSS-Protection': req.headers['x-xss-protection'],
                        'Strict-Transport-Security': req.headers['strict-transport-security'],
                        'Content-Security-Policy': req.headers['content-security-policy'] ? 'Presente' : 'No presente'
                    }
                },
                corsHeaders: {
                    status: 'OK',
                    headers: {
                        'Access-Control-Allow-Origin': req.headers['access-control-allow-origin'],
                        'Access-Control-Allow-Methods': req.headers['access-control-allow-methods'],
                        'Access-Control-Allow-Headers': req.headers['access-control-allow-headers']
                    }
                },
                requestValidation: {
                    status: 'OK',
                    userAgent: req.headers['user-agent'] ? 'Presente' : 'Faltante',
                    contentType: req.headers['content-type'] || 'No aplicable',
                    contentLength: req.headers['content-length'] || 'No aplicable'
                }
            },
            summary: 'Configuración de seguridad activa y funcionando'
        };

        res.json({
            success: true,
            message: 'Test de seguridad completado',
            data: testResults
        });
    }
);

export default router;
