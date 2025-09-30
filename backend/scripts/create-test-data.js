import mongoose from 'mongoose';
import User from '../src/models/User.js';
import Product from '../src/models/Product.js';
import bcrypt from 'bcryptjs';

async function createTestData() {
    try {
        console.log('🔄 Conectando a MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/supergains');
        console.log('✅ Conectado a MongoDB');

        // Crear usuarios de prueba
        console.log('👥 Creando usuarios de prueba...');

        const users = [
            {
                nombre: 'Juan Pérez',
                email: 'juan.perez@test.com',
                contraseña: await bcrypt.hash('password123', 10),
                role: 'user',
                telefono: '3001234567',
                direccion: 'Calle 123 #45-67, Bogotá'
            },
            {
                nombre: 'María García',
                email: 'maria.garcia@test.com',
                contraseña: await bcrypt.hash('password123', 10),
                role: 'user',
                telefono: '3002345678',
                direccion: 'Carrera 45 #78-90, Medellín'
            },
            {
                nombre: 'Carlos López',
                email: 'carlos.lopez@test.com',
                contraseña: await bcrypt.hash('password123', 10),
                role: 'user',
                telefono: '3003456789',
                direccion: 'Avenida 6 #12-34, Cali'
            },
            {
                nombre: 'Ana Rodríguez',
                email: 'ana.rodriguez@test.com',
                contraseña: await bcrypt.hash('password123', 10),
                role: 'user',
                telefono: '3004567890',
                direccion: 'Calle 80 #23-45, Barranquilla'
            },
            {
                nombre: 'Luis Martínez',
                email: 'luis.martinez@test.com',
                contraseña: await bcrypt.hash('password123', 10),
                role: 'user',
                telefono: '3005678901',
                direccion: 'Carrera 20 #56-78, Cartagena'
            }
        ];

        // Limpiar usuarios de prueba anteriores
        await User.deleteMany({ email: { $regex: /@test\.com$/ } });
        console.log('🧹 Usuarios de prueba anteriores eliminados');

        const createdUsers = await User.insertMany(users);
        console.log(`✅ ${createdUsers.length} usuarios de prueba creados`);

        // Crear productos de prueba
        console.log('📦 Creando productos de prueba...');

        const products = [
            {
                name: 'Proteína Whey 1kg',
                brand: 'Optimum Nutrition',
                description: 'Proteína de suero de leche de alta calidad',
                price: 9500,
                category: 'Proteínas',
                stock: 50,
                images: ['proteina-whey.jpg'],
                specifications: {
                    peso: '1kg',
                    sabor: 'Vainilla',
                    tipo: 'Whey Protein'
                }
            },
            {
                name: 'Creatina Monohidrato',
                brand: 'MuscleTech',
                description: 'Creatina monohidrato para aumento de fuerza',
                price: 8500,
                category: 'Creatina',
                stock: 30,
                images: ['creatina-mono.jpg'],
                specifications: {
                    peso: '300g',
                    tipo: 'Monohidrato',
                    pureza: '99%'
                }
            },
            {
                name: 'BCAA 2:1:1',
                brand: 'Scivation',
                description: 'Aminoácidos ramificados para recuperación',
                price: 9000,
                category: 'Aminoácidos',
                stock: 25,
                images: ['bcaa.jpg'],
                specifications: {
                    peso: '400g',
                    ratio: '2:1:1',
                    tipo: 'BCAA'
                }
            },
            {
                name: 'Multivitamínico',
                brand: 'Centrum',
                description: 'Complejo vitamínico y mineral',
                price: 6500,
                category: 'Vitaminas',
                stock: 40,
                images: ['multivitaminico.jpg'],
                specifications: {
                    cantidad: '60 tabletas',
                    tipo: 'Multivitamínico'
                }
            },
            {
                name: 'Omega 3',
                brand: 'Nordic Naturals',
                description: 'Aceite de pescado rico en omega 3',
                price: 7500,
                category: 'Omega 3',
                stock: 35,
                images: ['omega3.jpg'],
                specifications: {
                    cantidad: '90 cápsulas',
                    concentracion: '1000mg'
                }
            },
            {
                name: 'Pre-entreno',
                brand: 'C4 Sport',
                description: 'Suplemento pre-entrenamiento energético',
                price: 10000,
                category: 'Pre-entreno',
                stock: 20,
                images: ['preentreno.jpg'],
                specifications: {
                    peso: '300g',
                    sabor: 'Frutas tropicales',
                    tipo: 'Pre-entreno'
                }
            },
            {
                name: 'Glutamina',
                brand: 'Dymatize',
                description: 'Glutamina para recuperación muscular',
                price: 9000,
                category: 'Aminoácidos',
                stock: 28,
                images: ['glutamina.jpg'],
                specifications: {
                    peso: '500g',
                    pureza: '99%',
                    tipo: 'L-Glutamina'
                }
            },
            {
                name: 'Caseína',
                brand: 'Gold Standard',
                description: 'Proteína de caseína de liberación lenta',
                price: 10000,
                category: 'Proteínas',
                stock: 15,
                images: ['caseina.jpg'],
                specifications: {
                    peso: '2kg',
                    sabor: 'Chocolate',
                    tipo: 'Caseína'
                }
            }
        ];

        // Limpiar productos de prueba anteriores
        await Product.deleteMany({ brand: { $in: ['Optimum Nutrition', 'MuscleTech', 'Scivation', 'Centrum', 'Nordic Naturals', 'C4 Sport', 'Dymatize', 'Gold Standard'] } });
        console.log('🧹 Productos de prueba anteriores eliminados');

        const createdProducts = await Product.insertMany(products);
        console.log(`✅ ${createdProducts.length} productos de prueba creados`);

        console.log('\n📊 Resumen de datos creados:');
        console.log(`   - Usuarios: ${createdUsers.length}`);
        console.log(`   - Productos: ${createdProducts.length}`);

        console.log('\n👥 Usuarios creados:');
        createdUsers.forEach((user, index) => {
            console.log(`   ${index + 1}. ${user.nombre} (${user.email})`);
        });

        console.log('\n📦 Productos creados:');
        createdProducts.forEach((product, index) => {
            console.log(`   ${index + 1}. ${product.name} - $${product.price.toLocaleString('es-CO')} COP`);
        });

        console.log('\n🎉 ¡Datos de prueba creados exitosamente!');
        console.log('💡 Ahora puedes crear órdenes de prueba');

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Stack:', error.stack);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Conexión cerrada');
    }
}

createTestData();
