import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import useNotifications from '../hooks/useNotifications';

const Users = () => {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [rolFilter, setRolFilter] = useState('');
    const [activoFilter, setActivoFilter] = useState('');
    const queryClient = useQueryClient();
    const { showSuccess, showError } = useNotifications();

    // Fetch users
    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: ['users', page, search, rolFilter, activoFilter],
        queryFn: async () => {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '10'
            });

            if (search) params.append('search', search);
            if (rolFilter) params.append('rol', rolFilter);
            if (activoFilter) params.append('activo', activoFilter);

            const response = await api.get(`/users?${params.toString()}`);
            return response.data;
        }
    });

    // Mutation para bloquear/desbloquear usuario
    const blockMutation = useMutation({
        mutationFn: async ({ userId, activo }) => {
            const response = await api.put(`/users/${userId}/block`, { activo });
            return response.data;
        },
        onSuccess: (data) => {
            showSuccess(data.message);
            queryClient.invalidateQueries(['users']);
        },
        onError: (error) => {
            showError(error.response?.data?.message || 'Error al actualizar usuario');
        }
    });

    // Mutation para cambiar rol
    const roleMutation = useMutation({
        mutationFn: async ({ userId, rol }) => {
            const response = await api.put(`/users/${userId}/role`, { rol });
            return response.data;
        },
        onSuccess: (data) => {
            showSuccess(data.message);
            queryClient.invalidateQueries(['users']);
        },
        onError: (error) => {
            showError(error.response?.data?.message || 'Error al cambiar rol');
        }
    });

    const handleToggleBlock = (userId, currentStatus) => {
        if (confirm(`¿Estás seguro de que quieres ${currentStatus ? 'bloquear' : 'desbloquear'} este usuario?`)) {
            blockMutation.mutate({ userId, activo: !currentStatus });
        }
    };

    const handleChangeRole = (userId, currentRole) => {
        const newRole = currentRole === 'admin' ? 'usuario' : 'admin';
        if (confirm(`¿Estás seguro de que quieres cambiar el rol a ${newRole}?`)) {
            roleMutation.mutate({ userId, rol: newRole });
        }
    };

    if (isLoading) {
        return <LoadingSpinner text="Cargando usuarios..." />;
    }

    if (isError) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 mb-4">Error: {error.message}</p>
                    <button
                        onClick={() => refetch()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    const users = data?.data || [];
    const pagination = data?.pagination || { total: 0, page: 1, totalPages: 1 };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
                    <p className="mt-2 text-gray-600">
                        Administra usuarios, roles y permisos del sistema
                    </p>
                </div>

                {/* Filtros y búsqueda */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Búsqueda */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Buscar usuario
                            </label>
                            <input
                                type="text"
                                placeholder="Nombre o email..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPage(1);
                                }}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Filtro por rol */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Rol
                            </label>
                            <select
                                value={rolFilter}
                                onChange={(e) => {
                                    setRolFilter(e.target.value);
                                    setPage(1);
                                }}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Todos</option>
                                <option value="admin">Administrador</option>
                                <option value="usuario">Usuario</option>
                                <option value="moderador">Moderador</option>
                            </select>
                        </div>

                        {/* Filtro por estado */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Estado
                            </label>
                            <select
                                value={activoFilter}
                                onChange={(e) => {
                                    setActivoFilter(e.target.value);
                                    setPage(1);
                                }}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Todos</option>
                                <option value="true">Activos</option>
                                <option value="false">Bloqueados</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Estadísticas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Total Usuarios</p>
                                <p className="text-2xl font-semibold text-gray-900">{pagination.total}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="p-3 bg-green-100 rounded-lg">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Usuarios Activos</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {users.filter(u => u.activo).length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Administradores</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {users.filter(u => u.rol === 'admin').length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabla de usuarios */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Usuario
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Rol
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Estado
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Fecha de Registro
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {users.length > 0 ? (
                                    users.map((user) => (
                                        <tr key={user._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                            <span className="text-blue-600 font-medium">
                                                                {user.nombre.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {user.nombre}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{user.email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin'
                                                    ? 'bg-purple-100 text-purple-800'
                                                    : user.role === 'moderador'
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {user.role === 'admin' ? 'Administrador' : user.role === 'moderador' ? 'Moderador' : 'Usuario'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.activo
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {user.activo ? 'Activo' : 'Bloqueado'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(user.fechaCreacion || user.createdAt).toLocaleDateString('es-ES')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end space-x-2">
                                                    {/* Botón cambiar rol */}
                                                    <button
                                                        onClick={() => handleChangeRole(user._id, user.role)}
                                                        disabled={roleMutation.isPending}
                                                        className="inline-flex items-center px-3 py-1.5 border border-blue-300 text-xs font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                        title={user.role === 'admin' ? 'Cambiar a usuario' : 'Cambiar a admin'}
                                                    >
                                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                                        </svg>
                                                        Cambiar Rol
                                                    </button>

                                                    {/* Botón bloquear/desbloquear */}
                                                    <button
                                                        onClick={() => handleToggleBlock(user._id, user.activo)}
                                                        disabled={blockMutation.isPending}
                                                        className={`inline-flex items-center px-3 py-1.5 border text-xs font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${user.activo
                                                            ? 'border-red-300 text-red-700 bg-red-50 hover:bg-red-100 focus:ring-red-500'
                                                            : 'border-green-300 text-green-700 bg-green-50 hover:bg-green-100 focus:ring-green-500'
                                                            }`}
                                                        title={user.activo ? 'Bloquear usuario' : 'Desbloquear usuario'}
                                                    >
                                                        {user.activo ? (
                                                            <>
                                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                                </svg>
                                                                Bloquear
                                                            </>
                                                        ) : (
                                                            <>
                                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                                                                </svg>
                                                                Activar
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                            No se encontraron usuarios
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Paginación */}
                    {pagination.totalPages > 1 && (
                        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                            <div className="flex-1 flex justify-between sm:hidden">
                                <button
                                    onClick={() => setPage(Math.max(1, page - 1))}
                                    disabled={page === 1}
                                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Anterior
                                </button>
                                <button
                                    onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
                                    disabled={page === pagination.totalPages}
                                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Siguiente
                                </button>
                            </div>
                            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-700">
                                        Mostrando{' '}
                                        <span className="font-medium">{(page - 1) * 10 + 1}</span>
                                        {' '}-{' '}
                                        <span className="font-medium">
                                            {Math.min(page * 10, pagination.total)}
                                        </span>
                                        {' '}de{' '}
                                        <span className="font-medium">{pagination.total}</span>
                                        {' '}usuarios
                                    </p>
                                </div>
                                <div>
                                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                        <button
                                            onClick={() => setPage(Math.max(1, page - 1))}
                                            disabled={page === 1}
                                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                        >
                                            <span className="sr-only">Anterior</span>
                                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </button>

                                        {[...Array(pagination.totalPages)].map((_, i) => (
                                            <button
                                                key={i + 1}
                                                onClick={() => setPage(i + 1)}
                                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${page === i + 1
                                                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}

                                        <button
                                            onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
                                            disabled={page === pagination.totalPages}
                                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                        >
                                            <span className="sr-only">Siguiente</span>
                                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Users;
