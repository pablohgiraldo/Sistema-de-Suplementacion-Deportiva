/**
 * Pruebas unitarias para encryptionService.js
 * Enfoque en funcionalidades de cifrado AES-256-GCM y manejo de datos sensibles
 */

import { encrypt, decrypt, encryptObject, decryptObject } from '../../src/services/encryptionService.js';
import crypto from 'crypto';

// Mock del módulo crypto
jest.mock('crypto');

describe('Encryption Service', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        jest.clearAllMocks();
        
        // Mock de variables de entorno
        process.env = {
            ...originalEnv,
            ENCRYPTION_KEY: 'test-encryption-key-base64-32-bytes-long===' // Clave de prueba base64
        };

        // Mock de crypto.randomBytes
        crypto.randomBytes.mockImplementation((size) => {
            return Buffer.alloc(size, 'a'); // Buffer con 'a' repetido
        });

        // Mock de crypto.pbkdf2Sync
        crypto.pbkdf2Sync.mockImplementation((password, salt, iterations, keylen, digest) => {
            return Buffer.alloc(keylen, 'b'); // Buffer con 'b' repetido
        });

        // Mock de crypto.createHash
        const mockHash = {
            update: jest.fn().mockReturnThis(),
            digest: jest.fn().mockReturnValue('mocked-hash')
        };
        crypto.createHash.mockReturnValue(mockHash);

        // Mock de createCipherGCM y createDecipherGCM
        const mockCipher = {
            setAAD: jest.fn(),
            update: jest.fn().mockReturnValue(Buffer.from('encrypted-data')),
            final: jest.fn(),
            getAuthTag: jest.fn().mockReturnValue(Buffer.from('auth-tag'))
        };

        const mockDecipher = {
            setAAD: jest.fn(),
            setAuthTag: jest.fn(),
            update: jest.fn().mockReturnValue(Buffer.from('decrypted-data')),
            final: jest.fn()
        };

        crypto.createCipherGCM = jest.fn().mockReturnValue(mockCipher);
        crypto.createDecipherGCM = jest.fn().mockReturnValue(mockDecipher);
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    describe('encrypt', () => {
        it('debería cifrar datos correctamente', () => {
            // Arrange
            const plaintext = 'datos sensibles del usuario';
            
            // Act
            const result = encrypt(plaintext);

            // Assert
            expect(result).toBeDefined();
            expect(result).not.toBe(plaintext);
            expect(typeof result).toBe('string');
            expect(crypto.randomBytes).toHaveBeenCalledWith(64); // SALT_LENGTH
            expect(crypto.randomBytes).toHaveBeenCalledWith(16); // IV_LENGTH
            expect(crypto.createCipherGCM).toHaveBeenCalled();
        });

        it('debería retornar string vacío sin cifrar', () => {
            // Arrange
            const emptyString = '';

            // Act
            const result = encrypt(emptyString);

            // Assert
            expect(result).toBe('');
        });

        it('debería retornar null sin cifrar', () => {
            // Arrange
            const nullValue = null;

            // Act
            const result = encrypt(nullValue);

            // Assert
            expect(result).toBeNull();
        });

        it('debería lanzar error si falta ENCRYPTION_KEY', () => {
            // Arrange
            delete process.env.ENCRYPTION_KEY;
            const plaintext = 'datos de prueba';

            // Act & Assert
            expect(() => encrypt(plaintext)).toThrow('ENCRYPTION_KEY no está definido');
        });

        it('debería manejar errores de cifrado', () => {
            // Arrange
            const plaintext = 'datos de prueba';
            crypto.createCipherGCM.mockImplementation(() => {
                throw new Error('Cipher error');
            });

            // Act & Assert
            expect(() => encrypt(plaintext)).toThrow('Error al cifrar datos sensibles');
        });
    });

    describe('decrypt', () => {
        it('debería descifrar datos correctamente', () => {
            // Arrange
            const encryptedData = 'base64-encoded-encrypted-data';

            // Mock del buffer de datos cifrados
            jest.spyOn(Buffer, 'from').mockImplementation((data, encoding) => {
                if (encoding === 'base64') {
                    // Simular buffer con salt + iv + tag + ciphertext
                    const salt = Buffer.alloc(64, 'a');
                    const iv = Buffer.alloc(16, 'b');
                    const tag = Buffer.alloc(16, 'c');
                    const ciphertext = Buffer.from('encrypted-data');
                    return Buffer.concat([salt, iv, tag, ciphertext]);
                }
                return Buffer.from(data);
            });

            // Act
            const result = decrypt(encryptedData);

            // Assert
            expect(result).toBeDefined();
            expect(typeof result).toBe('string');
            expect(crypto.createDecipherGCM).toHaveBeenCalled();
        });

        it('debería retornar string vacío sin descifrar', () => {
            // Arrange
            const emptyString = '';

            // Act
            const result = decrypt(emptyString);

            // Assert
            expect(result).toBe('');
        });

        it('debería retornar null sin descifrar', () => {
            // Arrange
            const nullValue = null;

            // Act
            const result = decrypt(nullValue);

            // Assert
            expect(result).toBeNull();
        });

        it('debería lanzar error si falta ENCRYPTION_KEY', () => {
            // Arrange
            delete process.env.ENCRYPTION_KEY;
            const encryptedData = 'encrypted-data';

            // Act & Assert
            expect(() => decrypt(encryptedData)).toThrow('ENCRYPTION_KEY no está definido');
        });

        it('debería manejar errores de descifrado', () => {
            // Arrange
            const encryptedData = 'invalid-base64';
            
            // Mock para que falle la creación del buffer base64
            jest.spyOn(Buffer, 'from').mockImplementation(() => {
                throw new Error('Invalid base64');
            });

            // Act & Assert
            expect(() => decrypt(encryptedData)).toThrow('Error al descifrar datos sensibles');
        });
    });

    describe('encryptObject', () => {
        it('debería cifrar campos específicos de un objeto', () => {
            // Arrange
            const obj = {
                nombre: 'Juan Pérez',
                email: 'juan@test.com',
                telefono: '+57 300 123 4567'
            };
            const fieldsToEncrypt = ['nombre', 'telefono'];

            // Act
            const result = encryptObject(obj, fieldsToEncrypt);

            // Assert
            expect(result).toBeDefined();
            expect(result.email).toBe(obj.email); // No cifrado
            expect(result.nombre).not.toBe(obj.nombre); // Cifrado
            expect(result.telefono).not.toBe(obj.telefono); // Cifrado
        });

        it('debería manejar campos anidados', () => {
            // Arrange
            const obj = {
                user: {
                    profile: {
                        nombre: 'María García'
                    },
                    contact: {
                        telefono: '+57 301 987 6543'
                    }
                },
                email: 'maria@test.com'
            };
            const fieldsToEncrypt = ['user.profile.nombre', 'user.contact.telefono'];

            // Act
            const result = encryptObject(obj, fieldsToEncrypt);

            // Assert
            expect(result.user.profile.nombre).not.toBe(obj.user.profile.nombre);
            expect(result.user.contact.telefono).not.toBe(obj.user.contact.telefono);
            expect(result.email).toBe(obj.email);
        });

        it('debería retornar null si el objeto es null', () => {
            // Arrange
            const obj = null;
            const fieldsToEncrypt = ['nombre'];

            // Act
            const result = encryptObject(obj, fieldsToEncrypt);

            // Assert
            expect(result).toBeNull();
        });

        it('debería manejar objeto vacío', () => {
            // Arrange
            const obj = {};
            const fieldsToEncrypt = ['nombre'];

            // Act
            const result = encryptObject(obj, fieldsToEncrypt);

            // Assert
            expect(result).toEqual({});
        });
    });

    describe('decryptObject', () => {
        it('debería descifrar campos específicos de un objeto', () => {
            // Arrange
            const encryptedObj = {
                nombre: 'encrypted-nombre-value',
                email: 'test@test.com',
                telefono: 'encrypted-telefono-value'
            };
            const fieldsToDecrypt = ['nombre', 'telefono'];

            // Mock decrypt para devolver valores "descifrados"
            jest.spyOn(require('../../src/services/encryptionService.js'), 'decrypt')
                .mockImplementation((encryptedValue) => {
                    if (encryptedValue === 'encrypted-nombre-value') return 'Juan Pérez';
                    if (encryptedValue === 'encrypted-telefono-value') return '+57 300 123 4567';
                    return encryptedValue;
                });

            // Act
            const result = decryptObject(encryptedObj, fieldsToDecrypt);

            // Assert
            expect(result.nombre).toBe('Juan Pérez');
            expect(result.telefono).toBe('+57 300 123 4567');
            expect(result.email).toBe('test@test.com');
        });

        it('debería manejar campos anidados en descifrado', () => {
            // Arrange
            const encryptedObj = {
                user: {
                    profile: {
                        nombre: 'encrypted-nombre'
                    },
                    contact: {
                        telefono: 'encrypted-telefono'
                    }
                }
            };
            const fieldsToDecrypt = ['user.profile.nombre', 'user.contact.telefono'];

            // Mock decrypt
            jest.spyOn(require('../../src/services/encryptionService.js'), 'decrypt')
                .mockImplementation((encryptedValue) => {
                    if (encryptedValue === 'encrypted-nombre') return 'María García';
                    if (encryptedValue === 'encrypted-telefono') return '+57 301 987 6543';
                    return encryptedValue;
                });

            // Act
            const result = decryptObject(encryptedObj, fieldsToDecrypt);

            // Assert
            expect(result.user.profile.nombre).toBe('María García');
            expect(result.user.contact.telefono).toBe('+57 301 987 6543');
        });
    });

    describe('Integración encrypt/decrypt', () => {
        it('debería poder cifrar y descifrar el mismo dato', () => {
            // Arrange
            const originalData = 'información confidencial del usuario';
            
            // Mock más realista para el test de integración
            let encryptedValue;
            crypto.createCipherGCM.mockImplementation(() => ({
                setAAD: jest.fn(),
                update: jest.fn().mockReturnValue(Buffer.from('mock-encrypted')),
                final: jest.fn(),
                getAuthTag: jest.fn().mockReturnValue(Buffer.from('mock-tag'))
            }));

            crypto.createDecipherGCM.mockImplementation(() => ({
                setAAD: jest.fn(),
                setAuthTag: jest.fn(),
                update: jest.fn().mockReturnValue(Buffer.from(originalData)),
                final: jest.fn()
            }));

            // Mock Buffer.from para simular datos de cifrado
            jest.spyOn(Buffer, 'from').mockImplementation((data, encoding) => {
                if (encoding === 'base64') {
                    // Simular el formato: salt + iv + tag + ciphertext
                    const totalLength = 64 + 16 + 16 + Buffer.from('mock-encrypted').length;
                    return Buffer.alloc(totalLength, 'x');
                }
                return Buffer.from(data);
            });

            // Act
            const encrypted = encrypt(originalData);
            const decrypted = decrypt(encrypted);

            // Assert
            expect(encrypted).toBeDefined();
            expect(decrypted).toBe(originalData);
        });
    });

    describe('Validación de configuración', () => {
        it('debería validar que ENCRYPTION_KEY esté configurado', () => {
            // Arrange
            const originalKey = process.env.ENCRYPTION_KEY;
            delete process.env.ENCRYPTION_KEY;

            // Act & Assert
            expect(() => encrypt('test')).toThrow('ENCRYPTION_KEY no está definido');
            expect(() => decrypt('test')).toThrow('ENCRYPTION_KEY no está definido');

            // Restore
            process.env.ENCRYPTION_KEY = originalKey;
        });
    });
});
