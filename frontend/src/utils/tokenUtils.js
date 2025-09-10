// Utilidades para manejo de tokens JWT en localStorage

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'user';

/**
 * Guarda el access token en localStorage
 * @param {string} token - El access token JWT
 */
export const saveAccessToken = (token) => {
    try {
        localStorage.setItem(ACCESS_TOKEN_KEY, token);
    } catch (error) {
        console.error('Error guardando access token:', error);
    }
};

/**
 * Guarda el refresh token en localStorage
 * @param {string} token - El refresh token JWT
 */
export const saveRefreshToken = (token) => {
    try {
        localStorage.setItem(REFRESH_TOKEN_KEY, token);
    } catch (error) {
        console.error('Error guardando refresh token:', error);
    }
};

/**
 * Guarda los datos del usuario en localStorage
 * @param {object} user - Los datos del usuario
 */
export const saveUser = (user) => {
    try {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (error) {
        console.error('Error guardando datos del usuario:', error);
    }
};

/**
 * Obtiene el access token del localStorage
 * @returns {string|null} - El access token o null si no existe
 */
export const getAccessToken = () => {
    try {
        return localStorage.getItem(ACCESS_TOKEN_KEY);
    } catch (error) {
        console.error('Error obteniendo access token:', error);
        return null;
    }
};

/**
 * Obtiene el refresh token del localStorage
 * @returns {string|null} - El refresh token o null si no existe
 */
export const getRefreshToken = () => {
    try {
        return localStorage.getItem(REFRESH_TOKEN_KEY);
    } catch (error) {
        console.error('Error obteniendo refresh token:', error);
        return null;
    }
};

/**
 * Obtiene los datos del usuario del localStorage
 * @returns {object|null} - Los datos del usuario o null si no existen
 */
export const getUser = () => {
    try {
        const user = localStorage.getItem(USER_KEY);
        return user ? JSON.parse(user) : null;
    } catch (error) {
        console.error('Error obteniendo datos del usuario:', error);
        return null;
    }
};

/**
 * Guarda todos los tokens y datos del usuario
 * @param {object} authData - Objeto con accessToken, refreshToken y user
 */
export const saveAuthData = (authData) => {
    const { accessToken, refreshToken, user } = authData;

    if (accessToken) saveAccessToken(accessToken);
    if (refreshToken) saveRefreshToken(refreshToken);
    if (user) saveUser(user);
};

/**
 * Limpia todos los tokens y datos del usuario del localStorage
 */
export const clearAuthData = () => {
    try {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    } catch (error) {
        console.error('Error limpiando datos de autenticación:', error);
    }
};

/**
 * Verifica si hay tokens válidos en localStorage
 * @returns {boolean} - true si hay tokens, false si no
 */
export const hasValidTokens = () => {
    const accessToken = getAccessToken();
    const refreshToken = getRefreshToken();
    return !!(accessToken && refreshToken);
};

/**
 * Obtiene todos los datos de autenticación del localStorage
 * @returns {object} - Objeto con accessToken, refreshToken y user
 */
export const getAuthData = () => {
    return {
        accessToken: getAccessToken(),
        refreshToken: getRefreshToken(),
        user: getUser()
    };
};
