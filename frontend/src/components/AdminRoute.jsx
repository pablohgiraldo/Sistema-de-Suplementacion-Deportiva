import { useAuth } from '../contexts/AuthContext.jsx';

const AdminRoute = ({ children }) => {
    const { user, isAuthenticated } = useAuth();

    // Debug: verificar qué información está recibiendo
    console.log('AdminRoute - Usuario:', user);
    console.log('AdminRoute - Rol (rol):', user?.rol);
    console.log('AdminRoute - Rol (role):', user?.role);
    console.log('AdminRoute - Autenticado:', isAuthenticated);


    // Verificar si el usuario está autenticado y es administrador
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Acceso Requerido</h1>
                    <p className="text-gray-600 mb-4">Debes iniciar sesión para acceder a esta página.</p>
                    <a
                        href="/login"
                        className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Iniciar Sesión
                    </a>
                </div>
            </div>
        );
    }

    if (user?.rol !== 'admin') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Acceso Denegado</h1>
                    <p className="text-gray-600 mb-4">No tienes permisos de administrador para acceder a esta página.</p>
                    <a
                        href="/"
                        className="inline-block bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        Volver al Inicio
                    </a>
                </div>
            </div>
        );
    }

    return children;
};

export default AdminRoute;
