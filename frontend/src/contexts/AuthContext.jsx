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
    console.log('AuthContext - Datos del localStorage:', authData);
    if (authData.user && authData.accessToken) {
      console.log('AuthContext - Usuario del localStorage:', authData.user);
      console.log('AuthContext - Role del localStorage:', authData.user.role);
      // Verificar si el token sigue siendo válido
      validateToken(authData.accessToken, authData.user);
    } else {
      console.log('AuthContext - No hay datos de autenticación en localStorage');
      setIsLoading(false);
    }
  }, []);

  const validateToken = async (token, userData) => {
    try {
      // Hacer una petición simple para verificar si el token es válido
      const response = await api.get('/users/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        // Usar la información actualizada del servidor, no la del localStorage
        console.log('Usuario actualizado del servidor:', response.data.data.usuario);
        console.log('Role del usuario:', response.data.data.usuario.role);
        console.log('¿Es admin?:', response.data.data.usuario.role === 'admin');
        setUser(response.data.data.usuario);
        setIsAuthenticated(true);
      } else {
        // Token inválido, limpiar datos
        clearAuthData();
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.log('Token expirado o inválido, limpiando sesión');
      // Token expirado o inválido, limpiar datos
      clearAuthData();
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

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
        error: error.userMessage || error.response?.data?.message || 'Error al iniciar sesión'
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
        error: error.userMessage || error.response?.data?.message || 'Error al registrar usuario'
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
