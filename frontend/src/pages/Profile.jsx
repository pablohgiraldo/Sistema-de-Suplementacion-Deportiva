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
import LoyaltyTransactionsHistory from '../components/LoyaltyTransactionsHistory';

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
                role: user.role || ''
            });
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
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando perfil...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg">
                                <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white">{user.nombre}</h1>
                                <p className="text-blue-100 flex items-center mt-1">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    {user.email}
                                </p>
                            </div>
                        </div>
                        <div className="hidden md:flex items-center space-x-3">
                            <span className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                                user.activo 
                                    ? 'bg-green-500 text-white' 
                                    : 'bg-red-500 text-white'
                            }`}>
                                {user.activo ? 'Activo' : 'Inactivo'}
                            </span>
                            <span className="px-4 py-2 bg-white bg-opacity-20 text-white rounded-lg text-sm font-semibold capitalize">
                                {user.role}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {error && (
                    <div className="mb-6">
                        <FormError error={error} />
                    </div>
                )}

                {success && (
                    <div className="mb-6">
                        <FormSuccess message={success} />
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Profile Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Personal Information Card */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    Información Personal
                                </h2>
                                {!isEditing && (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                    >
                                        Editar
                                    </button>
                                )}
                            </div>

                            <div className="p-6">
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
                                            <p className="text-sm text-gray-500 -mt-2">El rol no se puede cambiar</p>

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
                                        <div className="flex items-start">
                                            <svg className="w-5 h-5 text-gray-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-500">Nombre completo</label>
                                                <p className="mt-1 text-base text-gray-900">{user.nombre}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start">
                                            <svg className="w-5 h-5 text-gray-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-500">Email</label>
                                                <p className="mt-1 text-base text-gray-900">{user.email}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start">
                                            <svg className="w-5 h-5 text-gray-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                            </svg>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-500">Rol</label>
                                                <p className="mt-1 text-base text-gray-900 capitalize">{user.role}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Loyalty History */}
                        {!loyaltyLoading && loyaltyData && loyaltyData.currentBalance >= 0 && (
                            <LoyaltyTransactionsHistory />
                        )}
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="space-y-6">
                        {/* Loyalty Points Card */}
                        {!loyaltyLoading && loyaltyData && (
                            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg shadow-lg p-6 text-white">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold">Puntos de Lealtad</h3>
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                
                                {/* Balance */}
                                <div className="bg-white bg-opacity-20 rounded-lg p-4 mb-4">
                                    <p className="text-sm text-blue-100 mb-1">Balance Actual</p>
                                    <div className="flex items-baseline gap-2">
                                        <p className="text-4xl font-bold">
                                            {loyaltyData.currentBalance.toLocaleString()}
                                        </p>
                                        <span className="text-sm text-blue-100">puntos</span>
                                    </div>
                                    <p className="text-sm text-blue-100 mt-2">
                                        <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                                        </svg>
                                        Aprox. ${loyaltyData.valueInDollars} USD
                                    </p>
                                </div>

                                {/* Level Badge */}
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-sm text-blue-100">Nivel de Lealtad</span>
                                    <span className={`px-3 py-1 rounded-full text-sm font-bold shadow-lg ${
                                        loyaltyData.loyaltyLevel === 'Diamante' ? 'bg-purple-500 text-white' :
                                        loyaltyData.loyaltyLevel === 'Platino' ? 'bg-gray-300 text-gray-900' :
                                        loyaltyData.loyaltyLevel === 'Oro' ? 'bg-yellow-400 text-yellow-900' :
                                        loyaltyData.loyaltyLevel === 'Plata' ? 'bg-gray-200 text-gray-700' :
                                        'bg-orange-400 text-white'
                                    }`}>
                                        {loyaltyData.loyaltyLevel}
                                    </span>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-3 gap-3 mb-4">
                                    <div className="bg-white bg-opacity-10 rounded-lg p-3 text-center">
                                        <svg className="w-5 h-5 mx-auto mb-1 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <p className="text-xl font-bold">{loyaltyData.totalEarned.toLocaleString()}</p>
                                        <p className="text-xs text-blue-100">Ganados</p>
                                    </div>
                                    <div className="bg-white bg-opacity-10 rounded-lg p-3 text-center">
                                        <svg className="w-5 h-5 mx-auto mb-1 text-orange-300" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                        <p className="text-xl font-bold">{loyaltyData.totalRedeemed.toLocaleString()}</p>
                                        <p className="text-xs text-blue-100">Canjeados</p>
                                    </div>
                                    <div className="bg-white bg-opacity-10 rounded-lg p-3 text-center">
                                        <svg className="w-5 h-5 mx-auto mb-1 text-red-300" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                        <p className="text-xl font-bold">{loyaltyData.totalExpired.toLocaleString()}</p>
                                        <p className="text-xs text-blue-100">Expirados</p>
                                    </div>
                                </div>

                                {/* Info Tip */}
                                <div className="bg-white bg-opacity-10 rounded-lg p-3 border border-white border-opacity-20">
                                    <div className="flex items-start">
                                        <svg className="w-5 h-5 text-yellow-300 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                        <div>
                                            <p className="text-sm font-medium text-white">Canje de Puntos</p>
                                            <p className="text-xs text-blue-100 mt-1">
                                                100 puntos = $1 USD de descuento en tu próxima compra
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {loyaltyLoading && (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="animate-pulse space-y-4">
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-8 bg-gray-200 rounded"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            </div>
                        )}

                        {/* Account Info Card */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
                                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Información de Cuenta
                            </h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-500">Miembro desde</span>
                                    <span className="font-medium text-gray-900">
                                        {new Date(user.createdAt).toLocaleDateString('es-CO', { 
                                            year: 'numeric', 
                                            month: 'short', 
                                            day: 'numeric' 
                                        })}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-500">Última actualización</span>
                                    <span className="font-medium text-gray-900">
                                        {new Date(user.updatedAt).toLocaleDateString('es-CO', { 
                                            year: 'numeric', 
                                            month: 'short', 
                                            day: 'numeric' 
                                        })}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Actions Card */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
                                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Acciones
                            </h3>
                            <button
                                onClick={handleLogout}
                                className="w-full px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Cerrar Sesión
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
