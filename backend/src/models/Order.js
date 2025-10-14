import mongoose from 'mongoose';

// Schema para items de la orden
const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: [true, 'El producto es requerido']
    },
    quantity: {
        type: Number,
        required: [true, 'La cantidad es requerida'],
        min: [1, 'La cantidad debe ser al menos 1'],
        max: [100, 'La cantidad no puede exceder 100']
    },
    price: {
        type: Number,
        required: [true, 'El precio es requerido'],
        min: [0, 'El precio no puede ser negativo']
    },
    subtotal: {
        type: Number,
        required: true,
        min: [0, 'El subtotal no puede ser negativo']
    }
}, { _id: false });

// Schema principal de la orden
const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        required: false, // Se genera automáticamente en el middleware pre-save
        unique: true,
        uppercase: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'El usuario es requerido']
    },
    items: [orderItemSchema],
    subtotal: {
        type: Number,
        required: [true, 'El subtotal es requerido'],
        min: [0, 'El subtotal no puede ser negativo']
    },
    tax: {
        type: Number,
        default: 0,
        min: [0, 'El impuesto no puede ser negativo']
    },
    shipping: {
        type: Number,
        default: 0,
        min: [0, 'El envío no puede ser negativo']
    },
    total: {
        type: Number,
        required: [true, 'El total es requerido'],
        min: [0, 'El total no puede ser negativo']
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: ['credit_card', 'paypal', 'pse'],
        required: [true, 'El método de pago es requerido']
    },
    shippingAddress: {
        firstName: {
            type: String,
            required: [true, 'El nombre es requerido'],
            trim: true,
            maxlength: [50, 'El nombre no puede exceder 50 caracteres']
        },
        lastName: {
            type: String,
            required: [true, 'El apellido es requerido'],
            trim: true,
            maxlength: [50, 'El apellido no puede exceder 50 caracteres']
        },
        street: {
            type: String,
            required: [true, 'La dirección es requerida'],
            trim: true,
            maxlength: [200, 'La dirección no puede exceder 200 caracteres']
        },
        city: {
            type: String,
            required: [true, 'La ciudad es requerida'],
            trim: true,
            maxlength: [50, 'La ciudad no puede exceder 50 caracteres']
        },
        state: {
            type: String,
            required: [true, 'El estado es requerido'],
            trim: true,
            maxlength: [50, 'El estado no puede exceder 50 caracteres']
        },
        zipCode: {
            type: String,
            required: [true, 'El código postal es requerido'],
            trim: true,
            maxlength: [10, 'El código postal no puede exceder 10 caracteres']
        },
        country: {
            type: String,
            required: [true, 'El país es requerido'],
            trim: true,
            maxlength: [50, 'El país no puede exceder 50 caracteres']
        },
        phone: {
            type: String,
            required: [true, 'El teléfono es requerido'],
            trim: true,
            maxlength: [15, 'El teléfono no puede exceder 15 caracteres']
        }
    },
    billingAddress: { // Opcional, si es diferente al de envío
        firstName: {
            type: String,
            trim: true,
            maxlength: [50, 'El nombre no puede exceder 50 caracteres']
        },
        lastName: {
            type: String,
            trim: true,
            maxlength: [50, 'El apellido no puede exceder 50 caracteres']
        },
        street: {
            type: String,
            trim: true,
            maxlength: [200, 'La dirección no puede exceder 200 caracteres']
        },
        city: {
            type: String,
            trim: true,
            maxlength: [50, 'La ciudad no puede exceder 50 caracteres']
        },
        state: {
            type: String,
            trim: true,
            maxlength: [50, 'El estado no puede exceder 50 caracteres']
        },
        zipCode: {
            type: String,
            trim: true,
            maxlength: [10, 'El código postal no puede exceder 10 caracteres']
        },
        country: {
            type: String,
            trim: true,
            maxlength: [50, 'El país no puede exceder 50 caracteres']
        },
        phone: {
            type: String,
            trim: true,
            maxlength: [15, 'El teléfono no puede exceder 15 caracteres']
        }
    },
    notes: {
        type: String,
        trim: true,
        maxlength: [500, 'Las notas no pueden exceder 500 caracteres']
    },
    paymentDetails: {
        transactionId: {
            type: String,
            trim: true
        },
        payuOrderId: {
            type: String,
            trim: true
        },
        payuReferenceCode: {
            type: String,
            trim: true
        },
        payuResponseCode: {
            type: String,
            trim: true
        },
        amountPaid: {
            type: Number,
            min: [0, 'El monto pagado no puede ser negativo']
        },
        currency: {
            type: String,
            default: 'COP',
            trim: true
        },
        paymentDate: {
            type: Date
        },
        cardLastFour: {
            type: String,
            trim: true,
            maxlength: [4, 'Los últimos 4 dígitos no pueden exceder 4 caracteres']
        },
        cardBrand: {
            type: String,
            trim: true,
            enum: ['visa', 'mastercard', 'amex', 'discover', 'other']
        }
    },
    paymentLogs: [{
        timestamp: {
            type: Date,
            default: Date.now
        },
        action: {
            type: String,
            enum: ['payment_initiated', 'payment_approved', 'payment_rejected', 'payment_pending', 'refund_initiated', 'refund_completed'],
            required: true
        },
        details: {
            type: mongoose.Schema.Types.Mixed
        },
        source: {
            type: String,
            enum: ['payu', 'admin', 'system'],
            default: 'payu'
        }
    }],
    deliveryDate: {
        type: Date
    },
    trackingNumber: {
        type: String,
        trim: true,
        maxlength: [50, 'El número de seguimiento no puede exceder 50 caracteres']
    },
    carrier: {
        type: String,
        trim: true,
        maxlength: [50, 'La empresa de envío no puede exceder 50 caracteres']
    },
    processedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    processedAt: {
        type: Date
    },
    shippedAt: {
        type: Date
    },
    deliveredAt: {
        type: Date
    },
    cancelledAt: {
        type: Date
    },
    cancellationReason: {
        type: String,
        trim: true,
        maxlength: [200, 'La razón de cancelación no puede exceder 200 caracteres']
    },
    refundAmount: {
        type: Number,
        min: [0, 'El monto de reembolso no puede ser negativo']
    },
    refundDate: {
        type: Date
    },
    refundReason: {
        type: String,
        trim: true,
        maxlength: [200, 'La razón de reembolso no puede exceder 200 caracteres']
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual para el número total de items
orderSchema.virtual('itemCount').get(function () {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

// Virtual para el estado formateado
orderSchema.virtual('statusFormatted').get(function () {
    const statusMap = {
        'pending': 'Pendiente',
        'processing': 'Procesando',
        'shipped': 'Enviado',
        'delivered': 'Entregado',
        'cancelled': 'Cancelado'
    };
    return statusMap[this.status] || this.status;
});

// Virtual para el estado de pago formateado
orderSchema.virtual('paymentStatusFormatted').get(function () {
    const statusMap = {
        'pending': 'Pendiente',
        'paid': 'Pagado',
        'failed': 'Fallido',
        'refunded': 'Reembolsado'
    };
    return statusMap[this.paymentStatus] || this.paymentStatus;
});

// Virtual para el método de pago formateado
orderSchema.virtual('paymentMethodFormatted').get(function () {
    const methodMap = {
        'credit_card': 'Tarjeta de Crédito',
        'paypal': 'PayPal',
        'pse': 'PSE - Pagos Seguros en Línea'
    };
    return methodMap[this.paymentMethod] || this.paymentMethod;
});

// Virtual para el nombre completo del cliente
orderSchema.virtual('customerFullName').get(function () {
    const firstName = this.shippingAddress?.firstName || '';
    const lastName = this.shippingAddress?.lastName || '';
    return `${firstName} ${lastName}`.trim();
});

// Virtual para la dirección completa de envío
orderSchema.virtual('fullShippingAddress').get(function () {
    const { street, city, state, zipCode, country } = this.shippingAddress;
    return `${street}, ${city}, ${state}, ${zipCode}, ${country}`;
});

// Virtual para la dirección completa de facturación
orderSchema.virtual('fullBillingAddress').get(function () {
    if (!this.billingAddress || !this.billingAddress.street) {
        return this.fullShippingAddress; // Usar dirección de envío si no hay facturación
    }
    const { street, city, state, zipCode, country } = this.billingAddress;
    return `${street}, ${city}, ${state}, ${zipCode}, ${country}`;
});

// Virtual para el tiempo transcurrido desde la creación
orderSchema.virtual('timeSinceCreated').get(function () {
    const now = new Date();
    const created = this.createdAt;
    const diffMs = now - created;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffDays > 0) return `${diffDays} días`;
    if (diffHours > 0) return `${diffHours} horas`;
    return `${diffMinutes} minutos`;
});

// Virtual para verificar si la orden puede ser cancelada
orderSchema.virtual('canBeCancelled').get(function () {
    return ['pending', 'processing'].includes(this.status);
});

// Virtual para verificar si la orden puede ser modificada
orderSchema.virtual('canBeModified').get(function () {
    return this.status === 'pending';
});

// Virtual para el estado de envío
orderSchema.virtual('shippingStatus').get(function () {
    if (this.status === 'delivered') return 'Entregado';
    if (this.status === 'shipped') return 'En tránsito';
    if (this.status === 'processing') return 'Preparando envío';
    if (this.status === 'pending') return 'Pendiente de procesamiento';
    if (this.status === 'cancelled') return 'Cancelado';
    return 'Desconocido';
});

// Middleware para generar número de orden antes de guardar
orderSchema.pre('save', async function (next) {
    if (this.isNew && !this.orderNumber) {
        const count = await mongoose.model('Order').countDocuments();
        this.orderNumber = `ORD-${String(count + 1).padStart(6, '0')}`;
    }
    next();
});

// Middleware para calcular subtotales antes de guardar
orderSchema.pre('save', function (next) {
    // Calcular subtotal de cada item
    this.items.forEach(item => {
        item.subtotal = item.price * item.quantity;
    });

    // Calcular subtotal total
    this.subtotal = this.items.reduce((sum, item) => sum + item.subtotal, 0);

    // Calcular total final
    this.total = this.subtotal + this.tax + this.shipping;

    next();
});

// Método para actualizar estado de la orden
orderSchema.methods.updateStatus = function (newStatus, userId = null) {
    this.status = newStatus;

    if (newStatus === 'processing' && !this.processedAt) {
        this.processedAt = new Date();
        this.processedBy = userId;
    } else if (newStatus === 'shipped' && !this.shippedAt) {
        this.shippedAt = new Date();
    } else if (newStatus === 'delivered' && !this.deliveredAt) {
        this.deliveredAt = new Date();
    }

    return this.save();
};

// Método para actualizar estado de pago
orderSchema.methods.updatePaymentStatus = function (newStatus, paymentDetails = {}, source = 'payu') {
    const oldStatus = this.paymentStatus;
    this.paymentStatus = newStatus;

    // Actualizar transactionId
    if (paymentDetails.transactionId) {
        this.paymentDetails.transactionId = paymentDetails.transactionId;
    }
    
    // Actualizar PayU específicos
    if (paymentDetails.payuOrderId) {
        this.paymentDetails.payuOrderId = paymentDetails.payuOrderId;
    }
    if (paymentDetails.payuReferenceCode) {
        this.paymentDetails.payuReferenceCode = paymentDetails.payuReferenceCode;
    }
    if (paymentDetails.payuResponseCode) {
        this.paymentDetails.payuResponseCode = paymentDetails.payuResponseCode;
    }
    
    // Actualizar montos y fechas
    if (paymentDetails.amountPaid) {
        this.paymentDetails.amountPaid = paymentDetails.amountPaid;
    }
    if (paymentDetails.currency) {
        this.paymentDetails.currency = paymentDetails.currency;
    }
    if (paymentDetails.paymentDate) {
        this.paymentDetails.paymentDate = paymentDetails.paymentDate;
    }
    
    // Actualizar datos de tarjeta
    if (paymentDetails.cardLastFour) {
        this.paymentDetails.cardLastFour = paymentDetails.cardLastFour;
    }
    if (paymentDetails.cardBrand) {
        this.paymentDetails.cardBrand = paymentDetails.cardBrand;
    }

    // Registrar log de cambio de estado
    const logAction = this._getPaymentLogAction(oldStatus, newStatus);
    if (logAction) {
        this.paymentLogs.push({
            action: logAction,
            details: {
                oldStatus,
                newStatus,
                ...paymentDetails
            },
            source
        });
    }

    return this.save();
};

// Helper para determinar la acción del log
orderSchema.methods._getPaymentLogAction = function(oldStatus, newStatus) {
    if (newStatus === 'paid') {
        return 'payment_approved';
    }
    if (newStatus === 'failed') {
        return 'payment_rejected';
    }
    if (newStatus === 'pending' && oldStatus === 'pending') {
        return null; // No duplicar logs de pending
    }
    if (newStatus === 'pending') {
        return 'payment_pending';
    }
    if (newStatus === 'refunded') {
        return 'refund_completed';
    }
    return null;
};

// Método para registrar inicio de pago
orderSchema.methods.logPaymentInitiation = function(paymentDetails = {}) {
    // Registrar transactionId si se proporciona
    if (paymentDetails.transactionId) {
        this.paymentDetails.transactionId = paymentDetails.transactionId;
    }
    if (paymentDetails.payuOrderId) {
        this.paymentDetails.payuOrderId = paymentDetails.payuOrderId;
    }
    if (paymentDetails.payuReferenceCode) {
        this.paymentDetails.payuReferenceCode = paymentDetails.payuReferenceCode;
    }

    // Agregar log de inicio de pago
    this.paymentLogs.push({
        action: 'payment_initiated',
        details: paymentDetails,
        source: 'system'
    });

    return this.save();
};

// Método para cancelar orden
orderSchema.methods.cancelOrder = function (reason, userId = null) {
    this.status = 'cancelled';
    this.cancelledAt = new Date();
    this.cancellationReason = reason;

    if (userId) {
        this.processedBy = userId;
    }

    return this.save();
};

// Método para procesar orden
orderSchema.methods.processOrder = function (userId) {
    this.status = 'processing';
    this.processedBy = userId;
    this.processedAt = new Date();

    return this.save();
};

// Método para marcar como enviado
orderSchema.methods.markAsShipped = function (trackingNumber, carrier, userId = null) {
    this.status = 'shipped';
    this.shippedAt = new Date();
    this.trackingNumber = trackingNumber;
    this.carrier = carrier;

    if (userId) {
        this.processedBy = userId;
    }

    return this.save();
};

// Método para marcar como entregado
orderSchema.methods.markAsDelivered = function (userId = null) {
    this.status = 'delivered';
    this.deliveredAt = new Date();

    if (userId) {
        this.processedBy = userId;
    }

    return this.save();
};

// Método para procesar reembolso
orderSchema.methods.processRefund = function (amount, reason, userId = null) {
    this.paymentStatus = 'refunded';
    this.refundAmount = amount;
    this.refundDate = new Date();
    this.refundReason = reason;

    if (userId) {
        this.processedBy = userId;
    }

    return this.save();
};

// Método para obtener resumen de la orden
orderSchema.methods.getOrderSummary = function () {
    return {
        orderNumber: this.orderNumber,
        customerName: this.customerFullName,
        total: this.total,
        status: this.statusFormatted,
        paymentStatus: this.paymentStatusFormatted,
        paymentMethod: this.paymentMethodFormatted,
        itemCount: this.itemCount,
        createdAt: this.createdAt,
        timeSinceCreated: this.timeSinceCreated,
        canBeCancelled: this.canBeCancelled,
        canBeModified: this.canBeModified,
        shippingStatus: this.shippingStatus
    };
};

// Método para validar datos de la orden antes de guardar
orderSchema.methods.validateOrderData = function () {
    const errors = [];

    // Validar que el total sea correcto
    const calculatedTotal = this.subtotal + this.tax + this.shipping;
    if (Math.abs(this.total - calculatedTotal) > 0.01) {
        errors.push('El total no coincide con la suma de subtotal, impuestos y envío');
    }

    // Validar que haya al menos un item
    if (!this.items || this.items.length === 0) {
        errors.push('La orden debe tener al menos un producto');
    }

    // Validar que todos los items tengan subtotal correcto
    for (const item of this.items) {
        const calculatedSubtotal = item.price * item.quantity;
        if (Math.abs(item.subtotal - calculatedSubtotal) > 0.01) {
            errors.push(`El subtotal del item ${item.product} no es correcto`);
        }
    }

    return errors;
};

// Método estático para obtener estadísticas de ventas
orderSchema.statics.getSalesStats = async function (startDate, endDate) {
    const matchStage = {};

    if (startDate || endDate) {
        matchStage.createdAt = {};
        if (startDate) matchStage.createdAt.$gte = new Date(startDate);
        if (endDate) matchStage.createdAt.$lte = new Date(endDate);
    }

    const stats = await this.aggregate([
        { $match: matchStage },
        {
            $group: {
                _id: null,
                totalOrders: { $sum: 1 },
                totalRevenue: { $sum: '$total' },
                averageOrderValue: { $avg: '$total' },
                totalItemsSold: { $sum: '$itemCount' }
            }
        }
    ]);

    return stats[0] || {
        totalOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        totalItemsSold: 0
    };
};

// Método estático para obtener ventas por período
orderSchema.statics.getSalesByPeriod = async function (startDate, endDate, groupBy = 'day') {
    const matchStage = {};

    if (startDate || endDate) {
        matchStage.createdAt = {};
        if (startDate) matchStage.createdAt.$gte = new Date(startDate);
        if (endDate) matchStage.createdAt.$lte = new Date(endDate);
    }

    let dateFormat;
    switch (groupBy) {
        case 'hour':
            dateFormat = '%Y-%m-%d %H:00:00';
            break;
        case 'day':
            dateFormat = '%Y-%m-%d';
            break;
        case 'week':
            dateFormat = '%Y-%U';
            break;
        case 'month':
            dateFormat = '%Y-%m';
            break;
        case 'year':
            dateFormat = '%Y';
            break;
        default:
            dateFormat = '%Y-%m-%d';
    }

    return await this.aggregate([
        { $match: matchStage },
        {
            $group: {
                _id: {
                    $dateToString: {
                        format: dateFormat,
                        date: '$createdAt'
                    }
                },
                orders: { $sum: 1 },
                revenue: { $sum: '$total' },
                itemsSold: { $sum: '$itemCount' }
            }
        },
        { $sort: { _id: 1 } }
    ]);
};

// Índices para optimizar consultas
// orderNumber ya tiene índice único definido en el schema
orderSchema.index({ user: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'items.product': 1 });
orderSchema.index({ 'shippingAddress.city': 1 });
orderSchema.index({ 'shippingAddress.state': 1 });
orderSchema.index({ 'shippingAddress.country': 1 });
orderSchema.index({ paymentMethod: 1 });
orderSchema.index({ total: 1 });
orderSchema.index({ processedBy: 1 });
orderSchema.index({ shippedAt: -1 });
orderSchema.index({ deliveredAt: -1 });
orderSchema.index({ cancelledAt: -1 });
orderSchema.index({ 'paymentDetails.transactionId': 1 });
orderSchema.index({ trackingNumber: 1 });
orderSchema.index({ carrier: 1 });

// Índices compuestos para consultas frecuentes
orderSchema.index({ user: 1, status: 1 });
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ paymentStatus: 1, createdAt: -1 });
orderSchema.index({ 'shippingAddress.state': 1, createdAt: -1 });

// Índice compuesto para reportes de ventas
orderSchema.index({
    createdAt: -1,
    status: 1,
    paymentStatus: 1
});

const Order = mongoose.model('Order', orderSchema);

export default Order;
