import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL + "/api",
  timeout: 10000, // 10 segundos de timeout
});

// Interceptor para respuestas exitosas
api.interceptors.response.use(
  (response) => {
    // Verificar que la respuesta tenga la estructura esperada
    if (response.data && typeof response.data === 'object') {
      return response;
    }
    return response;
  },
  (error) => {
    // Manejar errores de red y del servidor
    if (error.response) {
      // El servidor respondió con un código de estado de error
      console.error('Error del servidor:', error.response.status, error.response.data);
    } else if (error.request) {
      // La petición fue hecha pero no se recibió respuesta
      console.error('Error de red:', error.request);
    } else {
      // Algo más causó el error
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
