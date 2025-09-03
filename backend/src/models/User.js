import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es requerido'],
    trim: true,
    maxlength: [50, 'El nombre no puede exceder 50 caracteres']
  },
  email: {
    type: String,
    required: [true, 'El email es requerido'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Por favor ingresa un email válido'
    ]
  },
  contraseña: {
    type: String,
    required: [true, 'La contraseña es requerida'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
    select: false // No incluir la contraseña en las consultas por defecto
  },
  rol: {
    type: String,
    enum: ['usuario', 'admin', 'moderador'],
    default: 'usuario'
  },
  fechaCreacion: {
    type: Date,
    default: Date.now
  },
  activo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true // Agrega createdAt y updatedAt automáticamente
});

// Middleware para encriptar contraseña antes de guardar
userSchema.pre('save', async function (next) {
  // Solo ejecutar si la contraseña fue modificada
  if (!this.isModified('contraseña')) return next();

  try {
    // Encriptar contraseña con salt de 12 rounds
    const salt = await bcrypt.genSalt(12);
    this.contraseña = await bcrypt.hash(this.contraseña, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Método para comparar contraseñas
userSchema.methods.compararContraseña = async function (contraseñaIngresada) {
  return await bcrypt.compare(contraseñaIngresada, this.contraseña);
};

// Método para obtener datos públicos del usuario (sin contraseña)
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.contraseña;
  delete userObject.__v;
  return userObject;
};

// Índice para mejorar rendimiento en búsquedas por email
userSchema.index({ email: 1 });

const User = mongoose.model('User', userSchema);

export default User;