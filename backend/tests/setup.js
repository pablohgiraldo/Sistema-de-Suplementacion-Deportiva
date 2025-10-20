// Setup para tests de Jest
import 'dotenv/config';
import mongoose from 'mongoose';

// Configurar variables de entorno para testing
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/supergains_test';

// Configurar timeout global
jest.setTimeout(10000);

// Setup y teardown de base de datos
beforeAll(async () => {
    try {
        // Conectar a la base de datos de test
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ Base de datos de test conectada');
    } catch (error) {
        console.error('❌ Error conectando a base de datos de test:', error);
        throw error;
    }
});

afterAll(async () => {
    try {
        // Limpiar todas las colecciones
        const collections = mongoose.connection.collections;
        for (const key in collections) {
            const collection = collections[key];
            await collection.deleteMany({});
        }

        // Cerrar conexión
        await mongoose.connection.close();
        console.log('✅ Conexión de test cerrada');
    } catch (error) {
        console.error('❌ Error cerrando conexión de test:', error);
        throw error;
    }
});

// Limpiar base de datos entre tests
beforeEach(async () => {
    try {
        // Esperar a que mongoose esté conectado
        if (mongoose.connection.readyState !== 1) {
            await new Promise(resolve => {
                mongoose.connection.once('connected', resolve);
            });
        }

        const collections = mongoose.connection.collections;
        for (const key in collections) {
            const collection = collections[key];
            // Eliminar todos los documentos
            await collection.deleteMany({});
        }
    } catch (error) {
        console.error('Error cleaning database:', error);
    }
});

// Configurar console para tests
const originalConsole = console;
global.console = {
    ...originalConsole,
    // Silenciar logs en tests a menos que haya errores
    log: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: originalConsole.error,
};

// Mock de variables de entorno
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.JWT_EXPIRES_IN = '1h';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';
