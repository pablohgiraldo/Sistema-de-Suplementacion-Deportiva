import { createContext, useContext, useState, useEffect } from 'react';

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
    // Verificar si hay un usuario guardado en localStorage
    const savedUser = localStorage.getItem('supergains_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Usuario mock para desarrollo
      const mockUser = {
        id: '1',
        email: email,
        firstName: 'Usuario',
        lastName: 'SuperGains',
        avatar: '👤'
      };

      setUser(mockUser);
      setIsAuthenticated(true);
      localStorage.setItem('supergains_user', JSON.stringify(mockUser));

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Error al iniciar sesión' };
    }
  };

  const register = async (userData) => {
    try {
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Usuario mock para desarrollo
      const mockUser = {
        id: '1',
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        avatar: '👤'
      };

      setUser(mockUser);
      setIsAuthenticated(true);
      localStorage.setItem('supergains_user', JSON.stringify(mockUser));

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Error al crear la cuenta' };
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('supergains_user');
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
