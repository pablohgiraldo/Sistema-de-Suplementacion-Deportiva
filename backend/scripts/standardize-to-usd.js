import "dotenv/config";
import mongoose from "mongoose";
import Product from "../src/models/Product.js";
import Order from "../src/models/Order.js";

const USD_TO_COP_RATE = 4000; // Tasa de conversión

// Precios estándar en USD para productos de suplementos
const STANDARD_USD_PRICES = {
    // Proteínas - rango $25-80 USD
    "whey": { min: 25, max: 80, default: 45 },
    "protein": { min: 25, max: 80, default: 45 },
    "proteína": { min: 25, max: 80, default: 45 },
    
    // Creatina - rango $15-35 USD
    "creatina": { min: 15, max: 35, default: 25 },
    "creatine": { min: 15, max: 35, default: 25 },
    
    // BCAA - rango $20-45 USD
    "bcaa": { min: 20, max: 45, default: 30 },
    "amino": { min: 20, max: 45, default: 30 },
    
    // Pre-workout - rango $25-50 USD
    "pre-workout": { min: 25, max: 50, default: 35 },
    "workout": { min: 25, max: 50, default: 35 },
    
    // Multivitamínicos - rango $15-40 USD
    "multi": { min: 15, max: 40, default: 25 },
    "vitamin": { min: 15, max: 40, default: 25 },
    
    // Default para productos no categorizados
    "default": { min: 20, max: 60, default: 35 }
};

function getUSDPrice(product) {
    const name = product.name.toLowerCase();
    const brand = (product.brand || '').toLowerCase();
    const categories = (product.categories || []).join(' ').toLowerCase();
    const searchText = `${name} ${brand} ${categories}`;
    
    // Buscar categoría que coincida
    for (const [category, config] of Object.entries(STANDARD_USD_PRICES)) {
        if (category !== 'default' && searchText.includes(category)) {
            // Generar precio dentro del rango basado en el ID (para consistencia)
            const seed = product._id.toString().charCodeAt(0) + product._id.toString().charCodeAt(1);
            const range = config.max - config.min;
            const randomFactor = (seed % 100) / 100;
            let price = config.min + (range * randomFactor);
            
            // Ajustar precios para que sean más realistas
            if (category === 'whey' || category === 'protein') {
                price = Math.max(25, Math.min(80, price));
            } else if (category === 'creatina' || category === 'creatine') {
                price = Math.max(15, Math.min(35, price));
            } else if (category === 'bcaa') {
                price = Math.max(20, Math.min(45, price));
            }
            
            return Math.round(price * 100) / 100; // Redondear a centavos
        }
    }
    
    // Si no coincide, usar default con precio más realista
    const config = STANDARD_USD_PRICES.default;
    const seed = product._id.toString().charCodeAt(0) + product._id.toString().charCodeAt(1);
    const range = config.max - config.min;
    const randomFactor = (seed % 100) / 100;
    let price = config.min + (range * randomFactor);
    price = Math.max(20, Math.min(60, price)); // Asegurar rango realista
    return Math.round(price * 100) / 100;
}

async function standardizeToUSD(executeChanges = false) {
    try {
        console.log("🔄 Estandarizando sistema de precios a USD...");
        if (!executeChanges) {
            console.log("🔍 MODO PREVIEW - No se realizarán cambios reales");
        }

        await mongoose.connect(process.env.MONGODB_URI);
        
        // 1. Actualizar precios de productos
        const products = await Product.find({});
        console.log(`\n📦 Actualizando ${products.length} productos:`);
        
        let updatedProducts = 0;
        for (const product of products) {
            const newUSDPrice = getUSDPrice(product);
            const oldPriceCOP = product.price;
            
            console.log(`${product.name}:`);
            console.log(`  Antes: $${oldPriceCOP.toLocaleString()} COP`);
            console.log(`  Después: $${newUSDPrice} USD`);
            
            if (executeChanges) {
                product.price = newUSDPrice;
                await product.save();
                updatedProducts++;
            }
        }

        if (executeChanges) {
            console.log(`\n✅ ${updatedProducts} productos actualizados a USD`);
            
            // 2. Opcional: Limpiar órdenes inconsistentes (comentado por seguridad)
            // const ordersToClean = await Order.find({});
            // console.log(`\n🧹 Considerando limpiar ${ordersToClean.length} órdenes...`);
            // console.log("⚠️  Esto requeriría aprobación manual para producción");
        } else {
            console.log("\n🔍 MODO PREVIEW - Para ejecutar cambios reales:");
            console.log("node scripts/standardize-to-usd.js --execute");
        }

        // Estadísticas finales
        const finalProducts = await Product.find({}).limit(5);
        console.log(`\n📊 Muestra de precios finales:`);
        finalProducts.forEach(p => {
            console.log(`- ${p.name}: $${p.price} USD`);
        });

    } catch (error) {
        console.error("❌ Error:", error.message);
    } finally {
        await mongoose.disconnect();
        console.log("\n✅ Proceso completado");
    }
}

// Verificar argumentos
const shouldExecute = process.argv.includes('--execute');
standardizeToUSD(shouldExecute);
