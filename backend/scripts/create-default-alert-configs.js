import "dotenv/config";
import mongoose from "mongoose";
import Product from "../src/models/Product.js";
import AlertConfig from "../src/models/AlertConfig.js";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ Conectado a MongoDB");
    } catch (error) {
        console.error("❌ Error conectando a MongoDB:", error);
        process.exit(1);
    }
};

const createDefaultAlertConfigs = async () => {
    try {
        console.log("🔍 Buscando productos sin configuración de alertas...");

        // Obtener todos los productos
        const products = await Product.find({});
        console.log(`📦 Encontrados ${products.length} productos`);

        // Obtener productos que ya tienen configuración de alertas
        const existingConfigs = await AlertConfig.find({});
        const productsWithConfigs = existingConfigs.map(config => config.product.toString());

        // Filtrar productos sin configuración
        const productsWithoutConfigs = products.filter(product =>
            !productsWithConfigs.includes(product._id.toString())
        );

        console.log(`⚠️  ${productsWithoutConfigs.length} productos necesitan configuración de alertas`);

        if (productsWithoutConfigs.length === 0) {
            console.log("✅ Todos los productos ya tienen configuración de alertas");
            return;
        }

        // Crear configuraciones por defecto
        const configsToCreate = productsWithoutConfigs.map(product => ({
            product: product._id,
            lowStockThreshold: 10,
            criticalStockThreshold: 5,
            outOfStockThreshold: 0,
            emailAlerts: {
                enabled: true,
                lowStock: true,
                criticalStock: true,
                outOfStock: true,
                recipients: []
            },
            appAlerts: {
                enabled: true,
                lowStock: true,
                criticalStock: true,
                outOfStock: true
            },
            webhookAlerts: {
                enabled: false,
                url: "",
                events: []
            },
            alertFrequency: 'immediate',
            autoRestock: {
                enabled: false,
                quantity: 50,
                supplier: ""
            },
            status: 'active'
        }));

        // Insertar configuraciones en lote
        const createdConfigs = await AlertConfig.insertMany(configsToCreate);

        console.log(`✅ Creadas ${createdConfigs.length} configuraciones de alertas por defecto`);

        // Mostrar resumen
        console.log("\n📊 Resumen de configuraciones creadas:");
        createdConfigs.forEach((config, index) => {
            console.log(`${index + 1}. Producto: ${config.product}`);
            console.log(`   - Stock bajo: ${config.lowStockThreshold}`);
            console.log(`   - Stock crítico: ${config.criticalStockThreshold}`);
            console.log(`   - Stock agotado: ${config.outOfStockThreshold}`);
            console.log(`   - Alertas email: ${config.emailAlerts.enabled ? '✅' : '❌'}`);
            console.log(`   - Alertas app: ${config.appAlerts.enabled ? '✅' : '❌'}`);
            console.log("");
        });

    } catch (error) {
        console.error("❌ Error creando configuraciones de alertas:", error);
    }
};

const main = async () => {
    await connectDB();
    await createDefaultAlertConfigs();

    console.log("\n🎉 Proceso completado");
    process.exit(0);
};

main().catch(error => {
    console.error("❌ Error en el proceso principal:", error);
    process.exit(1);
});
