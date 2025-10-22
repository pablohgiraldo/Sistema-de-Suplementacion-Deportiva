import mongoose from 'mongoose';

const contactMessageSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, "El nombre es obligatorio"],
        trim: true,
        maxlength: [50, "El nombre no puede tener más de 50 caracteres"]
    },
    email: {
        type: String,
        required: [true, "El email es obligatorio"],
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Ingresa un email válido"]
    },
    telefono: {
        type: String,
        trim: true,
        maxlength: [20, "El teléfono no puede tener más de 20 caracteres"]
    },
    asunto: {
        type: String,
        required: [true, "El asunto es obligatorio"],
        trim: true,
        maxlength: [100, "El asunto no puede tener más de 100 caracteres"]
    },
    mensaje: {
        type: String,
        required: [true, "El mensaje es obligatorio"],
        trim: true,
        maxlength: [1000, "El mensaje no puede tener más de 1000 caracteres"]
    },
    tipoConsulta: {
        type: String,
        required: [true, "El tipo de consulta es obligatorio"],
        enum: ['general', 'producto', 'pedido', 'soporte', 'sugerencia', 'reclamo'],
        default: 'general'
    },
    estado: {
        type: String,
        enum: ['nuevo', 'en_proceso', 'respondido', 'cerrado'],
        default: 'nuevo'
    },
    fechaCreacion: {
        type: Date,
        default: Date.now
    },
    fechaActualizacion: {
        type: Date,
        default: Date.now
    },
    ipAddress: {
        type: String,
        trim: true
    },
    userAgent: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

// Middleware para actualizar fechaActualizacion
contactMessageSchema.pre('save', function(next) {
    this.fechaActualizacion = new Date();
    next();
});

// Índices para mejorar consultas
contactMessageSchema.index({ email: 1, fechaCreacion: -1 });
contactMessageSchema.index({ estado: 1, fechaCreacion: -1 });
contactMessageSchema.index({ tipoConsulta: 1 });

const ContactMessage = mongoose.model('ContactMessage', contactMessageSchema);

export default ContactMessage;
