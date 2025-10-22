import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import { formTypography } from '../config/typography.js';

const AdminContact = () => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [filters, setFilters] = useState({
        estado: '',
        tipoConsulta: '',
        fechaDesde: '',
        fechaHasta: ''
    });
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        pages: 0
    });

    // Verificar autenticación y rol de administrador
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        if (user?.role !== 'admin') {
            navigate('/');
            return;
        }
    }, [isAuthenticated, user, navigate]);

    // Cargar mensajes
    const loadMessages = async (page = 1) => {
        try {
            setLoading(true);

            // Construir query parameters
            const params = new URLSearchParams({
                page: page.toString(),
                limit: pagination.limit.toString()
            });

            if (filters.estado) params.append('estado', filters.estado);
            if (filters.tipoConsulta) params.append('tipoConsulta', filters.tipoConsulta);

            const response = await api.get(`/contact?${params}`);

            if (response.data.success) {
                setMessages(response.data.data);
                setPagination(response.data.pagination);
            } else {
                throw new Error('Error al cargar mensajes');
            }
        } catch (err) {
            console.error('Error al cargar mensajes:', err);
            setError('Error al cargar los mensajes');
        } finally {
            setLoading(false);
        }
    };

    // Cargar mensajes al montar el componente
    useEffect(() => {
        if (isAuthenticated && user?.role === 'admin') {
            loadMessages();
        }
    }, [isAuthenticated, user]);

    // Actualizar estado de mensaje
    const updateMessageStatus = async (messageId, newStatus) => {
        try {
            const response = await api.put(`/contact/${messageId}/status`, { estado: newStatus });

            if (response.data.success) {
                // Recargar mensajes
                loadMessages(pagination.page);
                setShowModal(false);
            } else {
                throw new Error('Error al actualizar estado');
            }
        } catch (err) {
            console.error('Error al actualizar estado:', err);
            setError('Error al actualizar el estado del mensaje');
        }
    };

    // Eliminar mensaje
    const deleteMessage = async (messageId) => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar este mensaje?')) {
            return;
        }

        try {
            const response = await api.delete(`/contact/${messageId}`);

            if (response.data.success) {
                // Recargar mensajes
                loadMessages(pagination.page);
                setShowModal(false);
            } else {
                throw new Error('Error al eliminar mensaje');
            }
        } catch (err) {
            console.error('Error al eliminar mensaje:', err);
            setError('Error al eliminar el mensaje');
        }
    };

    // Formatear fecha
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-CO', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Obtener color del estado
    const getStatusColor = (estado) => {
        switch (estado) {
            case 'nuevo': return 'bg-blue-100 text-blue-800';
            case 'en_proceso': return 'bg-yellow-100 text-yellow-800';
            case 'respondido': return 'bg-green-100 text-green-800';
            case 'cerrado': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // Obtener color del tipo de consulta
    const getTypeColor = (tipo) => {
        switch (tipo) {
            case 'general': return 'bg-purple-100 text-purple-800';
            case 'producto': return 'bg-blue-100 text-blue-800';
            case 'pedido': return 'bg-green-100 text-green-800';
            case 'soporte': return 'bg-red-100 text-red-800';
            case 'sugerencia': return 'bg-yellow-100 text-yellow-800';
            case 'reclamo': return 'bg-orange-100 text-orange-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // Manejar cambio de filtros
    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Aplicar filtros
    const applyFilters = () => {
        loadMessages(1);
    };

    // Limpiar filtros
    const clearFilters = () => {
        setFilters({
            estado: '',
            tipoConsulta: '',
            fechaDesde: '',
            fechaHasta: ''
        });
        loadMessages(1);
    };

    if (!isAuthenticated || user?.role !== 'admin') {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Gestión de Mensajes de Contacto</h1>
                    <p className="mt-2 text-gray-600">
                        Administra y responde a los mensajes de contacto de los usuarios
                    </p>
                </div>

                {/* Filtros */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtros</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Estado
                            </label>
                            <select
                                value={filters.estado}
                                onChange={(e) => handleFilterChange('estado', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">Todos los estados</option>
                                <option value="nuevo">Nuevo</option>
                                <option value="en_proceso">En Proceso</option>
                                <option value="respondido">Respondido</option>
                                <option value="cerrado">Cerrado</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tipo de Consulta
                            </label>
                            <select
                                value={filters.tipoConsulta}
                                onChange={(e) => handleFilterChange('tipoConsulta', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">Todos los tipos</option>
                                <option value="general">General</option>
                                <option value="producto">Producto</option>
                                <option value="pedido">Pedido</option>
                                <option value="soporte">Soporte</option>
                                <option value="sugerencia">Sugerencia</option>
                                <option value="reclamo">Reclamo</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Fecha Desde
                            </label>
                            <input
                                type="date"
                                value={filters.fechaDesde}
                                onChange={(e) => handleFilterChange('fechaDesde', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Fecha Hasta
                            </label>
                            <input
                                type="date"
                                value={filters.fechaHasta}
                                onChange={(e) => handleFilterChange('fechaHasta', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                        <button
                            onClick={applyFilters}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            Aplicar Filtros
                        </button>
                        <button
                            onClick={clearFilters}
                            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                        >
                            Limpiar
                        </button>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-800">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Lista de mensajes */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Mensajes ({pagination.total})
                        </h2>
                    </div>

                    {loading ? (
                        <div className="p-6 text-center">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <p className="mt-2 text-gray-600">Cargando mensajes...</p>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="p-6 text-center">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m0 0V9a2 2 0 012-2h2m0 0V5a2 2 0 012-2h2m0 0V1m0 4h2m0 0V5" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay mensajes</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                No se encontraron mensajes con los filtros aplicados.
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {messages.map((message) => (
                                <div key={message._id} className="p-6 hover:bg-gray-50 cursor-pointer"
                                    onClick={() => {
                                        setSelectedMessage(message);
                                        setShowModal(true);
                                    }}>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-medium text-gray-900 truncate">
                                                    {message.nombre}
                                                </h3>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(message.estado)}`}>
                                                    {message.estado.replace('_', ' ')}
                                                </span>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(message.tipoConsulta)}`}>
                                                    {message.tipoConsulta}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-2">{message.email}</p>
                                            <p className="text-sm text-gray-900 mb-2">{message.asunto}</p>
                                            <p className="text-sm text-gray-500 line-clamp-2">{message.mensaje}</p>
                                        </div>
                                        <div className="ml-4 flex-shrink-0">
                                            <p className="text-sm text-gray-500">
                                                {formatDate(message.fechaCreacion)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Paginación */}
                    {pagination.pages > 1 && (
                        <div className="px-6 py-4 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    Mostrando {((pagination.page - 1) * pagination.limit) + 1} a {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} mensajes
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => loadMessages(pagination.page - 1)}
                                        disabled={pagination.page === 1}
                                        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Anterior
                                    </button>
                                    <span className="px-3 py-2 text-sm font-medium text-gray-700">
                                        Página {pagination.page} de {pagination.pages}
                                    </span>
                                    <button
                                        onClick={() => loadMessages(pagination.page + 1)}
                                        disabled={pagination.page === pagination.pages}
                                        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Siguiente
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de detalles */}
            {showModal && selectedMessage && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            {/* Header del modal */}
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Detalles del Mensaje
                                </h3>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Contenido del modal */}
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Nombre</label>
                                        <p className="mt-1 text-sm text-gray-900">{selectedMessage.nombre}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Email</label>
                                        <p className="mt-1 text-sm text-gray-900">{selectedMessage.email}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                                        <p className="mt-1 text-sm text-gray-900">{selectedMessage.telefono || 'No proporcionado'}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Tipo de Consulta</label>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(selectedMessage.tipoConsulta)}`}>
                                            {selectedMessage.tipoConsulta}
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Asunto</label>
                                    <p className="mt-1 text-sm text-gray-900">{selectedMessage.asunto}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Mensaje</label>
                                    <div className="mt-1 p-3 bg-gray-50 rounded-md">
                                        <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedMessage.mensaje}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Fecha de Creación</label>
                                        <p className="mt-1 text-sm text-gray-900">{formatDate(selectedMessage.fechaCreacion)}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Estado Actual</label>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedMessage.estado)}`}>
                                            {selectedMessage.estado.replace('_', ' ')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Acciones del modal */}
                            <div className="mt-6 flex justify-between">
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => deleteMessage(selectedMessage._id)}
                                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                    >
                                        Eliminar
                                    </button>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => updateMessageStatus(selectedMessage._id, 'en_proceso')}
                                        className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
                                    >
                                        En Proceso
                                    </button>
                                    <button
                                        onClick={() => updateMessageStatus(selectedMessage._id, 'respondido')}
                                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                                    >
                                        Respondido
                                    </button>
                                    <button
                                        onClick={() => updateMessageStatus(selectedMessage._id, 'cerrado')}
                                        className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                                    >
                                        Cerrar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminContact;
