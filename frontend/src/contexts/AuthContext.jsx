import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Verificar si hay un usuario logueado al cargar la app
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('accessToken');
            const userData = localStorage.getItem('user');

            if (token && userData) {
                try {
                    // Verificar si el token sigue siendo válido
                    const response = await api.get('/users/token-status', {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    if (response.data.success) {
                        setUser(JSON.parse(userData));
                        setIsAuthenticated(true);
                    } else {
                        // Token inválido, limpiar localStorage
                        logout();
                    }
                } catch (error) {
                    // Error al verificar token, limpiar localStorage
                    logout();
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    const login = async (email, contraseña) => {
        try {
            const response = await api.post('/users/login', { email, contraseña });

            if (response.data.success) {
                const { user: userData, tokens } = response.data.data;

                // Guardar en localStorage
                localStorage.setItem('accessToken', tokens.accessToken);
                localStorage.setItem('refreshToken', tokens.refreshToken);
                localStorage.setItem('user', JSON.stringify(userData));

                // Actualizar estado
                setUser(userData);
                setIsAuthenticated(true);

                return { success: true };
            }
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Error al iniciar sesión'
            };
        }
    };

    const register = async (userData) => {
        try {
            const response = await api.post('/users/register', userData);

            if (response.data.success) {
                return { success: true };
            }
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Error al registrar usuario',
                details: error.response?.data?.details || []
            };
        }
    };

    const logout = async () => {
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
                await api.post('/users/logout', { refreshToken });
            }
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        } finally {
            // Limpiar localStorage y estado
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            setUser(null);
            setIsAuthenticated(false);
        }
    };

    const refreshToken = async () => {
        try {
            const refreshTokenValue = localStorage.getItem('refreshToken');
            if (!refreshTokenValue) {
                throw new Error('No hay refresh token');
            }

            const response = await api.post('/users/refresh', {
                refreshToken: refreshTokenValue
            });

            if (response.data.success) {
                localStorage.setItem('accessToken', response.data.data.accessToken);
                return { success: true };
            }
        } catch (error) {
            // Si el refresh falla, hacer logout
            logout();
            return { success: false };
        }
    };

    const value = {
        user,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
        refreshToken
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
