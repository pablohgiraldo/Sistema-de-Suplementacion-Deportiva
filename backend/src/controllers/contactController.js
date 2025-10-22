import ContactMessage from '../models/ContactMessage.js';

// Crear un nuevo mensaje de contacto
export const createContactMessage = async (req, res) => {
    try {
        const { nombre, email, telefono, asunto, mensaje, tipoConsulta } = req.body;
        
        // Validar datos requeridos
        if (!nombre || !email || !asunto || !mensaje) {
            return res.status(400).json({
                success: false,
                error: 'Faltan campos obligatorios',
                details: [
                    { field: 'nombre', message: 'El nombre es obligatorio' },
                    { field: 'email', message: 'El email es obligatorio' },
                    { field: 'asunto', message: 'El asunto es obligatorio' },
                    { field: 'mensaje', message: 'El mensaje es obligatorio' }
                ].filter(item => !req.body[item.field])
            });
        }

        // Crear el mensaje de contacto
        const contactMessage = new ContactMessage({
            nombre: nombre.trim(),
            email: email.trim().toLowerCase(),
            telefono: telefono ? telefono.trim() : undefined,
            asunto: asunto.trim(),
            mensaje: mensaje.trim(),
            tipoConsulta: tipoConsulta || 'general',
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.get('User-Agent')
        });

        await contactMessage.save();

        // TODO: Aquí podrías agregar lógica para enviar email de notificación
        // await sendNotificationEmail(contactMessage);

        res.status(201).json({
            success: true,
            message: 'Mensaje enviado exitosamente',
            data: {
                id: contactMessage._id,
                fechaCreacion: contactMessage.fechaCreacion
            }
        });

    } catch (error) {
        console.error('Error al crear mensaje de contacto:', error);
        
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => ({
                field: err.path,
                message: err.message
            }));
            
            return res.status(400).json({
                success: false,
                error: 'Error de validación',
                details: validationErrors
            });
        }

        res.status(500).json({
            success: false,
            error: 'Error interno del servidor',
            message: 'No se pudo procesar el mensaje'
        });
    }
};

// Obtener mensajes de contacto (para administradores)
export const getContactMessages = async (req, res) => {
    try {
        const { page = 1, limit = 10, estado, tipoConsulta } = req.query;
        
        // Construir filtros
        const filters = {};
        if (estado) filters.estado = estado;
        if (tipoConsulta) filters.tipoConsulta = tipoConsulta;

        // Calcular paginación
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        // Obtener mensajes con paginación
        const messages = await ContactMessage.find(filters)
            .sort({ fechaCreacion: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .select('-__v');

        // Contar total de mensajes
        const total = await ContactMessage.countDocuments(filters);

        res.json({
            success: true,
            data: messages,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });

    } catch (error) {
        console.error('Error al obtener mensajes de contacto:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
};

// Obtener un mensaje específico
export const getContactMessageById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const message = await ContactMessage.findById(id);
        
        if (!message) {
            return res.status(404).json({
                success: false,
                error: 'Mensaje no encontrado'
            });
        }

        res.json({
            success: true,
            data: message
        });

    } catch (error) {
        console.error('Error al obtener mensaje de contacto:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
};

// Actualizar estado de un mensaje
export const updateContactMessageStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;

        if (!estado || !['nuevo', 'en_proceso', 'respondido', 'cerrado'].includes(estado)) {
            return res.status(400).json({
                success: false,
                error: 'Estado inválido'
            });
        }

        const message = await ContactMessage.findByIdAndUpdate(
            id,
            { estado },
            { new: true, runValidators: true }
        );

        if (!message) {
            return res.status(404).json({
                success: false,
                error: 'Mensaje no encontrado'
            });
        }

        res.json({
            success: true,
            message: 'Estado actualizado exitosamente',
            data: message
        });

    } catch (error) {
        console.error('Error al actualizar estado del mensaje:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
};

// Eliminar un mensaje
export const deleteContactMessage = async (req, res) => {
    try {
        const { id } = req.params;
        
        const message = await ContactMessage.findByIdAndDelete(id);
        
        if (!message) {
            return res.status(404).json({
                success: false,
                error: 'Mensaje no encontrado'
            });
        }

        res.json({
            success: true,
            message: 'Mensaje eliminado exitosamente'
        });

    } catch (error) {
        console.error('Error al eliminar mensaje de contacto:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
};

// Obtener estadísticas de mensajes de contacto
export const getContactStats = async (req, res) => {
    try {
        const stats = await ContactMessage.aggregate([
            {
                $group: {
                    _id: '$estado',
                    count: { $sum: 1 }
                }
            }
        ]);

        const tipoStats = await ContactMessage.aggregate([
            {
                $group: {
                    _id: '$tipoConsulta',
                    count: { $sum: 1 }
                }
            }
        ]);

        const totalMessages = await ContactMessage.countDocuments();
        const messagesToday = await ContactMessage.countDocuments({
            fechaCreacion: {
                $gte: new Date(new Date().setHours(0, 0, 0, 0))
            }
        });

        res.json({
            success: true,
            data: {
                total: totalMessages,
                today: messagesToday,
                byStatus: stats,
                byType: tipoStats
            }
        });

    } catch (error) {
        console.error('Error al obtener estadísticas de contacto:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
};
