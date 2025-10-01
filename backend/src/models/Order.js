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
        enum: ['credit_card', 'debit_card', 'paypal', 'cash', 'bank_transfer'],
        required: [true, 'El método de pago es requerido']
    },
    shippingAddress: {
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
        }
    },
    notes: {
        type: String,
        maxlength: [500, 'Las notas no pueden exceder 500 caracteres']
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
        'debit_card': 'Tarjeta de Débito',
        'paypal': 'PayPal',
        'cash': 'Efectivo',
        'bank_transfer': 'Transferencia Bancaria'
    };
    return methodMap[this.paymentMethod] || this.paymentMethod;
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
orderSchema.methods.updatePaymentStatus = function (newStatus) {
    this.paymentStatus = newStatus;
    return this.save();
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

// Índice compuesto para reportes de ventas
orderSchema.index({
    createdAt: -1,
    status: 1,
    paymentStatus: 1
});

const Order = mongoose.model('Order', orderSchema);

export default Order;
