import mongoose from 'mongoose';

/**
 * Modelo de Webhook para registrar suscripciones a eventos
 */
const webhookSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'El nombre del webhook es requerido'],
        trim: true,
        maxlength: [100, 'El nombre no puede exceder 100 caracteres']
    },
    url: {
        type: String,
        required: [true, 'La URL del webhook es requerida'],
        trim: true,
        validate: {
            validator: function(v) {
                return /^https?:\/\/.+/.test(v);
            },
            message: 'La URL debe ser válida (http:// o https://)'
        }
    },
    events: [{
        type: String,
        enum: [
            'order.created',
            'order.paid',
            'order.shipped',
            'order.delivered',
            'order.cancelled',
            'payment.approved',
            'payment.rejected',
            'payment.refunded',
            'inventory.low_stock',
            'inventory.out_of_stock',
            'inventory.restocked',
            'user.registered',
            'customer.segment_changed',
            'alert.triggered'
        ],
        required: true
    }],
    status: {
        type: String,
        enum: ['active', 'inactive', 'failed'],
        default: 'active'
    },
    secret: {
        type: String,
        required: true,
        select: false // No incluir en queries por defecto (seguridad)
    },
    headers: {
        type: Map,
        of: String,
        default: {}
    },
    retryPolicy: {
        maxRetries: {
            type: Number,
            default: 3,
            min: 0,
            max: 10
        },
        retryDelay: {
            type: Number,
            default: 5000, // 5 segundos
            min: 1000,
            max: 60000
        }
    },
    statistics: {
        totalCalls: {
            type: Number,
            default: 0
        },
        successfulCalls: {
            type: Number,
            default: 0
        },
        failedCalls: {
            type: Number,
            default: 0
        },
        lastCallAt: {
            type: Date
        },
        lastSuccessAt: {
            type: Date
        },
        lastFailureAt: {
            type: Date
        },
        lastError: {
            type: String
        }
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Índices
webhookSchema.index({ status: 1 });
webhookSchema.index({ events: 1 });
webhookSchema.index({ createdBy: 1 });
webhookSchema.index({ 'statistics.lastCallAt': -1 });

// Virtual para tasa de éxito
webhookSchema.virtual('successRate').get(function() {
    if (this.statistics.totalCalls === 0) return 0;
    return (this.statistics.successfulCalls / this.statistics.totalCalls * 100).toFixed(2);
});

// Método para actualizar estadísticas después de un call
webhookSchema.methods.recordCall = function(success, error = null) {
    this.statistics.totalCalls += 1;
    this.statistics.lastCallAt = new Date();
    
    if (success) {
        this.statistics.successfulCalls += 1;
        this.statistics.lastSuccessAt = new Date();
        
        // Reactivar webhook si estaba en failed
        if (this.status === 'failed') {
            this.status = 'active';
        }
    } else {
        this.statistics.failedCalls += 1;
        this.statistics.lastFailureAt = new Date();
        
        if (error) {
            this.statistics.lastError = error;
        }
        
        // Marcar como failed si tiene muchos errores consecutivos
        const recentFailureRate = this.statistics.failedCalls / Math.max(this.statistics.totalCalls, 1);
        if (recentFailureRate > 0.8 && this.statistics.totalCalls >= 10) {
            this.status = 'failed';
        }
    }
    
    return this.save();
};

// Método para verificar si el webhook está suscrito a un evento
webhookSchema.methods.isSubscribedTo = function(eventName) {
    return this.events.includes(eventName);
};

const Webhook = mongoose.model('Webhook', webhookSchema);

export default Webhook;

