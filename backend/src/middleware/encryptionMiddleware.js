import encryptionService from '../services/encryptionService.js';

/**
 * Middleware de Cifrado para Modelos Mongoose
 * 
 * Automatiza el cifrado y descifrado de campos sensibles
 * en los modelos de la base de datos.
 */

/**
 * Middleware pre-save para cifrar campos sensibles antes de guardar
 * @param {Object} schema - Schema de Mongoose
 * @param {Object} options - Opciones de configuración
 * @param {string[]} options.encryptFields - Campos a cifrar
 */
export function addEncryptionMiddleware(schema, options = {}) {
    const { encryptFields = [] } = options;

    if (encryptFields.length === 0) {
        console.warn('⚠️  No se definieron campos para cifrar en el middleware');
        return;
    }

    // Middleware pre-save: cifrar antes de guardar
    schema.pre('save', function(next) {
        try {
            const doc = this;

            // Cifrar campos específicos si han sido modificados
            for (const fieldPath of encryptFields) {
                if (doc.isModified(fieldPath) || doc.isNew) {
                    const fieldValue = getNestedValue(doc, fieldPath);
                    
                    if (fieldValue !== undefined && fieldValue !== null && fieldValue !== '') {
                        if (!encryptionService.isEncrypted(fieldValue)) {
                            setNestedValue(doc, fieldPath, encryptionService.encrypt(String(fieldValue)));
                        }
                    }
                }
            }

            next();
        } catch (error) {
            console.error('Error en middleware de cifrado pre-save:', error);
            next(error);
        }
    });

    // Middleware post-save: descifrar después de guardar (opcional)
    schema.post('save', function(doc) {
        try {
            for (const fieldPath of encryptFields) {
                const fieldValue = getNestedValue(doc, fieldPath);
                
                if (fieldValue && encryptionService.isEncrypted(fieldValue)) {
                    setNestedValue(doc, fieldPath, encryptionService.decrypt(fieldValue));
                }
            }
        } catch (error) {
            console.error('Error en middleware de descifrado post-save:', error);
            // No lanzar error aquí para no romper el flujo
        }
    });

    // Middleware para queries: descifrar cuando se obtienen documentos
    schema.post(['find', 'findOne', 'findOneAndUpdate'], function(docs) {
        try {
            const documents = Array.isArray(docs) ? docs : [docs];
            
            documents.forEach(doc => {
                if (doc && typeof doc === 'object') {
                    for (const fieldPath of encryptFields) {
                        const fieldValue = getNestedValue(doc, fieldPath);
                        
                        if (fieldValue && encryptionService.isEncrypted(fieldValue)) {
                            setNestedValue(doc, fieldPath, encryptionService.decrypt(fieldValue));
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Error en middleware de descifrado para queries:', error);
            // No lanzar error aquí para no romper el flujo
        }
    });

    // Middleware para aggregate: descifrar en agregaciones
    schema.post('aggregate', function(res) {
        try {
            if (Array.isArray(res)) {
                res.forEach(doc => {
                    if (doc && typeof doc === 'object') {
                        for (const fieldPath of encryptFields) {
                            const fieldValue = getNestedValue(doc, fieldPath);
                            
                            if (fieldValue && encryptionService.isEncrypted(fieldValue)) {
                                setNestedValue(doc, fieldPath, encryptionService.decrypt(fieldValue));
                            }
                        }
                    }
                });
            }
        } catch (error) {
            console.error('Error en middleware de descifrado para aggregate:', error);
            // No lanzar error aquí para no romper el flujo
        }
    });
}

/**
 * Obtiene un valor anidado usando notación de punto
 * @param {Object} obj - Objeto
 * @param {string} path - Ruta del campo (ej: 'contactInfo.phone')
 * @returns {*} Valor del campo
 */
function getNestedValue(obj, path) {
    return path.split('.').reduce((current, prop) => {
        return current && current[prop] !== undefined ? current[prop] : undefined;
    }, obj);
}

/**
 * Establece un valor anidado usando notación de punto
 * @param {Object} obj - Objeto
 * @param {string} path - Ruta del campo
 * @param {*} value - Valor a establecer
 */
function setNestedValue(obj, path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    
    const target = keys.reduce((current, prop) => {
        if (!current[prop] || typeof current[prop] !== 'object') {
            current[prop] = {};
        }
        return current[prop];
    }, obj);
    
    target[lastKey] = value;
}

/**
 * Aplica cifrado solo a campos específicos de un objeto
 * @param {Object} obj - Objeto a procesar
 * @param {string[]} fieldsToEncrypt - Campos a cifrar
 * @returns {Object} Objeto con campos cifrados
 */
export function encryptSpecificFields(obj, fieldsToEncrypt) {
    if (!obj || typeof obj !== 'object') {
        return obj;
    }

    const result = JSON.parse(JSON.stringify(obj)); // Deep clone

    for (const fieldPath of fieldsToEncrypt) {
        const fieldValue = getNestedValue(result, fieldPath);
        
        if (fieldValue !== undefined && fieldValue !== null && fieldValue !== '') {
            if (!encryptionService.isEncrypted(fieldValue)) {
                setNestedValue(result, fieldPath, encryptionService.encrypt(String(fieldValue)));
            }
        }
    }

    return result;
}

/**
 * Descifra campos específicos de un objeto
 * @param {Object} obj - Objeto a procesar
 * @param {string[]} fieldsToDecrypt - Campos a descifrar
 * @returns {Object} Objeto con campos descifrados
 */
export function decryptSpecificFields(obj, fieldsToDecrypt) {
    if (!obj || typeof obj !== 'object') {
        return obj;
    }

    const result = JSON.parse(JSON.stringify(obj)); // Deep clone

    for (const fieldPath of fieldsToDecrypt) {
        const fieldValue = getNestedValue(result, fieldPath);
        
        if (fieldValue && encryptionService.isEncrypted(fieldValue)) {
            try {
                setNestedValue(result, fieldPath, encryptionService.decrypt(fieldValue));
            } catch (error) {
                console.error(`Error descifrando campo ${fieldPath}:`, error);
                // Mantener valor original si no se puede descifrar
            }
        }
    }

    return result;
}

/**
 * Crea un método en el schema para descifrar automáticamente
 * @param {Object} schema - Schema de Mongoose
 * @param {string[]} fieldsToDecrypt - Campos a descifrar
 */
export function addDecryptMethod(schema, fieldsToDecrypt = []) {
    schema.methods.decryptSensitiveFields = function() {
        return decryptSpecificFields(this.toObject(), fieldsToDecrypt);
    };

    schema.statics.decryptDocuments = function(documents, fieldsToDecrypt = []) {
        if (Array.isArray(documents)) {
            return documents.map(doc => decryptSpecificFields(doc.toObject?.() || doc, fieldsToDecrypt));
        }
        return decryptSpecificFields(documents.toObject?.() || documents, fieldsToDecrypt);
    };
}

export default {
    addEncryptionMiddleware,
    encryptSpecificFields,
    decryptSpecificFields,
    addDecryptMethod
};
