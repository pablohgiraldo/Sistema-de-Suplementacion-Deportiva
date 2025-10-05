import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import api from '../services/api';
import {
    FormInput,
    FormSelect,
    FormButton,
    FormGroup,
    FormGrid,
    FormError,
    FormSuccess
} from '../components/forms';

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
                            <div className="mb-4">
                                <FormError error={error} />
                            </div>
                        )}

                        {success && (
                            <div className="mb-4">
                                <FormSuccess message={success} />
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Información del usuario */}
                            <div className="md:col-span-2">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                    Información Personal
                                </h2>

                                {isEditing ? (
                                    <form onSubmit={handleSubmit}>
                                        <FormGroup>
                                            <FormInput
                                                id="nombre"
                                                name="nombre"
                                                type="text"
                                                label="Nombre completo"
                                                value={formData.nombre}
                                                onChange={handleChange}
                                                required
                                            />

                                            <FormInput
                                                id="email"
                                                name="email"
                                                type="email"
                                                label="Email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                            />

                                            <FormSelect
                                                id="rol"
                                                name="rol"
                                                label="Rol"
                                                value={formData.rol}
                                                onChange={handleChange}
                                                disabled
                                                options={[
                                                    { value: 'usuario', label: 'Usuario' },
                                                    { value: 'admin', label: 'Administrador' },
                                                    { value: 'moderador', label: 'Moderador' }
                                                ]}
                                            />
                                            <p className="text-sm text-gray-500">El rol no se puede cambiar</p>

                                            <FormGrid columns={2} gap="default">
                                                <FormButton
                                                    type="submit"
                                                    variant="primary"
                                                    disabled={loading}
                                                    loading={loading}
                                                >
                                                    {loading ? 'Guardando...' : 'Guardar cambios'}
                                                </FormButton>
                                                <FormButton
                                                    type="button"
                                                    variant="secondary"
                                                    onClick={() => setIsEditing(false)}
                                                >
                                                    Cancelar
                                                </FormButton>
                                            </FormGrid>
                                        </FormGroup>
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

                                        <FormButton
                                            variant="primary"
                                            onClick={() => setIsEditing(true)}
                                        >
                                            Editar perfil
                                        </FormButton>
                                    </div>
                                )}
                            </div>

                            {/* Acciones */}
                            <div className="space-y-4">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="text-sm font-medium text-gray-900 mb-2">Acciones</h3>
                                    <div className="space-y-2">
                                        <FormButton
                                            variant="danger"
                                            size="sm"
                                            onClick={handleLogout}
                                            className="w-full"
                                        >
                                            Cerrar sesión
                                        </FormButton>
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
