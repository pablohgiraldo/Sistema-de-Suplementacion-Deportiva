import mongoose from 'mongoose';

const wishlistItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: [true, 'El producto es requerido']
    },
    addedAt: {
        type: Date,
        default: Date.now
    }
}, { _id: false });

const wishlistSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'El usuario es requerido'],
        unique: true,
        index: true
    },
    items: [wishlistItemSchema],
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Índices para optimizar consultas
wishlistSchema.index({ user: 1 });
wishlistSchema.index({ 'items.product': 1 });

// Middleware para actualizar updatedAt antes de guardar
wishlistSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

// Método para agregar producto a la wishlist
wishlistSchema.methods.addProduct = function (productId) {
    const exists = this.items.some(item =>
        item.product.toString() === productId.toString()
    );

    if (!exists) {
        this.items.push({ product: productId });
    }

    return this.save();
};

// Método para remover producto de la wishlist
wishlistSchema.methods.removeProduct = function (productId) {
    this.items = this.items.filter(item =>
        item.product.toString() !== productId.toString()
    );

    return this.save();
};

// Método para verificar si un producto está en la wishlist
wishlistSchema.methods.hasProduct = function (productId) {
    return this.items.some(item =>
        item.product.toString() === productId.toString()
    );
};

// Método para limpiar wishlist
wishlistSchema.methods.clear = function () {
    this.items = [];
    return this.save();
};

// Virtual para obtener el conteo de items
wishlistSchema.virtual('itemCount').get(function () {
    return this.items.length;
});

// Asegurar que los virtuals se incluyan en JSON
wishlistSchema.set('toJSON', { virtuals: true });
wishlistSchema.set('toObject', { virtuals: true });

// Método estático para obtener o crear wishlist de un usuario
wishlistSchema.statics.getOrCreate = async function (userId) {
    let wishlist = await this.findOne({ user: userId }).populate('items.product');

    if (!wishlist) {
        wishlist = await this.create({ user: userId, items: [] });
        wishlist = await this.findById(wishlist._id).populate('items.product');
    }

    return wishlist;
};

const Wishlist = mongoose.model('Wishlist', wishlistSchema);

export default Wishlist;

