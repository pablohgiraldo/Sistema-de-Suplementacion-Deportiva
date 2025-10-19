import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: [true, "El producto es obligatorio"],
            unique: true // Un producto solo puede tener un registro de inventario
        },
        // Stock total (suma de todos los canales)
        currentStock: {
            type: Number,
            required: [true, "El stock actual es obligatorio"],
            min: [0, "El stock no puede ser negativo"],
            default: 0
        },
        minStock: {
            type: Number,
            required: [true, "El stock mínimo es obligatorio"],
            min: [0, "El stock mínimo no puede ser negativo"],
            default: 5
        },
        maxStock: {
            type: Number,
            required: [true, "El stock máximo es obligatorio"],
            min: [0, "El stock máximo no puede ser negativo"],
            default: 100
        },
        reservedStock: {
            type: Number,
            default: 0,
            min: [0, "El stock reservado no puede ser negativo"]
        },
        availableStock: {
            type: Number,
            default: 0,
            min: [0, "El stock disponible no puede ser negativo"]
        },
        // Canales de inventario
        channels: {
            physical: {
                stock: {
                    type: Number,
                    default: 0,
                    min: [0, "El stock físico no puede ser negativo"]
                },
                location: {
                    type: String,
                    maxlength: [100, "La ubicación no puede tener más de 100 caracteres"],
                    default: "Almacén Principal"
                },
                lastUpdated: {
                    type: Date,
                    default: Date.now
                },
                lastSync: {
                    type: Date,
                    default: Date.now
                },
                syncStatus: {
                    type: String,
                    enum: ['synced', 'pending', 'error'],
                    default: 'synced'
                }
            },
            digital: {
                stock: {
                    type: Number,
                    default: 0,
                    min: [0, "El stock digital no puede ser negativo"]
                },
                platform: {
                    type: String,
                    enum: ['website', 'mobile_app', 'api'],
                    default: 'website'
                },
                lastUpdated: {
                    type: Date,
                    default: Date.now
                },
                lastSync: {
                    type: Date,
                    default: Date.now
                },
                syncStatus: {
                    type: String,
                    enum: ['synced', 'pending', 'error'],
                    default: 'synced'
                }
            }
        },
        lastRestocked: {
            type: Date,
            default: Date.now
        },
        lastSold: {
            type: Date
        },
        totalSold: {
            type: Number,
            default: 0,
            min: [0, "El total vendido no puede ser negativo"]
        },
        status: {
            type: String,
            enum: {
                values: ['active', 'inactive', 'discontinued', 'out_of_stock'],
                message: 'El estado debe ser: active, inactive, discontinued o out_of_stock'
            },
            default: 'active'
        },
        notes: {
            type: String,
            maxlength: [500, "Las notas no pueden tener más de 500 caracteres"]
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Índices para mejorar el rendimiento
inventorySchema.index({ product: 1 });
inventorySchema.index({ currentStock: 1 });
inventorySchema.index({ status: 1 });
inventorySchema.index({ lastRestocked: -1 });
inventorySchema.index({ lastSold: -1 });

// Índices para canales omnicanales
inventorySchema.index({ 'channels.physical.stock': 1 });
inventorySchema.index({ 'channels.digital.stock': 1 });
inventorySchema.index({ 'channels.physical.syncStatus': 1 });
inventorySchema.index({ 'channels.digital.syncStatus': 1 });
inventorySchema.index({ 'channels.physical.lastSync': -1 });
inventorySchema.index({ 'channels.digital.lastSync': -1 });

// Índice compuesto para consultas frecuentes
inventorySchema.index({ status: 1, currentStock: 1 });
inventorySchema.index({ 'channels.physical.syncStatus': 1, 'channels.digital.syncStatus': 1 });

// Middleware pre-save para calcular stock total y disponible
inventorySchema.pre('save', function (next) {
    // Calcular stock total sumando ambos canales
    this.currentStock = this.channels.physical.stock + this.channels.digital.stock;
    this.availableStock = Math.max(0, this.currentStock - this.reservedStock);

    // Actualizar status basado en stock
    if (this.currentStock === 0) {
        this.status = 'out_of_stock';
    } else if (this.status === 'out_of_stock' && this.currentStock > 0) {
        this.status = 'active';
    }

    next();
});

// Virtual para el estado del stock
inventorySchema.virtual('stockStatus').get(function () {
    if (this.currentStock === 0) return 'Agotado';
    if (this.currentStock <= this.minStock) return 'Stock bajo';
    if (this.currentStock >= this.maxStock) return 'Stock alto';
    return 'Normal';
});

// Virtual para verificar si necesita reabastecimiento
inventorySchema.virtual('needsRestock').get(function () {
    return this.currentStock <= this.minStock;
});

// Virtual para verificar si está disponible para venta
inventorySchema.virtual('isAvailable').get(function () {
    return this.status === 'active' && this.availableStock > 0;
});

// Método estático para obtener productos con stock bajo
inventorySchema.statics.getLowStockProducts = function () {
    return this.find({
        $expr: { $lte: ['$currentStock', '$minStock'] },
        status: 'active'
    }).populate('product', 'name brand price imageUrl');
};

// Método estático para obtener productos agotados
inventorySchema.statics.getOutOfStockProducts = function () {
    return this.find({
        currentStock: 0,
        status: 'active'
    }).populate('product', 'name brand price imageUrl');
};

// Métodos estáticos para consultas omnicanales

// Obtener productos con discrepancias entre canales
inventorySchema.statics.getChannelDiscrepancies = function () {
    return this.find({
        $expr: {
            $ne: ['$channels.physical.stock', '$channels.digital.stock']
        },
        status: 'active'
    }).populate('product', 'name brand price imageUrl');
};

// Obtener productos con stock físico bajo
inventorySchema.statics.getLowPhysicalStockProducts = function () {
    return this.find({
        $expr: { $lte: ['$channels.physical.stock', '$minStock'] },
        status: 'active'
    }).populate('product', 'name brand price imageUrl');
};

// Obtener productos con stock digital bajo
inventorySchema.statics.getLowDigitalStockProducts = function () {
    return this.find({
        $expr: { $lte: ['$channels.digital.stock', '$minStock'] },
        status: 'active'
    }).populate('product', 'name brand price imageUrl');
};

// Obtener productos que necesitan sincronización
inventorySchema.statics.getPendingSyncProducts = function () {
    return this.find({
        $or: [
            { 'channels.physical.syncStatus': 'pending' },
            { 'channels.digital.syncStatus': 'pending' }
        ],
        status: 'active'
    }).populate('product', 'name brand price imageUrl');
};

// Obtener productos con errores de sincronización
inventorySchema.statics.getSyncErrorProducts = function () {
    return this.find({
        $or: [
            { 'channels.physical.syncStatus': 'error' },
            { 'channels.digital.syncStatus': 'error' }
        ],
        status: 'active'
    }).populate('product', 'name brand price imageUrl');
};

// Obtener estadísticas omnicanales
inventorySchema.statics.getOmnichannelStats = function () {
    return this.aggregate([
        {
            $group: {
                _id: null,
                totalProducts: { $sum: 1 },
                totalPhysicalStock: { $sum: '$channels.physical.stock' },
                totalDigitalStock: { $sum: '$channels.digital.stock' },
                totalStock: { $sum: '$currentStock' },
                productsWithDiscrepancies: {
                    $sum: {
                        $cond: [
                            { $ne: ['$channels.physical.stock', '$channels.digital.stock'] },
                            1,
                            0
                        ]
                    }
                },
                productsPendingSync: {
                    $sum: {
                        $cond: [
                            {
                                $or: [
                                    { $eq: ['$channels.physical.syncStatus', 'pending'] },
                                    { $eq: ['$channels.digital.syncStatus', 'pending'] }
                                ]
                            },
                            1,
                            0
                        ]
                    }
                },
                productsWithSyncErrors: {
                    $sum: {
                        $cond: [
                            {
                                $or: [
                                    { $eq: ['$channels.physical.syncStatus', 'error'] },
                                    { $eq: ['$channels.digital.syncStatus', 'error'] }
                                ]
                            },
                            1,
                            0
                        ]
                    }
                }
            }
        }
    ]);
};

// Método para reservar stock
inventorySchema.methods.reserveStock = function (quantity) {
    if (this.availableStock < quantity) {
        throw new Error(`Stock insuficiente. Disponible: ${this.availableStock}, Solicitado: ${quantity}`);
    }

    this.reservedStock += quantity;
    this.availableStock = Math.max(0, this.currentStock - this.reservedStock);

    return this.save();
};

// Método para liberar stock reservado
inventorySchema.methods.releaseStock = function (quantity) {
    this.reservedStock = Math.max(0, this.reservedStock - quantity);
    this.availableStock = Math.max(0, this.currentStock - this.reservedStock);

    return this.save();
};

// Método para vender stock
inventorySchema.methods.sellStock = function (quantity) {
    if (this.availableStock < quantity) {
        throw new Error(`Stock insuficiente. Disponible: ${this.availableStock}, Solicitado: ${quantity}`);
    }

    const newStock = this.currentStock - quantity;
    
    // Actualizar stock total
    this.currentStock = newStock;
    // Solo reducir reservedStock si hay stock reservado
    if (this.reservedStock > 0) {
        this.reservedStock = Math.max(0, this.reservedStock - quantity);
    }
    this.availableStock = Math.max(0, this.currentStock - this.reservedStock);
    
    // IMPORTANTE: Sincronizar ambos canales con el stock real
    this.channels.physical.stock = newStock;
    this.channels.digital.stock = newStock;
    
    // Actualizar timestamps y estado de sincronización
    const now = new Date();
    this.channels.physical.lastUpdated = now;
    this.channels.digital.lastUpdated = now;
    this.channels.physical.lastSync = now;
    this.channels.digital.lastSync = now;
    this.channels.physical.syncStatus = 'synced';
    this.channels.digital.syncStatus = 'synced';
    
    this.totalSold += quantity;
    this.lastSold = now;

    return this.save();
};

// Método para reabastecer stock
inventorySchema.methods.restock = function (quantity, notes = '') {
    this.currentStock += quantity;
    this.availableStock = Math.max(0, this.currentStock - this.reservedStock);
    
    // IMPORTANTE: Sincronizar ambos canales con el stock real
    this.channels.physical.stock = this.currentStock;
    this.channels.digital.stock = this.currentStock;
    
    // Actualizar timestamps y estado de sincronización
    const now = new Date();
    this.channels.physical.lastUpdated = now;
    this.channels.digital.lastUpdated = now;
    this.channels.physical.lastSync = now;
    this.channels.digital.lastSync = now;
    this.channels.physical.syncStatus = 'synced';
    this.channels.digital.syncStatus = 'synced';
    
    this.lastRestocked = now;

    if (notes) {
        this.notes = notes;
    }

    // Cambiar status si estaba agotado
    if (this.status === 'out_of_stock' && this.currentStock > 0) {
        this.status = 'active';
    }

    return this.save();
};

// Métodos específicos para manejo omnicanal

// Método para actualizar stock físico
inventorySchema.methods.updatePhysicalStock = function (quantity, location = null) {
    this.channels.physical.stock = Math.max(0, quantity);
    this.channels.physical.lastUpdated = new Date();
    this.channels.physical.syncStatus = 'pending';

    if (location) {
        this.channels.physical.location = location;
    }

    return this.save();
};

// Método para actualizar stock digital
inventorySchema.methods.updateDigitalStock = function (quantity, platform = 'website') {
    this.channels.digital.stock = Math.max(0, quantity);
    this.channels.digital.lastUpdated = new Date();
    this.channels.digital.syncStatus = 'pending';
    this.channels.digital.platform = platform;

    return this.save();
};

// Método para sincronizar canales
inventorySchema.methods.syncChannels = function () {
    const now = new Date();

    // Marcar ambos canales como sincronizados
    this.channels.physical.lastSync = now;
    this.channels.digital.lastSync = now;
    this.channels.physical.syncStatus = 'synced';
    this.channels.digital.syncStatus = 'synced';

    return this.save();
};

// Método para obtener diferencias entre canales
inventorySchema.methods.getChannelDifferences = function () {
    const physicalStock = this.channels.physical.stock;
    const digitalStock = this.channels.digital.stock;
    const totalStock = physicalStock + digitalStock;

    return {
        physicalStock,
        digitalStock,
        totalStock,
        difference: Math.abs(physicalStock - digitalStock),
        hasDiscrepancy: physicalStock !== digitalStock,
        lastPhysicalUpdate: this.channels.physical.lastUpdated,
        lastDigitalUpdate: this.channels.digital.lastUpdated,
        physicalSyncStatus: this.channels.physical.syncStatus,
        digitalSyncStatus: this.channels.digital.syncStatus
    };
};

// Método para vender desde canal específico
inventorySchema.methods.sellFromChannel = function (quantity, channel = 'physical') {
    if (this.availableStock < quantity) {
        throw new Error(`Stock insuficiente. Disponible: ${this.availableStock}, Solicitado: ${quantity}`);
    }

    // Verificar que el canal específico tenga stock suficiente
    if (channel === 'physical') {
        if (this.channels.physical.stock < quantity) {
            throw new Error(`Stock físico insuficiente. Disponible: ${this.channels.physical.stock}, Solicitado: ${quantity}`);
        }
    } else if (channel === 'digital') {
        if (this.channels.digital.stock < quantity) {
            throw new Error(`Stock digital insuficiente. Disponible: ${this.channels.digital.stock}, Solicitado: ${quantity}`);
        }
    }

    // IMPORTANTE: En un inventario unificado, cuando se vende desde cualquier canal,
    // reducimos el stock real del almacén y sincronizamos ambos canales
    
    // Reducir el stock real del almacén
    this.currentStock = this.currentStock - quantity;
    this.availableStock = Math.max(0, this.currentStock - this.reservedStock);
    
    // Sincronizar AMBOS canales al stock real del almacén
    // Ambos canales deben reflejar exactamente el mismo stock real
    this.channels.physical.stock = this.currentStock;
    this.channels.digital.stock = this.currentStock;
    
    // Actualizar timestamps y estado de sincronización
    const now = new Date();
    this.channels.physical.lastUpdated = now;
    this.channels.digital.lastUpdated = now;
    this.channels.physical.lastSync = now;
    this.channels.digital.lastSync = now;
    this.channels.physical.syncStatus = 'synced';
    this.channels.digital.syncStatus = 'synced';

    // Actualizar métricas generales
    this.totalSold += quantity;
    this.lastSold = now;

    return this.save();
};

// Método para reabastecer canal específico
inventorySchema.methods.restockChannel = function (quantity, channel = 'physical', notes = '') {
    if (channel === 'physical') {
        this.channels.physical.stock += quantity;
        this.channels.physical.lastUpdated = new Date();
        this.channels.physical.syncStatus = 'pending';
    } else if (channel === 'digital') {
        this.channels.digital.stock += quantity;
        this.channels.digital.lastUpdated = new Date();
        this.channels.digital.syncStatus = 'pending';
    }

    this.lastRestocked = new Date();

    if (notes) {
        this.notes = notes;
    }

    // Cambiar status si estaba agotado
    if (this.status === 'out_of_stock' && this.currentStock > 0) {
        this.status = 'active';
    }

    return this.save();
};

export default mongoose.model("Inventory", inventorySchema);
