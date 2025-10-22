import mongoose from "mongoose";
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "El nombre del producto es obligatorio"],
      trim: true,
      maxlength: [100, "El nombre no puede tener más de 100 caracteres"]
    },
    brand: {
      type: String,
      trim: true,
      maxlength: [50, "La marca no puede tener más de 50 caracteres"]
    },
    price: {
      type: Number,
      required: [true, "El precio es obligatorio"],
      min: [0, "El precio no puede ser negativo"],
      max: [10000, "El precio no puede exceder $10,000"]
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, "El stock no puede ser negativo"]
    },
    imageUrl: {
      type: String,
      validate: {
        validator: function (v) {
          return !v || /^https?:\/\/.+/.test(v);
        },
        message: "La URL de la imagen debe ser válida"
      }
    },
    description: {
      type: String,
      maxlength: [1000, "La descripción no puede tener más de 1000 caracteres"]
    },
    categories: {
      type: [String],
      validate: {
        validator: function (v) {
          return !v || v.length <= 10;
        },
        message: "No puede tener más de 10 categorías"
      }
    },
    // Información nutricional detallada
    nutritionalInfo: {
      servingSize: String,
      servingsPerContainer: Number,
      calories: Number,
      protein: Number,
      carbs: Number,
      fats: Number,
      fiber: Number,
      sugar: Number,
      sodium: Number,
      vitamins: [{
        name: String,
        amount: String,
        dailyValue: Number
      }],
      minerals: [{
        name: String,
        amount: String,
        dailyValue: Number
      }]
    },
    // Ingredientes
    ingredients: {
      main: [String],
      additives: [String],
      allergens: [String]
    },
    // Perfil de aminoácidos (para proteínas)
    aminoAcids: [{
      name: String,
      amount: String,
      perServing: Number
    }],
    // Instrucciones de uso
    usage: {
      instructions: String,
      dosage: String,
      timing: String,
      warnings: [String]
    },
    // Información adicional
    productDetails: {
      flavor: String,
      size: String,
      weight: String,
      servings: Number,
      isVegan: Boolean,
      isGlutenFree: Boolean,
      isLactoseFree: Boolean,
      isSugarFree: Boolean
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Índices para mejorar el rendimiento de las consultas
// Índice de texto completo para búsqueda avanzada
productSchema.index({
  name: 'text',
  description: 'text',
  brand: 'text',
  categories: 'text'
});

// Índices individuales para filtros y ordenamiento
productSchema.index({ categories: 1 });
productSchema.index({ price: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ stock: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ updatedAt: -1 });

// Índice compuesto para búsquedas con filtros
productSchema.index({
  categories: 1,
  price: 1,
  brand: 1
});

// Virtual para el precio con formato
productSchema.virtual('formattedPrice').get(function () {
  if (!this.price) return '$0.00';
  return `$${this.price.toFixed(2)}`;
});

// Virtual para el estado del stock
productSchema.virtual('stockStatus').get(function () {
  if (this.stock === 0) return 'Agotado';
  if (this.stock < 10) return 'Stock bajo';
  return 'Disponible';
});
export default mongoose.model("Product", productSchema);
