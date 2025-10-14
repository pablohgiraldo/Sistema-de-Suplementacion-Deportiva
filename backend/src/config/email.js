import nodemailer from 'nodemailer';
import 'dotenv/config';

// Configuración del transporter de Nodemailer
const createTransporter = () => {
    // Configuración para Gmail (puede cambiarse por otros proveedores)
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS // App password para Gmail
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    return transporter;
};

// Configuración alternativa para otros proveedores SMTP
const createCustomTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_SECURE === 'true', // true para 465, false para otros puertos
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        tls: {
            rejectUnauthorized: false
        }
    });
};

// Función para verificar la configuración del email
export const verifyEmailConfig = async () => {
    try {
        const transporter = createTransporter();
        await transporter.verify();
        console.log('✅ Configuración de email verificada correctamente');
        return { success: true, message: 'Email configurado correctamente' };
    } catch (error) {
        console.error('❌ Error en configuración de email:', error.message);
        return { success: false, message: error.message };
    }
};

// Función para enviar email de prueba
export const sendTestEmail = async (to, subject = 'Email de Prueba - SuperGains') => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: `"SuperGains" <${process.env.EMAIL_USER}>`,
            to: to,
            subject: subject,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #2563eb;">🧪 Email de Prueba - SuperGains</h2>
                    <p>Este es un email de prueba para verificar que la configuración de Nodemailer está funcionando correctamente.</p>
                    <p><strong>Fecha:</strong> ${new Date().toLocaleString()}</p>
                    <p><strong>Servidor:</strong> ${process.env.NODE_ENV || 'development'}</p>
                    <hr style="margin: 20px 0;">
                    <p style="color: #666; font-size: 12px;">
                        Este email fue enviado automáticamente desde el sistema SuperGains.
                    </p>
                </div>
            `
        };

        const result = await transporter.sendMail(mailOptions);
        console.log('✅ Email de prueba enviado:', result.messageId);
        return { success: true, messageId: result.messageId };
    } catch (error) {
        console.error('❌ Error enviando email de prueba:', error.message);
        return { success: false, message: error.message };
    }
};

// Función para enviar notificación de alerta de stock
export const sendStockAlertEmail = async (alertData) => {
    try {
        const transporter = createTransporter();

        const { product, inventory, alerts, adminEmail } = alertData;

        // Determinar el nivel de severidad
        const criticalAlerts = alerts.filter(alert => alert.severity === 'critical');
        const errorAlerts = alerts.filter(alert => alert.severity === 'error');
        const warningAlerts = alerts.filter(alert => alert.severity === 'warning');

        let severityLevel = 'warning';
        let severityColor = '#f59e0b';
        let severityIcon = '⚠️';

        if (criticalAlerts.length > 0) {
            severityLevel = 'critical';
            severityColor = '#dc2626';
            severityIcon = '🚨';
        } else if (errorAlerts.length > 0) {
            severityLevel = 'error';
            severityColor = '#ea580c';
            severityIcon = '⚠️';
        }

        const mailOptions = {
            from: `"SuperGains Alertas" <${process.env.EMAIL_USER}>`,
            to: adminEmail,
            subject: `${severityIcon} Alerta de Stock - ${product.name} (${severityLevel.toUpperCase()})`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                    <!-- Header -->
                    <div style="background: ${severityColor}; color: white; padding: 20px; text-align: center;">
                        <h1 style="margin: 0; font-size: 24px;">${severityIcon} Alerta de Stock</h1>
                        <p style="margin: 5px 0 0 0; opacity: 0.9;">SuperGains - Sistema de Inventario</p>
                    </div>
                    
                    <!-- Content -->
                    <div style="padding: 20px;">
                        <!-- Product Info -->
                        <div style="display: flex; align-items: center; margin-bottom: 20px; padding: 15px; background: #f9fafb; border-radius: 6px;">
                            <img src="${product.imageUrl || 'https://via.placeholder.com/80x80?text=Producto'}" 
                                 alt="${product.name}" 
                                 style="width: 80px; height: 80px; object-fit: cover; border-radius: 6px; margin-right: 15px;">
                            <div>
                                <h2 style="margin: 0 0 5px 0; color: #1f2937;">${product.name}</h2>
                                <p style="margin: 0; color: #6b7280; font-size: 14px;">${product.brand}</p>
                                <p style="margin: 5px 0 0 0; color: #374151; font-weight: bold;">Stock actual: <span style="color: ${severityColor};">${inventory.currentStock} unidades</span></p>
                            </div>
                        </div>
                        
                        <!-- Alert Details -->
                        <div style="margin-bottom: 20px;">
                            <h3 style="color: #1f2937; margin-bottom: 10px;">Detalles de la Alerta:</h3>
                            ${alerts.map(alert => `
                                <div style="padding: 10px; margin: 5px 0; background: ${alert.severity === 'critical' ? '#fef2f2' : alert.severity === 'error' ? '#fff7ed' : '#fffbeb'}; border-left: 4px solid ${alert.severity === 'critical' ? '#dc2626' : alert.severity === 'error' ? '#ea580c' : '#f59e0b'}; border-radius: 4px;">
                                    <strong>${alert.type === 'low_stock' ? 'Stock Bajo' : alert.type === 'critical_stock' ? 'Stock Crítico' : 'Stock Agotado'}</strong><br>
                                    <span style="color: #6b7280; font-size: 14px;">
                                        Umbral: ${alert.threshold} | Actual: ${alert.currentStock}
                                    </span>
                                </div>
                            `).join('')}
                        </div>
                        
                        <!-- Inventory Info -->
                        <div style="background: #f3f4f6; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
                            <h4 style="margin: 0 0 10px 0; color: #374151;">Información del Inventario:</h4>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 14px;">
                                <div><strong>Stock Mínimo:</strong> ${inventory.minStock}</div>
                                <div><strong>Stock Máximo:</strong> ${inventory.maxStock}</div>
                                <div><strong>Total Vendido:</strong> ${inventory.totalSold}</div>
                                <div><strong>Último Reabastecimiento:</strong> ${new Date(inventory.lastRestocked).toLocaleDateString()}</div>
                            </div>
                        </div>
                        
                        <!-- Action Required -->
                        <div style="background: #dbeafe; border: 1px solid #3b82f6; padding: 15px; border-radius: 6px; text-align: center;">
                            <h4 style="margin: 0 0 10px 0; color: #1e40af;">Acción Requerida</h4>
                            <p style="margin: 0; color: #1e40af;">
                                ${severityLevel === 'critical' ? 'Se requiere reabastecimiento inmediato de este producto.' :
                    severityLevel === 'error' ? 'Se recomienda reabastecer este producto pronto.' :
                        'Considere reabastecer este producto en las próximas semanas.'}
                            </p>
                        </div>
                    </div>
                    
                    <!-- Footer -->
                    <div style="background: #f9fafb; padding: 15px; text-align: center; border-top: 1px solid #e5e7eb;">
                        <p style="margin: 0; color: #6b7280; font-size: 12px;">
                            Este email fue enviado automáticamente desde el sistema SuperGains.<br>
                            Fecha: ${new Date().toLocaleString()}
                        </p>
                    </div>
                </div>
            `
        };

        const result = await transporter.sendMail(mailOptions);
        console.log(`✅ Email de alerta enviado para ${product.name}:`, result.messageId);
        return { success: true, messageId: result.messageId };
    } catch (error) {
        console.error('❌ Error enviando email de alerta:', error.message);
        return { success: false, message: error.message };
    }
};

