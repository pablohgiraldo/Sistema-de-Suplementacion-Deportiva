import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

export default function Profile() {
    const { user, logout } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        rol: ''
    });

    useEffect(() => {
        if (user) {
            setFormData({
                nombre: user.nombre || '',
                email: user.email || '',
                rol: user.rol || ''
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const result = await api.put('/users/profile', formData);

            if (result.data.success) {
                setSuccess('Perfil actualizado exitosamente');
                setIsEditing(false);
                // Actualizar el usuario en el contexto
                // Nota: En una implementación real, actualizarías el contexto con los nuevos datos
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Error al actualizar perfil');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await logout();
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-lg">Cargando perfil...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-blue-600 px-6 py-4">
                        <h1 className="text-2xl font-bold text-white">Mi Perfil</h1>
                        <p className="text-blue-100">Gestiona tu información personal</p>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {error && (
                            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                                {success}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Información del usuario */}
                            <div className="md:col-span-2">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                    Información Personal
                                </h2>

                                {isEditing ? (
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div>
                                            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
                                                Nombre completo
                                            </label>
                                            <input
                                                type="text"
                                                id="nombre"
                                                name="nombre"
                                                value={formData.nombre}
                                                onChange={handleChange}
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="rol" className="block text-sm font-medium text-gray-700">
                                                Rol
                                            </label>
                                            <select
                                                id="rol"
                                                name="rol"
                                                value={formData.rol}
                                                onChange={handleChange}
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                disabled
                                            >
                                                <option value="usuario">Usuario</option>
                                                <option value="admin">Administrador</option>
                                                <option value="moderador">Moderador</option>
                                            </select>
                                            <p className="mt-1 text-sm text-gray-500">El rol no se puede cambiar</p>
                                        </div>

                                        <div className="flex space-x-3">
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                                            >
                                                {loading ? 'Guardando...' : 'Guardar cambios'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setIsEditing(false)}
                                                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Nombre completo</label>
                                            <p className="mt-1 text-sm text-gray-900">{user.nombre}</p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Email</label>
                                            <p className="mt-1 text-sm text-gray-900">{user.email}</p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Rol</label>
                                            <p className="mt-1 text-sm text-gray-900 capitalize">{user.rol}</p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Estado</label>
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                {user.activo ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </div>

                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            Editar perfil
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Acciones */}
                            <div className="space-y-4">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="text-sm font-medium text-gray-900 mb-2">Acciones</h3>
                                    <div className="space-y-2">
                                        <button
                                            onClick={handleLogout}
                                            className="w-full bg-red-600 text-white px-3 py-2 rounded-md text-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                                        >
                                            Cerrar sesión
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="text-sm font-medium text-gray-900 mb-2">Estadísticas</h3>
                                    <div className="text-sm text-gray-600">
                                        <p>Miembro desde: {new Date(user.createdAt).toLocaleDateString()}</p>
                                        <p>Última actualización: {new Date(user.updatedAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
