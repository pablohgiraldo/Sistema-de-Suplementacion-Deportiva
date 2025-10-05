import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: [true, "El producto es obligatorio"],
            unique: true // Un producto solo puede tener un registro de inventario
        },
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

// Índice compuesto para consultas frecuentes
inventorySchema.index({ status: 1, currentStock: 1 });

// Middleware pre-save para calcular stock disponible
inventorySchema.pre('save', function (next) {
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

    this.currentStock -= quantity;
    // Solo reducir reservedStock si hay stock reservado
    if (this.reservedStock > 0) {
        this.reservedStock = Math.max(0, this.reservedStock - quantity);
    }
    this.availableStock = Math.max(0, this.currentStock - this.reservedStock);
    this.totalSold += quantity;
    this.lastSold = new Date();

    return this.save();
};

// Método para reabastecer stock
inventorySchema.methods.restock = function (quantity, notes = '') {
    this.currentStock += quantity;
    this.availableStock = Math.max(0, this.currentStock - this.reservedStock);
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
