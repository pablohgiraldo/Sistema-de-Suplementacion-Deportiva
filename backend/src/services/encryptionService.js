import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Servicio de Cifrado para Datos Sensibles
 * 
 * Implementa cifrado AES-256-GCM para datos sensibles como:
 * - Información personal (nombres, emails, teléfonos)
 * - Direcciones completas
 * - Información de tarjetas de crédito
 * - Datos de contacto adicionales
 * 
 * Cumple con estándares GDPR y mejores prácticas de seguridad
 */

// Configuración de cifrado
const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits
const TAG_LENGTH = 16; // 128 bits
const SALT_LENGTH = 64; // Para PBKDF2

// Obtener clave de cifrado desde variables de entorno
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

if (!ENCRYPTION_KEY) {
    console.warn('⚠️  WARNING: ENCRYPTION_KEY no está definido en las variables de entorno');
    console.warn('⚠️  El cifrado de datos sensibles estará deshabilitado');
}

/**
 * Valida que la clave de cifrado esté disponible
 * @throws {Error} Si la clave no está definida
 */
function validateEncryptionKey() {
    if (!ENCRYPTION_KEY) {
        throw new Error('ENCRYPTION_KEY no está definido. No se puede cifrar/descifrar datos.');
    }
}

/**
 * Deriva una clave de cifrado desde la clave base usando PBKDF2
 * @param {string} salt - Salt para derivación
 * @returns {Buffer} Clave derivada
 */
function deriveKey(salt) {
    validateEncryptionKey();
    
    return crypto.pbkdf2Sync(
        ENCRYPTION_KEY,
        salt,
        100000, // 100,000 iteraciones (PBKDF2 recomendado)
        KEY_LENGTH,
        'sha512'
    );
}

/**
 * Genera un salt aleatorio
 * @returns {Buffer} Salt generado
 */
function generateSalt() {
    return crypto.randomBytes(SALT_LENGTH);
}

/**
 * Genera un IV (Initialization Vector) aleatorio
 * @returns {Buffer} IV generado
 */
function generateIV() {
    return crypto.randomBytes(IV_LENGTH);
}

/**
 * Cifra un texto plano usando AES-256-GCM
 * @param {string} plaintext - Texto a cifrar
 * @returns {string} Datos cifrados en formato base64 (salt + iv + tag + ciphertext)
 */
export function encrypt(plaintext) {
    if (!plaintext || plaintext === '') {
        return plaintext; // No cifrar strings vacíos o null
    }

    try {
        validateEncryptionKey();

        const salt = generateSalt();
        const iv = generateIV();
        const key = deriveKey(salt);
        
        const cipher = crypto.createCipherGCM(ENCRYPTION_ALGORITHM, key, iv);
        cipher.setAAD(Buffer.from('supergains-encryption', 'utf8')); // Additional Authenticated Data
        
        let ciphertext = cipher.update(plaintext, 'utf8');
        cipher.final();
        const tag = cipher.getAuthTag();
        
        // Concatenar: salt + iv + tag + ciphertext
        const encryptedData = Buffer.concat([salt, iv, tag, ciphertext]);
        
        return encryptedData.toString('base64');
    } catch (error) {
        console.error('Error cifrando datos:', error);
        throw new Error(`Error al cifrar datos sensibles: ${error.message}`);
    }
}

/**
 * Descifra datos cifrados usando AES-256-GCM
 * @param {string} encryptedData - Datos cifrados en base64
 * @returns {string} Texto plano descifrado
 */
