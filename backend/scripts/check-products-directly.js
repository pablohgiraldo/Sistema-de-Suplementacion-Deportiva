// Script para verificar directamente en MongoDB
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../src/models/Product.js';

dotenv.config();

const checkProductsDirectly = async () => {
    try {
        console.log('✅ MongoDB de producción conectado');
        console.log('🔍 Verificando productos directamente...\n');

        // Conectar a MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Conectado a MongoDB de producción');

        // Verificar productos directamente
        const products = await Product.find({});
        console.log(`📦 Total productos: ${products.length}`);

        // Mostrar detalles de los primeros 3 productos
        console.log('\n📋 DETALLES DE PRODUCTOS:');
        products.slice(0, 3).forEach((product, index) => {
            console.log(`${index + 1}. ${product.name}`);
            console.log(`   - active: ${product.active} (tipo: ${typeof product.active})`);
            console.log(`   - price: ${product.price}`);
            console.log(`   - _id: ${product._id}`);
            console.log('');
        });

        // Intentar diferentes consultas
        console.log('🔍 PROBANDO DIFERENTES CONSULTAS:');
        
        const query1 = await Product.find({ active: true });
        console.log(`✅ Productos con active: true = ${query1.length}`);
        
        const query2 = await Product.find({ active: { $eq: true } });
        console.log(`✅ Productos con active: { $eq: true } = ${query2.length}`);
        
        const query3 = await Product.find({ active: { $ne: false } });
        console.log(`✅ Productos con active: { $ne: false } = ${query3.length}`);
        
        const query4 = await Product.find({ $or: [{ active: true }, { active: { $exists: false } }] });
        console.log(`✅ Productos con active: true o no existe = ${query4.length}`);

        // Forzar actualización de todos los productos
        console.log('\n🔧 FORZANDO ACTUALIZACIÓN DE TODOS LOS PRODUCTOS...');
        const updateResult = await Product.updateMany({}, { $set: { active: true } });
        console.log(`✅ ${updateResult.modifiedCount} productos actualizados`);

        // Verificar después de la actualización
        const productsAfter = await Product.find({ active: true });
        console.log(`✅ Productos activos después de actualización: ${productsAfter.length}`);

    } catch (error) {
        console.error('❌ Error verificando productos:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Desconectado de MongoDB de producción');
    }
};

// Ejecutar
checkProductsDirectly();
