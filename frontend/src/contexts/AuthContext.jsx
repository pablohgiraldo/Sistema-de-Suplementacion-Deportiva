import { useState, useEffect } from 'react';
import api from '../services/api';
import {
    saveAuthData,
    clearAuthData,
    getAuthData,
    hasValidTokens,
    getRefreshToken,
    saveAccessToken
} from '../utils/tokenUtils';
import { AuthContext } from './AuthContext.js';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Verificar si hay tokens válidos al cargar la aplicación
    useEffect(() => {
        const checkAuth = async () => {
            try {
                if (hasValidTokens()) {
                    // Verificar si el token sigue siendo válido
                    const response = await api.get('/users/token-status');

                    if (response.data.success) {
                        const authData = getAuthData();
                        setUser(authData.user);
                        setIsAuthenticated(true);
                    } else {
                        // Token inválido, limpiar localStorage
                        clearAuthData();
                    }
                }
            } catch (error) {
                console.error('Error checking auth:', error);
                // Error al verificar token, limpiar localStorage
                clearAuthData();
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    const login = async (email, contraseña) => {
        try {
            const response = await api.post('/users/login', { email, contraseña });

            if (response.data.success) {
                const { user: userData, tokens } = response.data.data;

                // Guardar en localStorage usando utilidades
                saveAuthData({
                    accessToken: tokens.accessToken,
                    refreshToken: tokens.refreshToken,
                    user: userData
                });

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
            const refreshToken = getRefreshToken();
            if (refreshToken) {
                await api.post('/users/logout', { refreshToken });
            }
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        } finally {
            // Limpiar localStorage y estado usando utilidades
            clearAuthData();
            setUser(null);
            setIsAuthenticated(false);
        }
    };

    const refreshToken = async () => {
        try {
            const refreshTokenValue = getRefreshToken();
            if (!refreshTokenValue) {
                throw new Error('No hay refresh token');
            }

            const response = await api.post('/users/refresh', {
                refreshToken: refreshTokenValue
            });

            if (response.data.success) {
                saveAccessToken(response.data.data.accessToken);
                return { success: true };
            }
        } catch {
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
