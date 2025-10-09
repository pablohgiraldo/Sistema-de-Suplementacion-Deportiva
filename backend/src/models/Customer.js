import mongoose from 'mongoose';

/**
 * Modelo Customer para CRM
 * 
 * Este modelo extiende la información básica del usuario con datos
 * específicos de CRM para segmentación, análisis y fidelización.
 */

// Sub-schema para preferencias del cliente
const customerPreferencesSchema = new mongoose.Schema({
    categories: {
        type: [String],
        enum: ['Proteínas', 'Vitaminas y Más', 'Rendimiento', 'Alimentos y Snacks', 'Barras de Proteína', 'Accesorios', 'Vegano'],
        default: []
    },
    brands: {
        type: [String],
        default: []
    },
    priceRange: {
        min: {
            type: Number,
            default: 0
        },
        max: {
            type: Number,
            default: 500000
        }
    },
    communicationChannels: {
        email: {
            type: Boolean,
            default: true
        },
        sms: {
            type: Boolean,
            default: false
        },
        push: {
            type: Boolean,
            default: true
        }
    }
}, { _id: false });

// Sub-schema para métricas de engagement
const engagementMetricsSchema = new mongoose.Schema({
    totalOrders: {
        type: Number,
        default: 0,
        min: 0
    },
    totalSpent: {
        type: Number,
        default: 0,
        min: 0
    },
    averageOrderValue: {
        type: Number,
        default: 0,
        min: 0
    },
    lastOrderDate: {
        type: Date,
        default: null
    },
    daysSinceLastOrder: {
        type: Number,
        default: null,
        min: 0
    },
    wishlistItemsCount: {
        type: Number,
        default: 0,
        min: 0
    },
    productReviewsCount: {
        type: Number,
        default: 0,
        min: 0
    },
    averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    }
}, { _id: false });

// Sub-schema para información de contacto adicional
const contactInfoSchema = new mongoose.Schema({
    phone: {
        type: String,
        default: null,
        trim: true,
        match: [/^[0-9]{10}$/, 'El teléfono debe tener 10 dígitos']
    },
    address: {
        street: {
            type: String,
            default: null,
            trim: true
        },
        city: {
            type: String,
            default: null,
            trim: true
        },
        state: {
            type: String,
            default: null,
            trim: true
        },
        zipCode: {
            type: String,
            default: null,
            trim: true
        },
        country: {
            type: String,
            default: 'Colombia',
            trim: true
        }
    },
    alternativeEmail: {
        type: String,
        default: null,
        lowercase: true,
        trim: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Email alternativo inválido']
    }
}, { _id: false });

