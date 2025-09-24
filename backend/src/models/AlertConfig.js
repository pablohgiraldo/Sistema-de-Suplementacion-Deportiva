import mongoose from "mongoose";

const alertConfigSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: [true, "El producto es obligatorio"],
            unique: true // Un producto solo puede tener una configuración de alertas
        },
        lowStockThreshold: {
            type: Number,
            required: [true, "El threshold de stock bajo es obligatorio"],
            min: [0, "El threshold no puede ser negativo"],
            default: 10
        },
        criticalStockThreshold: {
            type: Number,
            required: [true, "El threshold de stock crítico es obligatorio"],
            min: [0, "El threshold no puede ser negativo"],
            default: 5
        },
        outOfStockThreshold: {
            type: Number,
            required: [true, "El threshold de stock agotado es obligatorio"],
            min: [0, "El threshold no puede ser negativo"],
            default: 0
        },
        // Configuración de alertas por email
        emailAlerts: {
            enabled: {
                type: Boolean,
                default: true
            },
            lowStock: {
                type: Boolean,
                default: true
            },
            criticalStock: {
                type: Boolean,
                default: true
            },
            outOfStock: {
                type: Boolean,
                default: true
            },
            recipients: [{
                type: String,
                validate: {
                    validator: function (v) {
                        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
                    },
                    message: 'Email inválido'
                }
            }]
        },
        // Configuración de alertas por notificación en app
        appAlerts: {
            enabled: {
                type: Boolean,
                default: true
            },
            lowStock: {
                type: Boolean,
                default: true
            },
            criticalStock: {
                type: Boolean,
                default: true
            },
            outOfStock: {
                type: Boolean,
                default: true
            }
        },
        // Configuración de alertas por webhook (para integraciones futuras)
        webhookAlerts: {
            enabled: {
                type: Boolean,
                default: false
            },
            url: {
                type: String,
                validate: {
                    validator: function (v) {
                        return !v || /^https?:\/\/.+/.test(v);
                    },
                    message: 'URL del webhook debe ser válida'
                }
            },
            events: [{
                type: String,
                enum: ['low_stock', 'critical_stock', 'out_of_stock']
            }]
        },
        // Configuración de frecuencia de alertas
        alertFrequency: {
            type: String,
            enum: ['immediate', 'hourly', 'daily', 'weekly'],
            default: 'immediate'
        },
        // Última vez que se envió cada tipo de alerta
        lastAlertsSent: {
            lowStock: Date,
            criticalStock: Date,
            outOfStock: Date
        },
        // Configuración de auto-reabastecimiento
        autoRestock: {
            enabled: {
                type: Boolean,
                default: false
            },
            quantity: {
                type: Number,
                min: [0, "La cantidad de auto-reabastecimiento no puede ser negativa"],
                default: 50
            },
            supplier: {
                type: String,
                maxlength: [100, "El nombre del proveedor no puede exceder 100 caracteres"]
            }
        },
        // Notas adicionales
        notes: {
            type: String,
            maxlength: [500, "Las notas no pueden exceder 500 caracteres"]
        },
        // Estado de la configuración
        status: {
            type: String,
            enum: ['active', 'inactive', 'suspended'],
            default: 'active'
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Índices para mejorar el rendimiento
alertConfigSchema.index({ product: 1 });
alertConfigSchema.index({ status: 1 });
alertConfigSchema.index({ 'emailAlerts.enabled': 1 });
alertConfigSchema.index({ 'appAlerts.enabled': 1 });

// Virtual para verificar si hay alertas activas
alertConfigSchema.virtual('hasActiveAlerts').get(function () {
    return this.emailAlerts.enabled || this.appAlerts.enabled || this.webhookAlerts.enabled;
});

// Virtual para obtener todos los thresholds ordenados
alertConfigSchema.virtual('thresholds').get(function () {
    return {
        outOfStock: this.outOfStockThreshold,
        critical: this.criticalStockThreshold,
        low: this.lowStockThreshold
    };
});

// Método para verificar si se debe enviar una alerta
alertConfigSchema.methods.shouldSendAlert = function (alertType, currentStock) {
    if (!this.hasActiveAlerts) return false;

    // Verificar si la alerta está habilitada
    let alertEnabled = false;
    switch (alertType) {
        case 'low_stock':
            alertEnabled = this.emailAlerts.lowStock || this.appAlerts.lowStock;
            break;
        case 'critical_stock':
            alertEnabled = this.emailAlerts.criticalStock || this.appAlerts.criticalStock;
            break;
        case 'out_of_stock':
            alertEnabled = this.emailAlerts.outOfStock || this.appAlerts.outOfStock;
            break;
    }

    if (!alertEnabled) return false;

    // Verificar frecuencia de alertas
    const lastSent = this.lastAlertsSent[alertType.replace('_', '')];
    if (lastSent) {
        const now = new Date();
        const timeDiff = now - lastSent;

        switch (this.alertFrequency) {
            case 'hourly':
                if (timeDiff < 60 * 60 * 1000) return false; // 1 hora
                break;
            case 'daily':
                if (timeDiff < 24 * 60 * 60 * 1000) return false; // 24 horas
                break;
            case 'weekly':
                if (timeDiff < 7 * 24 * 60 * 60 * 1000) return false; // 7 días
                break;
            case 'immediate':
            default:
                // Siempre enviar si es inmediato
                break;
        }
    }

    return true;
};

// Método para actualizar la última vez que se envió una alerta
alertConfigSchema.methods.updateLastAlertSent = function (alertType) {
    const fieldName = alertType.replace('_', '');
    this.lastAlertsSent[fieldName] = new Date();
    return this.save();
};

// Método estático para obtener configuraciones activas
alertConfigSchema.statics.getActiveConfigs = function () {
    return this.find({ status: 'active' }).populate('product', 'name brand price imageUrl');
};

// Método estático para obtener productos que necesitan alertas
alertConfigSchema.statics.getProductsNeedingAlerts = function (currentStock) {
    return this.find({
        status: 'active',
        $or: [
            { lowStockThreshold: { $gte: currentStock } },
            { criticalStockThreshold: { $gte: currentStock } },
            { outOfStockThreshold: { $gte: currentStock } }
        ]
    }).populate('product', 'name brand price imageUrl');
};

export default mongoose.model("AlertConfig", alertConfigSchema);
