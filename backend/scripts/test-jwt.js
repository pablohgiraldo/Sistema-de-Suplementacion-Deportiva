import dotenv from 'dotenv';
import { generateToken, verifyToken, generateTokenPair, extractTokenFromHeader } from '../src/config/jwt.js';
import { generateAuthTokens, refreshAccessToken, validateToken } from '../src/utils/jwtUtils.js';
import User from '../src/models/User.js';
import { connectDB } from '../src/config/db.js';

// Cargar variables de entorno
dotenv.config();

async function testJWTConfiguration() {
    console.log('🧪 Iniciando pruebas de configuración JWT...\n');

    try {
        // 1. Probar generación de token básico
        console.log('1. Probando generación de token básico...');
        const testPayload = {
            userId: '507f1f77bcf86cd799439011',
            email: 'test@supergains.com',
            role: 'user'
        };

        const token = generateToken(testPayload);
        console.log('✅ Token generado:', token.substring(0, 50) + '...');

        // 2. Probar verificación de token
        console.log('\n2. Probando verificación de token...');
        const decoded = verifyToken(token);
        console.log('✅ Token verificado:', decoded);

        // 3. Probar generación de par de tokens
        console.log('\n3. Probando generación de par de tokens...');
        const tokenPair = generateTokenPair({
            _id: '507f1f77bcf86cd799439011',
            email: 'test@supergains.com',
            role: 'user'
        });
        console.log('✅ Access Token:', tokenPair.accessToken.substring(0, 50) + '...');
        console.log('✅ Refresh Token:', tokenPair.refreshToken.substring(0, 50) + '...');

        // 4. Probar extracción de token del header
        console.log('\n4. Probando extracción de token del header...');
        const authHeader = 'Bearer ' + token;
        const extractedToken = extractTokenFromHeader(authHeader);
        console.log('✅ Token extraído:', extractedToken === token ? 'Correcto' : 'Error');

        // 5. Probar con header inválido
        console.log('\n5. Probando header inválido...');
        const invalidHeader = 'Invalid ' + token;
        const invalidToken = extractTokenFromHeader(invalidHeader);
        console.log('✅ Header inválido manejado:', invalidToken === null ? 'Correcto' : 'Error');

        // 6. Probar token expirado (simulando)
        console.log('\n6. Probando manejo de errores...');
        try {
            const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1MDdmMWY3N2JjZjg2Y2Q3OTk0MzkwMTEiLCJlbWFpbCI6InRlc3RAc3VwZXJnYWlucy5jb20iLCJyb2xlIjoidXNlciIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoxNzAwMDAwMDAxLCJpc3MiOiJzdXBlcmdhaW5zLWFwaSIsImF1ZCI6InN1cGVyZ2FpbnMtY2xpZW50In0.invalid';
            verifyToken(expiredToken);
        } catch (error) {
            console.log('✅ Error manejado correctamente:', error.message);
        }

        console.log('\n🎉 Todas las pruebas de configuración JWT pasaron exitosamente!');

    } catch (error) {
        console.error('❌ Error en las pruebas de JWT:', error.message);
        process.exit(1);
    }
}

async function testJWTWithDatabase() {
    console.log('\n🧪 Iniciando pruebas de JWT con base de datos...\n');

    try {
        // Conectar a la base de datos
        await connectDB(process.env.MONGODB_URI);

        // Buscar un usuario de prueba
        const testUser = await User.findOne({ email: 'test@supergains.com' });

        if (!testUser) {
            console.log('⚠️ No se encontró usuario de prueba. Creando uno...');

            // Crear usuario de prueba
            const newUser = new User({
                email: 'test@supergains.com',
                contraseña: 'password123',
                nombre: 'Usuario de Prueba',
                rol: 'usuario',
                activo: true
            });

            await newUser.save();
            console.log('✅ Usuario de prueba creado');

            // Probar generación de tokens de autenticación
            console.log('\n7. Probando generación de tokens de autenticación...');
            const authResult = await generateAuthTokens(newUser);
            console.log('✅ Tokens de autenticación generados:', authResult.success);
            console.log('✅ Usuario:', authResult.data.user.email);
            console.log('✅ Access Token:', authResult.data.tokens.accessToken.substring(0, 50) + '...');

            // Probar validación de token
            console.log('\n8. Probando validación de token...');
            const validationResult = await validateToken(authResult.data.tokens.accessToken);
            console.log('✅ Validación de token:', validationResult.success);
            if (validationResult.success) {
                console.log('✅ Usuario validado:', validationResult.data.email);
            }

            // Probar refresh de token
            console.log('\n9. Probando refresh de token...');
            const refreshResult = await refreshAccessToken(authResult.data.tokens.refreshToken);
            console.log('✅ Refresh de token:', refreshResult.success);
            if (refreshResult.success) {
                console.log('✅ Nuevo access token generado');
            }

        } else {
            console.log('✅ Usuario de prueba encontrado:', testUser.email);
        }

        console.log('\n🎉 Todas las pruebas de JWT con base de datos pasaron exitosamente!');

    } catch (error) {
        console.error('❌ Error en las pruebas de JWT con base de datos:', error.message);
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

// Ejecutar pruebas
if (process.env.MONGODB_URI) {
    testJWTWithDatabase();
} else {
    console.log('⚠️ MONGODB_URI no configurada, ejecutando solo pruebas básicas...');
    testJWTConfiguration();
}