export function decrypt(encryptedData) {
    if (!encryptedData || encryptedData === '') {
        return encryptedData; // No descifrar strings vacíos o null
    }

    try {
        validateEncryptionKey();

        const encryptedBuffer = Buffer.from(encryptedData, 'base64');
        
        // Extraer componentes: salt (64) + iv (16) + tag (16) + ciphertext
        const salt = encryptedBuffer.subarray(0, SALT_LENGTH);
        const iv = encryptedBuffer.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
        const tag = encryptedBuffer.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
        const ciphertext = encryptedBuffer.subarray(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
        
        const key = deriveKey(salt);
        
        const decipher = crypto.createDecipherGCM(ENCRYPTION_ALGORITHM, key, iv);
        decipher.setAAD(Buffer.from('supergains-encryption', 'utf8'));
        decipher.setAuthTag(tag);
        
        let plaintext = decipher.update(ciphertext);
        decipher.final();
        
        return plaintext.toString('utf8');
    } catch (error) {
        console.error('Error descifrando datos:', error);
        throw new Error(`Error al descifrar datos sensibles: ${error.message}`);
    }
}

/**
 * Cifra un objeto completo, aplicando cifrado solo a campos específicos
 * @param {Object} obj - Objeto a cifrar
 * @param {string[]} fieldsToEncrypt - Array de nombres de campos a cifrar
 * @returns {Object} Objeto con campos sensibles cifrados
 */
export function encryptObject(obj, fieldsToEncrypt = []) {
    if (!obj || typeof obj !== 'object') {
        return obj;
    }

    const result = { ...obj };

    for (const field of fieldsToEncrypt) {
        if (result[field] !== undefined && result[field] !== null && result[field] !== '') {
            try {
                result[field] = encrypt(String(result[field]));
            } catch (error) {
                console.error(`Error cifrando campo ${field}:`, error);
                // En caso de error, mantener el valor original para no romper la aplicación
                // pero logear el error para debugging
            }
        }
    }

    return result;
}

/**
 * Descifra un objeto completo, aplicando descifrado solo a campos específicos
 * @param {Object} obj - Objeto a descifrar
 * @param {string[]} fieldsToDecrypt - Array de nombres de campos a descifrar
 * @returns {Object} Objeto con campos sensibles descifrados
 */
export function decryptObject(obj, fieldsToDecrypt = []) {
    if (!obj || typeof obj !== 'object') {
        return obj;
    }

    const result = { ...obj };

    for (const field of fieldsToDecrypt) {
        if (result[field] !== undefined && result[field] !== null && result[field] !== '') {
            try {
                result[field] = decrypt(String(result[field]));
            } catch (error) {
                console.error(`Error descifrando campo ${field}:`, error);
                // Si no se puede descifrar, puede ser que no esté cifrado (datos antiguos)
                // Mantener el valor original
            }
        }
    }

    return result;
}

/**
 * Valida si un string está cifrado (heurística simple)
 * @param {string} str - String a validar
 * @returns {boolean} True si parece estar cifrado
 */
export function isEncrypted(str) {
    if (!str || typeof str !== 'string') {
        return false;
    }

    // Los datos cifrados están en base64 y tienen una longitud mínima
    // (salt + iv + tag + mínimo ciphertext = 64 + 16 + 16 + 4 = ~100 chars)
    const base64Regex = /^[A-Za-z0-9+/]+=*$/;
    return base64Regex.test(str) && str.length > 100;
}

/**
 * Hashea datos sensibles para búsquedas (opcional, para casos específicos)
 * @param {string} data - Datos a hashear
 * @returns {string} Hash SHA-256 en hex
 */
export function hashForSearch(data) {
    if (!data) return '';
    
    return crypto.createHash('sha256')
        .update(data.toLowerCase().trim())
        .digest('hex');
}

/**
 * Genera una nueva clave de cifrado (para setup inicial)
 * @returns {string} Clave base64 generada
 */
export function generateEncryptionKey() {
    const key = crypto.randomBytes(KEY_LENGTH);
    return key.toString('base64');
}

/**
 * Configuración de campos sensibles por modelo
 */
export const SENSITIVE_FIELDS = {
    User: [
        'nombre',
        'email' // El email se puede dejar sin cifrar para búsquedas, pero se puede cifrar también
    ],
    Customer: [
        'contactInfo.phone',
        'contactInfo.alternativeEmail',
        'contactInfo.address.street',
        'contactInfo.address.city',
        'contactInfo.address.state',
        'contactInfo.address.zipCode',
        'birthDate',
        'notes'
    ],
    Order: [
        'shippingAddress.firstName',
        'shippingAddress.lastName',
        'shippingAddress.street',
        'shippingAddress.city',
        'shippingAddress.state',
        'shippingAddress.zipCode',
        'shippingAddress.phone',
        'billingAddress.firstName',
        'billingAddress.lastName',
        'billingAddress.street',
        'billingAddress.city',
        'billingAddress.state',
        'billingAddress.zipCode',
        'billingAddress.phone',
        'paymentDetails.cardLastFour',
        'paymentDetails.transactionId'
    ]
};

export default {
    encrypt,
    decrypt,
    encryptObject,
    decryptObject,
    isEncrypted,
    hashForSearch,
    generateEncryptionKey,
    SENSITIVE_FIELDS,
    
    // Validaciones
    validateEncryptionKey
};
