import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { saveAuthData, clearAuthData, getAuthData } from '../utils/tokenUtils';

// Contexto de Autenticación
export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Cargar datos de autenticación desde localStorage
    const authData = getAuthData();
    if (authData.user && authData.accessToken) {
      setUser(authData.user);
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/users/login', {
        email,
        contraseña: password
      });

      if (response.data.success) {
        const { user, tokens } = response.data.data;
        const { accessToken, refreshToken } = tokens;

        // Guardar datos de autenticación
        saveAuthData({ accessToken, refreshToken, user });

        setUser(user);
        setIsAuthenticated(true);

        return { success: true };
      } else {
        return { success: false, error: response.data.message || 'Error al iniciar sesión' };
      }
    } catch (error) {
      console.error('Error en login:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error al iniciar sesión'
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/users/register', {
        nombre: userData.nombre,
        email: userData.email,
        contraseña: userData.contraseña,
        rol: userData.rol || 'usuario'
      });

      if (response.data.success) {
        const { user, tokens } = response.data.data;
        const { accessToken, refreshToken } = tokens;

        // Guardar datos de autenticación
        saveAuthData({ accessToken, refreshToken, user });

        setUser(user);
        setIsAuthenticated(true);

        return { success: true };
      } else {
        return { success: false, error: response.data.message || 'Error al registrar usuario' };
      }
    } catch (error) {
      console.error('Error en registro:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error al registrar usuario'
      };
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    clearAuthData();
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