// Función para enviar resumen de alertas
export const sendAlertsSummaryEmail = async (summaryData) => {
    try {
        const transporter = createTransporter();

        const { adminEmail, totalAlerts, criticalAlerts, errorAlerts, warningAlerts, alertsList } = summaryData;

        const mailOptions = {
            from: `"SuperGains Resumen" <${process.env.EMAIL_USER}>`,
            to: adminEmail,
            subject: `📊 Resumen de Alertas de Stock - ${totalAlerts} alertas activas`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                    <!-- Header -->
                    <div style="background: #1f2937; color: white; padding: 20px; text-align: center;">
                        <h1 style="margin: 0; font-size: 24px;">📊 Resumen de Alertas de Stock</h1>
                        <p style="margin: 5px 0 0 0; opacity: 0.9;">SuperGains - Sistema de Inventario</p>
                    </div>
                    
                    <!-- Summary Stats -->
                    <div style="padding: 20px;">
                        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 20px;">
                            <div style="text-align: center; padding: 15px; background: #f3f4f6; border-radius: 6px;">
                                <div style="font-size: 24px; font-weight: bold; color: #1f2937;">${totalAlerts}</div>
                                <div style="color: #6b7280; font-size: 14px;">Total Alertas</div>
                            </div>
                            <div style="text-align: center; padding: 15px; background: #fef2f2; border-radius: 6px;">
                                <div style="font-size: 24px; font-weight: bold; color: #dc2626;">${criticalAlerts}</div>
                                <div style="color: #6b7280; font-size: 14px;">Críticas</div>
                            </div>
                            <div style="text-align: center; padding: 15px; background: #fff7ed; border-radius: 6px;">
                                <div style="font-size: 24px; font-weight: bold; color: #ea580c;">${errorAlerts}</div>
                                <div style="color: #6b7280; font-size: 14px;">Errores</div>
                            </div>
                            <div style="text-align: center; padding: 15px; background: #fffbeb; border-radius: 6px;">
                                <div style="font-size: 24px; font-weight: bold; color: #f59e0b;">${warningAlerts}</div>
                                <div style="color: #6b7280; font-size: 14px;">Advertencias</div>
                            </div>
                        </div>
                        
                        <!-- Alerts List -->
                        <h3 style="color: #1f2937; margin-bottom: 15px;">Productos con Alertas:</h3>
                        ${alertsList.map(alert => `
                            <div style="border: 1px solid #e5e7eb; border-radius: 6px; margin-bottom: 10px; overflow: hidden;">
                                <div style="padding: 15px; background: #f9fafb;">
                                    <div style="display: flex; justify-content: between; align-items: center;">
                                        <div>
                                            <h4 style="margin: 0 0 5px 0; color: #1f2937;">${alert.product.name}</h4>
                                            <p style="margin: 0; color: #6b7280; font-size: 14px;">${alert.product.brand}</p>
                                        </div>
                                        <div style="text-align: right;">
                                            <div style="font-size: 18px; font-weight: bold; color: ${alert.highestSeverity === 1 ? '#dc2626' : alert.highestSeverity === 2 ? '#ea580c' : '#f59e0b'};">${alert.inventory.currentStock}</div>
                                            <div style="color: #6b7280; font-size: 12px;">unidades</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                        
                        <!-- Action Required -->
                        <div style="background: #dbeafe; border: 1px solid #3b82f6; padding: 15px; border-radius: 6px; text-align: center; margin-top: 20px;">
                            <h4 style="margin: 0 0 10px 0; color: #1e40af;">Acción Requerida</h4>
                            <p style="margin: 0; color: #1e40af;">
                                ${criticalAlerts > 0 ? 'Se requieren acciones inmediatas para productos con stock crítico.' :
                    errorAlerts > 0 ? 'Se recomienda revisar los productos con stock bajo.' :
                        'Considere revisar el inventario para optimizar los niveles de stock.'}
                            </p>
                        </div>
                    </div>
                    
                    <!-- Footer -->
                    <div style="background: #f9fafb; padding: 15px; text-align: center; border-top: 1px solid #e5e7eb;">
                        <p style="margin: 0; color: #6b7280; font-size: 12px;">
                            Este resumen fue generado automáticamente desde el sistema SuperGains.<br>
                            Fecha: ${new Date().toLocaleString()}
                        </p>
                    </div>
                </div>
            `
        };

        const result = await transporter.sendMail(mailOptions);
        console.log(`✅ Email de resumen enviado:`, result.messageId);
        return { success: true, messageId: result.messageId };
    } catch (error) {
        console.error('❌ Error enviando email de resumen:', error.message);
        return { success: false, message: error.message };
    }
};

// Función para enviar notificación de cambio de estado de orden
export const sendOrderStatusChangeEmail = async (orderData) => {
    try {
        const transporter = createTransporter();
        const { order, customerEmail, customerName, oldStatus, newStatus } = orderData;

        // Templates de email según el estado
        const statusTemplates = {
            processing: {
                subject: `✅ Tu pedido #${order.orderNumber} está siendo preparado`,
                icon: '📦',
                title: 'Tu pedido está en proceso',
                message: 'Hemos confirmado tu pago y estamos preparando tu pedido para el envío.',
                color: '#3b82f6',
                showTracking: false
            },
            shipped: {
                subject: `🚚 Tu pedido #${order.orderNumber} ha sido enviado`,
                icon: '🚚',
                title: 'Tu pedido está en camino',
                message: 'Tu pedido ha sido despachado y está en camino a tu dirección.',
                color: '#8b5cf6',
                showTracking: true
            },
            delivered: {
                subject: `🎉 Tu pedido #${order.orderNumber} ha sido entregado`,
                icon: '✅',
                title: '¡Pedido entregado exitosamente!',
                message: 'Tu pedido ha sido entregado. ¡Esperamos que lo disfrutes!',
                color: '#10b981',
                showTracking: false
            },
            cancelled: {
                subject: `❌ Tu pedido #${order.orderNumber} ha sido cancelado`,
                icon: '❌',
                title: 'Pedido cancelado',
                message: 'Tu pedido ha sido cancelado. Si realizaste un pago, será reembolsado en los próximos días.',
                color: '#ef4444',
                showTracking: false
            }
        };

        const template = statusTemplates[newStatus] || statusTemplates.processing;

        const mailOptions = {
            from: `"SuperGains" <${process.env.EMAIL_USER}>`,
            to: customerEmail,
            subject: template.subject,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                    <!-- Header -->
                    <div style="background: ${template.color}; color: white; padding: 30px 20px; text-align: center;">
                        <div style="font-size: 48px; margin-bottom: 10px;">${template.icon}</div>
                        <h1 style="margin: 0; font-size: 24px;">${template.title}</h1>
                        <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">Orden #${order.orderNumber}</p>
                    </div>
                    
                    <!-- Body -->
                    <div style="padding: 30px 20px;">
                        <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
                            Hola <strong>${customerName}</strong>,
                        </p>
                        <p style="font-size: 16px; color: #374151; line-height: 1.6; margin-bottom: 20px;">
                            ${template.message}
                        </p>
                        
                        <!-- Order Details -->
                        <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 20px; margin-bottom: 20px;">
                            <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 18px;">Detalles del Pedido</h3>
                            
                            <div style="display: grid; gap: 10px;">
                                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                                    <span style="color: #6b7280;">Número de orden:</span>
                                    <span style="color: #1f2937; font-weight: bold;">${order.orderNumber}</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                                    <span style="color: #6b7280;">Total:</span>
                                    <span style="color: #1f2937; font-weight: bold;">$${order.total.toLocaleString('es-CO')}</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                                    <span style="color: #6b7280;">Estado:</span>
                                    <span style="color: ${template.color}; font-weight: bold;">${template.title}</span>
                                </div>
                                ${template.showTracking && order.trackingNumber ? `
                                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                                    <span style="color: #6b7280;">Tracking:</span>
                                    <span style="color: #1f2937; font-weight: bold;">${order.trackingNumber}</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                                    <span style="color: #6b7280;">Transportadora:</span>
                                    <span style="color: #1f2937; font-weight: bold;">${order.carrier || 'Por asignar'}</span>
                                </div>
                                ` : ''}
                            </div>
                        </div>
                        
                        ${template.showTracking && order.trackingUrl ? `
                        <!-- Tracking Button -->
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${order.trackingUrl}" style="display: inline-block; background: ${template.color}; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                                🚚 Rastrear mi pedido
                            </a>
                        </div>
                        ` : ''}
                        
                        <!-- Shipping Address -->
                        ${order.shippingAddress ? `
                        <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 20px; margin-top: 20px;">
                            <h4 style="margin: 0 0 10px 0; color: #1f2937; font-size: 16px;">Dirección de Envío</h4>
                            <p style="margin: 0; color: #6b7280; line-height: 1.6;">
                                ${order.shippingAddress.firstName} ${order.shippingAddress.lastName}<br>
                                ${order.shippingAddress.street}<br>
                                ${order.shippingAddress.city}, ${order.shippingAddress.state}<br>
                                ${order.shippingAddress.zipCode}<br>
                                Tel: ${order.shippingAddress.phone}
                            </p>
                        </div>
                        ` : ''}
                        
                        <!-- Support Info -->
                        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                            <p style="color: #6b7280; font-size: 14px; margin: 0;">
                                ¿Necesitas ayuda? Contáctanos en <a href="mailto:support@supergains.com" style="color: ${template.color};">support@supergains.com</a>
                            </p>
                        </div>
                    </div>
                    
                    <!-- Footer -->
                    <div style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
                        <p style="margin: 0; color: #6b7280; font-size: 12px;">
                            Este email fue enviado automáticamente desde SuperGains<br>
                            Por favor no respondas a este mensaje<br>
                            Fecha: ${new Date().toLocaleString('es-CO')}
                        </p>
                    </div>
                </div>
            `
        };

        const result = await transporter.sendMail(mailOptions);
        console.log(`✅ Email de cambio de estado enviado a ${customerEmail}:`, result.messageId);
        return { success: true, messageId: result.messageId };
    } catch (error) {
        console.error('❌ Error enviando email de cambio de estado:', error.message);
        return { success: false, message: error.message };
    }
};

export default {
    createTransporter,
    createCustomTransporter,
    verifyEmailConfig,
    sendTestEmail,
    sendStockAlertEmail,
    sendAlertsSummaryEmail,
    sendOrderStatusChangeEmail
};
