import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from '../src/models/Order.js';
import Inventory from '../src/models/Inventory.js';
import Product from '../src/models/Product.js';
import User from '../src/models/User.js';

dotenv.config();

// Conectar a MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB conectado');
    } catch (error) {
        console.error('❌ Error conectando a MongoDB:', error);
        process.exit(1);
    }
};

// Función para verificar datos
const checkData = async () => {
    console.log('🔍 Verificando datos en la base de datos...\n');

    try {
        // Contar documentos
        const totalUsers = await User.countDocuments();
        const totalProducts = await Product.countDocuments();
        const totalOrders = await Order.countDocuments();
        const totalInventory = await Inventory.countDocuments();
        
        console.log('📊 RESUMEN DE DATOS:');
        console.log('===================');
        console.log(`👥 Usuarios: ${totalUsers}`);
        console.log(`📦 Productos: ${totalProducts}`);
        console.log(`🛒 Órdenes: ${totalOrders}`);
        console.log(`📋 Inventario: ${totalInventory}`);

        // Verificar órdenes por canal
        const onlineOrders = await Order.countDocuments({ salesChannel: 'online' });
        const physicalOrders = await Order.countDocuments({ salesChannel: 'physical_store' });
        const mobileOrders = await Order.countDocuments({ salesChannel: 'mobile_app' });
        
        console.log('\n🛒 ÓRDENES POR CANAL:');
        console.log('====================');
        console.log(`💻 Online: ${onlineOrders}`);
        console.log(`🏪 Físicas: ${physicalOrders}`);
        console.log(`📱 Móvil: ${mobileOrders}`);

        // Verificar inventario omnicanal
        const inventoriesWithChannels = await Inventory.countDocuments({
            'channels.physical': { $exists: true },
            'channels.digital': { $exists: true }
        });
        
        const discrepancies = await Inventory.countDocuments({
            $expr: {
                $ne: ['$channels.physical.stock', '$channels.digital.stock']
            }
        });

        console.log('\n📋 INVENTARIO OMNICANAL:');
        console.log('========================');
        console.log(`🏪 Con canales: ${inventoriesWithChannels}`);
        console.log(`⚠️ Discrepancias: ${discrepancies}`);

        // Mostrar algunas órdenes recientes
        const recentOrders = await Order.find()
            .populate('user', 'nombre email')
            .populate('items.product', 'name price')
            .sort({ createdAt: -1 })
            .limit(5);

        console.log('\n🛒 ÓRDENES RECIENTES:');
        console.log('====================');
        recentOrders.forEach((order, index) => {
            console.log(`${index + 1}. ${order.orderNumber} - ${order.salesChannel} - $${order.total} - ${order.status}`);
        });

        console.log('\n✅ Verificación completada');

    } catch (error) {
        console.error('❌ Error verificando datos:', error);
    }
};

// Función principal
const main = async () => {
    await connectDB();
    await checkData();
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado de MongoDB');
    process.exit(0);
};

// Ejecutar script
main().catch(error => {
    console.error('❌ Error en script principal:', error);
    process.exit(1);
});
