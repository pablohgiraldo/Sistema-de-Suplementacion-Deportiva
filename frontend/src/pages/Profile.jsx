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
    const [loyaltyData, setLoyaltyData] = useState(null);
    const [loyaltyLoading, setLoyaltyLoading] = useState(true);
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
            // Cargar puntos de lealtad
            fetchLoyaltyPoints();
        }
    }, [user]);

    const fetchLoyaltyPoints = async () => {
        try {
            setLoyaltyLoading(true);
            const response = await api.get('/customers/me/loyalty');
            if (response.data.success) {
                setLoyaltyData(response.data.data);
            }
        } catch (err) {
            console.error('Error al cargar puntos de lealtad:', err);
            // No mostramos error al usuario, simplemente no mostramos la sección
        } finally {
            setLoyaltyLoading(false);
        }
    };

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

                                {/* Puntos de Lealtad */}
                                {!loyaltyLoading && loyaltyData && (
                                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="text-sm font-medium text-gray-900">Puntos de Lealtad</h3>
                                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        
                                        <div className="space-y-3">
                                            {/* Balance actual */}
                                            <div className="bg-white p-3 rounded-lg shadow-sm">
                                                <p className="text-xs text-gray-500 mb-1">Balance Actual</p>
                                                <div className="flex items-baseline gap-2">
                                                    <p className="text-3xl font-bold text-blue-600">
                                                        {loyaltyData.currentBalance.toLocaleString()}
                                                    </p>
                                                    <span className="text-sm text-gray-500">puntos</span>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    ≈ ${loyaltyData.valueInDollars} USD
                                                </p>
                                            </div>

                                            {/* Nivel de lealtad */}
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-600">Nivel:</span>
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                    loyaltyData.loyaltyLevel === 'Diamante' ? 'bg-purple-100 text-purple-800' :
                                                    loyaltyData.loyaltyLevel === 'Platino' ? 'bg-gray-200 text-gray-800' :
                                                    loyaltyData.loyaltyLevel === 'Oro' ? 'bg-yellow-100 text-yellow-800' :
                                                    loyaltyData.loyaltyLevel === 'Plata' ? 'bg-gray-100 text-gray-700' :
                                                    'bg-orange-100 text-orange-800'
                                                }`}>
                                                    {loyaltyData.loyaltyLevel}
                                                </span>
                                            </div>

                                            {/* Estadísticas */}
                                            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-blue-100">
                                                <div className="text-center">
                                                    <p className="text-lg font-semibold text-green-600">
                                                        {loyaltyData.totalEarned.toLocaleString()}
                                                    </p>
                                                    <p className="text-xs text-gray-500">Ganados</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-lg font-semibold text-orange-600">
                                                        {loyaltyData.totalRedeemed.toLocaleString()}
                                                    </p>
                                                    <p className="text-xs text-gray-500">Canjeados</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-lg font-semibold text-red-600">
                                                        {loyaltyData.totalExpired.toLocaleString()}
                                                    </p>
                                                    <p className="text-xs text-gray-500">Expirados</p>
                                                </div>
                                            </div>

                                            {/* Info sobre canje */}
                                            <div className="bg-blue-100 p-2 rounded text-xs text-blue-800">
                                                💡 <strong>Tip:</strong> 100 puntos = $1 USD de descuento en tu próxima compra
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {loyaltyLoading && (
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="animate-pulse space-y-2">
                                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                            <div className="h-8 bg-gray-200 rounded"></div>
                                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
