import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, 'La cantidad debe ser al menos 1'],
        max: [100, 'La cantidad no puede exceder 100']
    },
    price: {
        type: Number,
        required: true,
        min: [0, 'El precio no puede ser negativo']
    }
}, { _id: false });

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    items: [cartItemSchema],
    total: {
        type: Number,
        default: 0,
        min: [0, 'El total no puede ser negativo']
    }
}, {
    timestamps: true
});

// Middleware para calcular el total antes de guardar
cartSchema.pre('save', function (next) {
    this.total = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    next();
});

// Método para agregar un producto al carrito
cartSchema.methods.addItem = function (productId, quantity, price) {
    const existingItem = this.items.find(item => item.product.toString() === productId.toString());

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        this.items.push({
            product: productId,
            quantity: quantity,
            price: price
        });
    }

    return this.save();
};

// Método para remover un producto del carrito
cartSchema.methods.removeItem = function (productId) {
    this.items = this.items.filter(item => item.product.toString() !== productId.toString());
    return this.save();
};

// Método para actualizar la cantidad de un producto
cartSchema.methods.updateQuantity = function (productId, quantity) {
    const item = this.items.find(item => item.product.toString() === productId.toString());

    if (item) {
        if (quantity <= 0) {
            return this.removeItem(productId);
        } else {
            item.quantity = quantity;
        }
    }

    return this.save();
};

// Método para limpiar el carrito
cartSchema.methods.clearCart = function () {
    this.items = [];
    this.total = 0;
    return this.save();
};

// Índices para optimizar consultas
cartSchema.index({ user: 1 });
cartSchema.index({ 'items.product': 1 });

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;