// Schema principal de Customer
const customerSchema = new mongoose.Schema({
    // Referencia al usuario base
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'La referencia al usuario es requerida'],
        unique: true
    },

    // Código único de cliente
    customerCode: {
        type: String,
        unique: true,
        uppercase: true,
        trim: true
        // Se genera automáticamente en el pre-save
    },

    // Información de contacto adicional
    contactInfo: {
        type: contactInfoSchema,
        default: () => ({})
    },

    // Segmentación del cliente
    segment: {
        type: String,
        enum: ['VIP', 'Frecuente', 'Ocasional', 'Nuevo', 'Inactivo', 'En Riesgo'],
        default: 'Nuevo'
    },

    // Nivel de fidelidad (basado en compras y engagement)
    loyaltyLevel: {
        type: String,
        enum: ['Bronce', 'Plata', 'Oro', 'Platino', 'Diamante'],
        default: 'Bronce'
    },

    // Puntos de fidelidad acumulados
    loyaltyPoints: {
        type: Number,
        default: 0,
        min: 0
    },

    // Preferencias del cliente
    preferences: {
        type: customerPreferencesSchema,
        default: () => ({})
    },

    // Métricas de engagement
    metrics: {
        type: engagementMetricsSchema,
        default: () => ({})
    },

    // Tags para segmentación personalizada
    tags: {
        type: [String],
        default: []
    },

    // Notas del CRM (para uso interno)
    notes: {
        type: String,
        default: '',
        maxlength: [2000, 'Las notas no pueden exceder 2000 caracteres']
    },

    // Fecha de nacimiento (para marketing)
    birthDate: {
        type: Date,
        default: null
    },

    // Género (para segmentación)
    gender: {
        type: String,
        enum: ['Masculino', 'Femenino', 'Otro', 'Prefiero no decir', null],
        default: null
    },

    // Objetivos del cliente (fitness)
    fitnessGoals: {
        type: [String],
        enum: [
            'Pérdida de peso',
            'Ganancia muscular',
            'Mantenimiento',
            'Rendimiento deportivo',
            'Salud general',
            'Resistencia',
            'Fuerza'
        ],
        default: []
    },

    // Estado del cliente
    status: {
        type: String,
        enum: ['Activo', 'Inactivo', 'Bloqueado', 'Suspendido'],
        default: 'Activo'
    },

    // Fuente de adquisición
    acquisitionSource: {
        type: String,
        enum: ['Búsqueda orgánica', 'Redes sociales', 'Referido', 'Email marketing', 'Publicidad', 'Directo', 'Otro'],
        default: 'Directo'
    },

    // Lifetime Value (valor total del cliente)
    lifetimeValue: {
        type: Number,
        default: 0,
        min: 0
    },

    // Fecha de última interacción
    lastInteractionDate: {
        type: Date,
        default: Date.now
    },

    // Indicador de cliente de alto valor
    isHighValue: {
        type: Boolean,
        default: false
    },

    // Indicador de riesgo de abandono
    churnRisk: {
        type: String,
        enum: ['Bajo', 'Medio', 'Alto', null],
        default: null
    },

    // Historial de interacciones (últimas 10)
    interactionHistory: [{
        type: {
            type: String,
            enum: ['Compra', 'Visita', 'Email abierto', 'Click', 'Wishlist', 'Review', 'Soporte', 'Otro'],
            required: true
        },
        description: {
            type: String,
            maxlength: 500
        },
        date: {
            type: Date,
            default: Date.now
        },
        metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        }
    }],

    // Metadata adicional flexible
    customData: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }

}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Índices para optimizar consultas de CRM
customerSchema.index({ user: 1 });
customerSchema.index({ customerCode: 1 });
customerSchema.index({ segment: 1 });
customerSchema.index({ loyaltyLevel: 1 });
customerSchema.index({ status: 1 });
customerSchema.index({ 'metrics.totalSpent': -1 });
customerSchema.index({ 'metrics.lastOrderDate': -1 });
customerSchema.index({ tags: 1 });
customerSchema.index({ isHighValue: 1 });
customerSchema.index({ churnRisk: 1 });

// Índice compuesto para análisis de segmentación
customerSchema.index({ segment: 1, loyaltyLevel: 1, status: 1 });

// Middleware pre-save: Generar código de cliente único
customerSchema.pre('save', async function (next) {
    try {
        if (this.isNew && !this.customerCode) {
            // Generar código: CUS-YYYYMMDD-XXXXX
            const date = new Date();
            const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
            const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
            this.customerCode = `CUS-${dateStr}-${randomStr}`;
        }
        next();
    } catch (error) {
        next(error);
    }
});

// Middleware pre-save: Calcular métricas derivadas
customerSchema.pre('save', function (next) {
    try {
        // Calcular días desde última orden
        if (this.metrics.lastOrderDate) {
            const now = new Date();
            const lastOrder = new Date(this.metrics.lastOrderDate);
            const diffTime = Math.abs(now - lastOrder);
            this.metrics.daysSinceLastOrder = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }

        // Calcular average order value
        if (this.metrics.totalOrders > 0) {
            this.metrics.averageOrderValue = this.metrics.totalSpent / this.metrics.totalOrders;
        }

        // Actualizar lifetimeValue
        this.lifetimeValue = this.metrics.totalSpent;

        // Determinar si es cliente de alto valor (>$1,000,000 COP)
        this.isHighValue = this.lifetimeValue >= 1000000;

        // Auto-segmentar basado en métricas
        this.autoSegment();

        // Calcular riesgo de abandono
        this.calculateChurnRisk();

        next();
    } catch (error) {
        next(error);
    }
});

// Método para auto-segmentar clientes
customerSchema.methods.autoSegment = function () {
    const { totalOrders, daysSinceLastOrder } = this.metrics;

    if (totalOrders === 0) {
        this.segment = 'Nuevo';
    } else if (this.lifetimeValue >= 2000000 && totalOrders >= 10) {
        this.segment = 'VIP';
    } else if (totalOrders >= 5 && daysSinceLastOrder <= 30) {
        this.segment = 'Frecuente';
    } else if (totalOrders >= 2 && daysSinceLastOrder <= 90) {
        this.segment = 'Ocasional';
    } else if (daysSinceLastOrder > 180) {
        this.segment = 'Inactivo';
    } else if (daysSinceLastOrder > 90) {
        this.segment = 'En Riesgo';
    } else {
        this.segment = 'Ocasional';
    }
};

