/**
 * Servicio de alertas para fallos de MongoDB
 * Envía notificaciones cuando la base de datos falla
 */

import fallbackService from './fallbackService.js';

class DatabaseAlertService {
  constructor() {
    this.lastAlertSent = null;
    this.alertCooldown = 300000; // 5 minutos entre alertas
    this.alertHandlers = [];
  }

  /**
   * Registrar un handler de alertas
   */
  registerAlertHandler(handler) {
    if (typeof handler === 'function') {
      this.alertHandlers.push(handler);
    }
  }

  /**
   * Enviar alerta de fallo de MongoDB
   */
  async sendDatabaseDownAlert(error = null) {
    try {
      // Verificar cooldown para evitar spam
      if (this.lastAlertSent && (Date.now() - this.lastAlertSent) < this.alertCooldown) {
        console.log('⏳ Alerta en cooldown, esperando...');
        return false;
      }

      const alertData = {
        type: 'DATABASE_DOWN',
        severity: 'CRITICAL',
        title: '🚨 MongoDB No Disponible',
        message: 'La base de datos MongoDB no está disponible. Sistema operando en modo fallback.',
        error: error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        fallbackActive: true,
        failureCount: fallbackService.failureCount,
        memoryCacheSize: fallbackService.memoryCache.products.size
      };

      console.error('🚨 ALERTA CRÍTICA: MongoDB no disponible');
      console.error('   Error:', error?.message || 'Unknown');
      console.error('   Modo fallback:', fallbackService.isInFallbackMode() ? 'ACTIVO' : 'INACTIVO');
      console.error('   Fallos consecutivos:', fallbackService.failureCount);

      // Ejecutar todos los handlers registrados
      for (const handler of this.alertHandlers) {
        try {
          await handler(alertData);
        } catch (handlerError) {
          console.error('❌ Error ejecutando handler de alerta:', handlerError.message);
        }
      }

      this.lastAlertSent = Date.now();
      return true;
    } catch (error) {
      console.error('❌ Error enviando alerta de BD:', error.message);
      return false;
    }
  }

  /**
   * Enviar alerta de recuperación de MongoDB
   */
  async sendDatabaseRecoveredAlert() {
    try {
      const alertData = {
        type: 'DATABASE_RECOVERED',
        severity: 'INFO',
        title: '✅ MongoDB Recuperado',
        message: 'La base de datos MongoDB ha sido recuperada y está operativa nuevamente.',
        timestamp: new Date().toISOString(),
        fallbackActive: false,
        downtime: this.lastAlertSent ? Date.now() - this.lastAlertSent : 0
      };

      console.log('✅ MongoDB recuperado - Enviando notificación');

      // Ejecutar todos los handlers registrados
      for (const handler of this.alertHandlers) {
        try {
          await handler(alertData);
        } catch (handlerError) {
          console.error('❌ Error ejecutando handler de recuperación:', handlerError.message);
        }
      }

      this.lastAlertSent = null;
      return true;
    } catch (error) {
      console.error('❌ Error enviando alerta de recuperación:', error.message);
      return false;
    }
  }

  /**
   * Handler por defecto: Log en consola
   */
  static consoleAlertHandler(alertData) {
    console.log('\n' + '='.repeat(60));
    console.log(`${alertData.title}`);
    console.log('='.repeat(60));
    console.log(`Tipo: ${alertData.type}`);
    console.log(`Severidad: ${alertData.severity}`);
    console.log(`Mensaje: ${alertData.message}`);
    if (alertData.error) {
      console.log(`Error: ${alertData.error}`);
    }
    console.log(`Timestamp: ${alertData.timestamp}`);
    console.log('='.repeat(60) + '\n');
  }

  /**
   * Handler para webhooks (ejemplo)
   */
  static async webhookAlertHandler(alertData) {
    const webhookUrl = process.env.ALERT_WEBHOOK_URL;
    
    if (!webhookUrl) {
      return;
    }

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(alertData)
      });

      if (response.ok) {
        console.log('✅ Alerta enviada a webhook');
      } else {
        console.error('❌ Error enviando alerta a webhook:', response.statusText);
      }
    } catch (error) {
      console.error('❌ Error en webhook handler:', error.message);
    }
  }

  /**
   * Handler para email (ejemplo - requiere configuración de email)
   */
  static async emailAlertHandler(alertData) {
    // Este sería el lugar para enviar emails usando nodemailer
    // Por ahora solo log
    console.log('📧 Alerta por email:', alertData.title);
    // TODO: Implementar envío de email real si es necesario
  }

  /**
   * Handler para Slack (ejemplo)
   */
  static async slackAlertHandler(alertData) {
    const slackWebhook = process.env.SLACK_WEBHOOK_URL;
    
    if (!slackWebhook) {
      return;
    }

    try {
      const color = alertData.severity === 'CRITICAL' ? 'danger' : 
                    alertData.severity === 'WARNING' ? 'warning' : 'good';

      const slackMessage = {
        attachments: [{
          color: color,
          title: alertData.title,
          text: alertData.message,
          fields: [
            {
              title: 'Tipo',
              value: alertData.type,
              short: true
            },
            {
              title: 'Severidad',
              value: alertData.severity,
              short: true
            },
            {
              title: 'Timestamp',
              value: alertData.timestamp,
              short: false
            }
          ],
          footer: 'SuperGains Backend',
          ts: Math.floor(Date.now() / 1000)
        }]
      };

      const response = await fetch(slackWebhook, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(slackMessage)
      });

      if (response.ok) {
        console.log('✅ Alerta enviada a Slack');
      } else {
        console.error('❌ Error enviando alerta a Slack');
      }
    } catch (error) {
      console.error('❌ Error en Slack handler:', error.message);
    }
  }

  /**
   * Obtener estadísticas de alertas
   */
  getStats() {
    return {
      lastAlertSent: this.lastAlertSent ? new Date(this.lastAlertSent).toISOString() : null,
      alertCooldownMs: this.alertCooldown,
      registeredHandlers: this.alertHandlers.length,
      cooldownActive: this.lastAlertSent && (Date.now() - this.lastAlertSent) < this.alertCooldown
    };
  }
}

// Crear instancia singleton
const databaseAlertService = new DatabaseAlertService();

// Registrar handler por defecto (consola)
databaseAlertService.registerAlertHandler(DatabaseAlertService.consoleAlertHandler);

// Registrar otros handlers si están configurados
if (process.env.ALERT_WEBHOOK_URL) {
  databaseAlertService.registerAlertHandler(DatabaseAlertService.webhookAlertHandler);
}

if (process.env.SLACK_WEBHOOK_URL) {
  databaseAlertService.registerAlertHandler(DatabaseAlertService.slackAlertHandler);
}

export default databaseAlertService;
