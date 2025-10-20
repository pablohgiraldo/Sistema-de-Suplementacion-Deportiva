import { verifyToken, extractTokenFromHeader } from '../config/jwt.js';
import User from '../models/User.js';

const authMiddleware = async (req, res, next) => {
    try {
        // Obtener token del header Authorization
        const authHeader = req.get('Authorization');
        const token = extractTokenFromHeader(authHeader);

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token no proporcionado'
            });
        }

        // Verificar token usando la configuración centralizada
        const decoded = verifyToken(token);

        // Buscar usuario en la base de datos
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Token inválido - usuario no encontrado'
            });
        }

        if (!user.activo) {
            return res.status(401).json({
                success: false,
                message: 'Usuario inactivo'
            });
        }

        // Agregar usuario al objeto request
        req.user = user;
        req.userId = decoded.userId;
        req.userRole = decoded.role;
        next();

    } catch (error) {
        console.error('Error en middleware de autenticación:', error);

        if (error.message.includes('expirado')) {
            return res.status(401).json({
                success: false,
                message: 'Token expirado'
            });
        }

        if (error.message.includes('inválido')) {
            return res.status(401).json({
                success: false,
                message: 'Token inválido'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error del servidor en autenticación'
        });
    }
};

export default authMiddleware;