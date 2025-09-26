import axios from "axios";
import { getAccessToken, getRefreshToken, saveAccessToken, clearAuthData } from '../utils/tokenUtils';

const api = axios.create({
  baseURL: "https://supergains-backend.onrender.com/api",
  timeout: 15000, // 15 segundos de timeout para operaciones complejas
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
          const response = await axios.post(
            "https://supergains-backend.onrender.com/api/users/refresh",
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
    } else if (error.request) {
      console.error('Error de red:', error.request);
    } else {
      console.error('Error:', error.message);
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
