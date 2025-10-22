import axios from "axios";
import { getAccessToken, getRefreshToken, saveAccessToken, clearAuthData } from '../utils/tokenUtils';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
  timeout: 30000 // Aumentar timeout a 30 segundos, // 15 segundos de timeout para operaciones complejas
});

// Interceptor para requests - agregar token automáticamente
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('Making request to:', config.baseURL + config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para respuestas
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Si el error es 401 y no es un retry, intentar refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshTokenValue = getRefreshToken();
        if (refreshTokenValue) {
          const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
          const response = await axios.post(
            `${apiUrl}/users/refresh`,
            { refreshToken: refreshTokenValue }
          );

          if (response.data.success) {
            saveAccessToken(response.data.data.accessToken);
            originalRequest.headers.Authorization = `Bearer ${response.data.data.accessToken}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        console.log('Refresh token falló, limpiando sesión');
        // Si el refresh falla, limpiar localStorage
        clearAuthData();
        // No redirigir automáticamente, dejar que el componente maneje el estado
        return Promise.reject(refreshError);
      }
    }

    // Manejar otros errores
    if (error.response) {
      console.error('Error del servidor:', error.response.status, error.response.data);

      // Manejar error 429 (Rate Limiting) específicamente
      if (error.response.status === 429) {
        const retryAfter = error.response.headers['retry-after'];
        const message = retryAfter
          ? `Demasiados intentos. Intenta de nuevo en ${retryAfter} segundos.`
          : 'Demasiados intentos. Por favor espera un momento antes de intentar de nuevo.';

        error.userMessage = message;
      }
    } else if (error.request) {
      console.error('Error de red:', error.request);
      error.userMessage = 'Error de conexión. Verifica tu conexión a internet.';
    } else {
      console.error('Error:', error.message);
      error.userMessage = 'Error inesperado. Intenta de nuevo.';
    }

    return Promise.reject(error);
  }
);

console.log('API Base URL:', import.meta.env.VITE_API_URL || "http://localhost:4000/api");
console.log('Environment variables:', {
  VITE_API_URL: import.meta.env.VITE_API_URL,
  NODE_ENV: import.meta.env.NODE_ENV,
  MODE: import.meta.env.MODE
});

export default api;