// Método para calcular riesgo de abandono
customerSchema.methods.calculateChurnRisk = function () {
    const { totalOrders, daysSinceLastOrder } = this.metrics;

    if (totalOrders === 0) {
        this.churnRisk = null;
        return;
    }

    if (daysSinceLastOrder > 180) {
        this.churnRisk = 'Alto';
    } else if (daysSinceLastOrder > 90) {
        this.churnRisk = 'Medio';
    } else {
        this.churnRisk = 'Bajo';
    }
};

// Método para actualizar nivel de fidelidad
customerSchema.methods.updateLoyaltyLevel = function () {
    const ltv = this.lifetimeValue;

    if (ltv >= 5000000) {
        this.loyaltyLevel = 'Diamante';
    } else if (ltv >= 3000000) {
        this.loyaltyLevel = 'Platino';
    } else if (ltv >= 1500000) {
        this.loyaltyLevel = 'Oro';
    } else if (ltv >= 500000) {
        this.loyaltyLevel = 'Plata';
    } else {
        this.loyaltyLevel = 'Bronce';
    }
};

// Método para agregar interacción al historial
customerSchema.methods.addInteraction = function (type, description, metadata = {}) {
    this.interactionHistory.unshift({
        type,
        description,
        metadata,
        date: new Date()
    });

    // Mantener solo las últimas 10 interacciones
    if (this.interactionHistory.length > 10) {
        this.interactionHistory = this.interactionHistory.slice(0, 10);
    }

    this.lastInteractionDate = new Date();
};

// Método para actualizar métricas desde órdenes
customerSchema.methods.updateMetricsFromOrders = async function () {
    try {
        const Order = mongoose.model('Order');

        // Obtener todas las órdenes del usuario (excluyendo solo las canceladas)
        const orders = await Order.find({
            user: this.user,
            status: { $in: ['pending', 'processing', 'shipped', 'delivered'] }
        }).sort({ createdAt: -1 });

        if (orders.length === 0) {
            return;
        }

        // Actualizar métricas
        this.metrics.totalOrders = orders.length;
        this.metrics.totalSpent = orders.reduce((sum, order) => sum + (order.total || 0), 0);
        this.metrics.lastOrderDate = orders[0].createdAt;

        // Calcular promedio de orden
        this.metrics.averageOrderValue = orders.length > 0
            ? this.metrics.totalSpent / orders.length
            : 0;

        // Actualizar lifetime value (igual al total gastado)
        this.lifetimeValue = this.metrics.totalSpent;

        // Actualizar nivel de fidelidad
        this.updateLoyaltyLevel();

        // Guardar cambios
        await this.save();
    } catch (error) {
        console.error('Error updating customer metrics:', error);
    }
};

// Virtual para obtener información completa del usuario
customerSchema.virtual('fullUserInfo', {
    ref: 'User',
    localField: 'user',
    foreignField: '_id',
    justOne: true
});

// Virtual para obtener órdenes del cliente
customerSchema.virtual('orders', {
    ref: 'Order',
    localField: 'user',
    foreignField: 'user'
});

// Virtual para obtener wishlist del cliente
customerSchema.virtual('wishlistInfo', {
    ref: 'Wishlist',
    localField: 'user',
    foreignField: 'user',
    justOne: true
});

// Método estático para obtener estadísticas de segmentos
customerSchema.statics.getSegmentStats = async function () {
    try {
        const stats = await this.aggregate([
            {
                $match: { status: 'Activo' }
            },
            {
                $group: {
                    _id: '$segment',
                    count: { $sum: 1 },
                    avgLifetimeValue: { $avg: '$lifetimeValue' },
                    totalRevenue: { $sum: '$lifetimeValue' }
                }
            },
            {
                $sort: { totalRevenue: -1 }
            }
        ]);

        return stats;
    } catch (error) {
        console.error('Error getting segment stats:', error);
        throw error;
    }
};

// Método estático para obtener clientes de alto valor
customerSchema.statics.getHighValueCustomers = async function (limit = 10) {
    return this.find({
        isHighValue: true,
        status: 'Activo'
    })
        .sort({ lifetimeValue: -1 })
        .limit(limit)
        .populate('user', 'nombre email');
};

// Método estático para obtener clientes en riesgo
customerSchema.statics.getChurnRiskCustomers = async function () {
    return this.find({
        churnRisk: { $in: ['Medio', 'Alto'] },
        status: 'Activo'
    })
        .sort({ 'metrics.daysSinceLastOrder': -1 })
        .populate('user', 'nombre email');
};

const Customer = mongoose.model('Customer', customerSchema);

export default Customer;

