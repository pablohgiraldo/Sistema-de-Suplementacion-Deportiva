import "dotenv/config";
import mongoose from "mongoose";
import Product from "../src/models/Product.js";
import Inventory from "../src/models/Inventory.js";

// Catálogo completo de productos SuperGains - HU48 (Precios en USD)
const products = [
  // ==================== PROTEÍNAS EN POLVO (10+ productos únicos) ====================
  {
    name: "Whey Protein Isolate Gold Standard - Doble Chocolate Rico",
    brand: "SuperGains Elite",
    price: 54.99,
    stock: 45,
    imageUrl: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400&h=400&fit=crop",
    description: "Proteína aislada de suero premium con 25g de proteína pura por porción y menos de 1g de carbohidratos. Procesada mediante microfiltración de flujo cruzado para preservar los péptidos naturales de proteína. Perfecta para fase de definición muscular. Contiene enzimas digestivas (lactasa, proteasa) para máxima absorción. Sabor intenso a chocolate doble con cacao belga premium. Mezcla instantánea sin grumos. Ideal para post-entrenamiento o como snack proteico entre comidas. Sin gluten, sin azúcares añadidos.",
    categories: ["proteina", "whey", "isolate", "chocolate", "sin-azucar", "sin-gluten"]
  },
  {
    name: "Designer Whey Protein 2lb - Vainilla",
    brand: "SuperGains",
    price: 39.99,
    stock: 38,
    imageUrl: "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=400&h=400&fit=crop",
    description: "Proteína de suero premium con sabor vainilla natural. 24g de proteína por porción para máximo rendimiento.",
    categories: ["proteina", "whey", "vainilla"]
  },
  {
    name: "Designer Whey Protein 5lb - Chocolate",
    brand: "SuperGains",
    price: 79.99,
    stock: 25,
    imageUrl: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400&h=400&fit=crop",
    description: "Presentación económica de 5lb. Proteína de suero de la más alta calidad sabor chocolate.",
    categories: ["proteina", "whey", "chocolate", "economico"]
  },
  {
    name: "Isoclear Whey Isolate - Frutas Tropicales",
    brand: "SuperGains",
    price: 49.99,
    stock: 32,
    imageUrl: "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=400&h=400&fit=crop",
    description: "Proteína aislada transparente y refrescante. 25g de proteína por porción sin lactosa.",
    categories: ["proteina", "isolate", "frutas", "sin-lactosa"]
  },
  {
    name: "Vegan Protein - Chocolate",
    brand: "SuperGains",
    price: 44.99,
    stock: 28,
    imageUrl: "https://images.unsplash.com/photo-1610440042657-612c34d95e9f?w=400&h=400&fit=crop",
    description: "Proteína vegetal a base de arveja y arroz. 22g de proteína por porción. 100% plant-based.",
    categories: ["proteina", "vegano", "plant-based", "chocolate"]
  },
  {
    name: "Vegan Protein - Vainilla",
    brand: "SuperGains",
    price: 44.99,
    stock: 24,
    imageUrl: "https://images.unsplash.com/photo-1610440042657-612c34d95e9f?w=400&h=400&fit=crop",
    description: "Proteína vegetal sabor vainilla. Sin ingredientes de origen animal. 22g de proteína.",
    categories: ["proteina", "vegano", "plant-based", "vainilla"]
  },
  {
    name: "Casein Protein - Nocturna",
    brand: "SuperGains",
    price: 45.99,
    stock: 18,
    imageUrl: "https://images.unsplash.com/photo-1614963366795-8718483af0f0?w=400&h=400&fit=crop",
    description: "Proteína de absorción lenta ideal para tomar antes de dormir. 24g de caseína por porción.",
    categories: ["proteina", "caseina", "nocturna"]
  },

  // CREATINAS Y RENDIMIENTO
  {
    name: "Creatina Monohidratada 300g",
    brand: "SuperGains",
    price: 24.99,
    stock: 52,
    imageUrl: "https://images.unsplash.com/photo-1541534401786-2077f4bf6b95?w=400&h=400&fit=crop",
    description: "Creatina pura monohidratada micronizada. Aumenta fuerza y masa muscular. 5g por porción.",
    categories: ["creatina", "rendimiento", "fuerza"]
  },
  {
    name: "Creatina Monohidratada 500g",
    brand: "SuperGains",
    price: 34.99,
    stock: 35,
    imageUrl: "https://images.unsplash.com/photo-1541534401786-2077f4bf6b95?w=400&h=400&fit=crop",
    description: "Presentación económica de 500g de creatina monohidratada de alta pureza.",
    categories: ["creatina", "rendimiento", "fuerza", "economico"]
  },
  {
    name: "Pre-Workout Extreme",
    brand: "SuperGains",
    price: 32.99,
    stock: 41,
    imageUrl: "https://images.unsplash.com/photo-1590556409324-aa1d726e5c3c?w=400&h=400&fit=crop",
    description: "Fórmula pre-entreno con cafeína, beta-alanina y citrulina. Energía explosiva para tus entrenamientos.",
    categories: ["pre-workout", "energia", "rendimiento"]
  },
  {
    name: "BCAA 2:1:1 - 300g",
    brand: "SuperGains",
    price: 22.99,
    stock: 48,
    imageUrl: "https://images.unsplash.com/photo-1614963366795-8718483af0f0?w=400&h=400&fit=crop",
    description: "Aminoácidos de cadena ramificada en proporción 2:1:1. Previene catabolismo muscular.",
    categories: ["aminoacidos", "bcaa", "recuperacion"]
  },
  {
    name: "Glutamina 300g",
    brand: "SuperGains",
    price: 19.99,
    stock: 33,
    imageUrl: "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=400&h=400&fit=crop",
    description: "L-Glutamina pura para recuperación muscular y sistema inmune. 5g por porción.",
    categories: ["aminoacidos", "glutamina", "recuperacion"]
  },

  // BARRAS Y SNACKS
  {
    name: "Designer Protein Bar - Chocolate Chip",
    brand: "SuperGains",
    price: 2.99,
    stock: 120,
    imageUrl: "https://images.unsplash.com/photo-1571506165871-ee72a35f50e7?w=400&h=400&fit=crop",
    description: "Barra de proteína con 20g de proteína. Sin azúcar añadida. Perfecto snack post-entreno.",
    categories: ["barra", "snack", "proteina", "sin-azucar"]
  },
  {
    name: "Designer Protein Bar - Peanut Butter",
    brand: "SuperGains",
    price: 2.99,
    stock: 98,
    imageUrl: "https://images.unsplash.com/photo-1595575042032-382084a0b6e0?w=400&h=400&fit=crop",
    description: "Barra sabor mantequilla de maní con 20g de proteína. Deliciosa y nutritiva.",
    categories: ["barra", "snack", "proteina", "mani"]
  },
  {
    name: "Protein Cookie - Double Chocolate",
    brand: "SuperGains",
    price: 3.49,
    stock: 85,
    imageUrl: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=400&fit=crop",
    description: "Galleta proteica con 16g de proteína. Doble chocolate irresistible.",
    categories: ["snack", "galleta", "proteina", "chocolate"]
  },
  {
    name: "Protein Chips - BBQ",
    brand: "SuperGains",
    price: 2.49,
    stock: 76,
    imageUrl: "https://images.unsplash.com/photo-1600952841320-db92ec4047ca?w=400&h=400&fit=crop",
    description: "Chips proteicos sabor BBQ con 15g de proteína por bolsa. Snack saludable.",
    categories: ["snack", "chips", "proteina", "salado"]
  },

  // VITAMINAS Y SUPLEMENTOS
  {
    name: "Multivitamínico Completo",
    brand: "SuperGains",
    price: 16.99,
    stock: 62,
    imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop",
    description: "Complejo multivitamínico con 23 vitaminas y minerales esenciales. 60 cápsulas.",
    categories: ["vitaminas", "minerales", "salud"]
  },
  {
    name: "Omega-3 Fish Oil 1000mg",
    brand: "SuperGains",
    price: 14.99,
    stock: 55,
    imageUrl: "https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=400&h=400&fit=crop",
    description: "Aceite de pescado rico en EPA y DHA. Salud cardiovascular y cerebral. 90 softgels.",
    categories: ["omega-3", "salud", "cardiovascular"]
  },
  {
    name: "Vitamina D3 5000 IU",
    brand: "SuperGains",
    price: 11.99,
    stock: 71,
    imageUrl: "https://images.unsplash.com/photo-1550572017-4414e1506611?w=400&h=400&fit=crop",
    description: "Vitamina D3 de alta potencia. Salud ósea y sistema inmune. 120 cápsulas.",
    categories: ["vitaminas", "d3", "inmunidad"]
  },
  {
    name: "Magnesio + Zinc + B6",
    brand: "SuperGains",
    price: 13.99,
    stock: 48,
    imageUrl: "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400&h=400&fit=crop",
    description: "Fórmula ZMA para recuperación, sueño profundo y producción hormonal. 90 cápsulas.",
    categories: ["minerales", "zma", "recuperacion", "sueño"]
  },

  // QUEMADORES Y CONTROL DE PESO
  {
    name: "Fat Burner Thermogenic",
    brand: "SuperGains",
    price: 27.99,
    stock: 37,
    imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop",
    description: "Quemador de grasa termogénico con cafeína, té verde y L-carnitina. 60 cápsulas.",
    categories: ["quemador", "termogenico", "perdida-peso"]
  },
  {
    name: "CLA 1000mg",
    brand: "SuperGains",
    price: 22.99,
    stock: 42,
    imageUrl: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=400&h=400&fit=crop",
    description: "Ácido linoleico conjugado para definición muscular y metabolismo de grasas. 90 softgels.",
    categories: ["cla", "definicion", "metabolismo"]
  },
  {
    name: "L-Carnitina Líquida 3000mg",
    brand: "SuperGains",
    price: 24.99,
    stock: 34,
    imageUrl: "https://images.unsplash.com/photo-1556911261-6bd341186b2f?w=400&h=400&fit=crop",
    description: "L-Carnitina líquida de rápida absorción. Transporte de grasas y energía. Sabor frutas.",
    categories: ["carnitina", "energia", "liquido"]
  },

  // GANADORES DE PESO
  {
    name: "Mass Gainer 6lb - Chocolate",
    brand: "SuperGains",
    price: 54.99,
    stock: 22,
    imageUrl: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400&h=400&fit=crop",
    description: "Ganador de peso con 50g de proteína y 250g de carbohidratos por porción. Para volumen.",
    categories: ["mass-gainer", "volumen", "proteina", "chocolate"]
  },
  {
    name: "Mass Gainer 6lb - Vainilla",
    brand: "SuperGains",
    price: 54.99,
    stock: 19,
    imageUrl: "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=400&h=400&fit=crop",
    description: "Ganador de peso sabor vainilla. Alto en calorías y proteína para ganar masa muscular.",
    categories: ["mass-gainer", "volumen", "proteina", "vainilla"]
  },

  // HIDRATACIÓN Y ELECTROLITOS
  {
    name: "Electrolitos + BCAA",
    brand: "SuperGains",
    price: 15.99,
    stock: 58,
    imageUrl: "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=400&h=400&fit=crop",
    description: "Bebida de hidratación con electrolitos y BCAAs. Ideal para durante el entrenamiento.",
    categories: ["hidratacion", "electrolitos", "bcaa", "intra-workout"]
  },
  {
    name: "Bebida Isotónica en Polvo",
    brand: "SuperGains",
    price: 11.99,
    stock: 67,
    imageUrl: "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=400&h=400&fit=crop",
    description: "Bebida isotónica para rehidratación rápida. Rico en electrolitos. Sabor naranja.",
    categories: ["hidratacion", "isotonica", "electrolitos"]
  },

  // OUTLET (PRODUCTOS EN OFERTA)
  {
    name: "Shaker SuperGains 700ml",
    brand: "SuperGains",
    price: 5.99,
    stock: 145,
    imageUrl: "https://images.unsplash.com/photo-1610440042657-612c34d95e9f?w=400&h=400&fit=crop",
    description: "Shaker oficial SuperGains con compartimento para polvo. Libre de BPA.",
    categories: ["accesorio", "shaker", "outlet"]
  },
  {
    name: "Toalla Deportiva SuperGains",
    brand: "SuperGains",
    price: 7.99,
    stock: 89,
    imageUrl: "https://images.unsplash.com/photo-1556906918-5f2e11e5f45c?w=400&h=400&fit=crop",
    description: "Toalla de microfibra absorbente. Logo SuperGains bordado. 60x120cm.",
    categories: ["accesorio", "toalla", "outlet"]
  }
];

async function seedProducts() {
  try {
    console.log("🌱 Iniciando seed de productos y inventario...");
    
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Conectado a MongoDB");

    // Limpiar colecciones existentes
    await Product.deleteMany({});
    await Inventory.deleteMany({});
    console.log("🗑️  Colecciones limpiadas");

    // Insertar productos
    const insertedProducts = await Product.insertMany(products);
    console.log(`✅ ${insertedProducts.length} productos insertados`);

    // Crear registros de inventario para cada producto
    const inventoryRecords = insertedProducts.map(product => ({
      product: product._id,
      currentStock: product.stock,
      minStock: Math.floor(product.stock * 0.2), // 20% del stock como mínimo
      maxStock: product.stock * 2, // Doble del stock como máximo
      reservedStock: 0,
      availableStock: product.stock,
      channels: {
        physical: {
          stock: product.stock,
          location: "Almacén Principal - Bogotá",
          lastUpdated: new Date(),
          lastSync: new Date(),
          syncStatus: 'synced'
        },
        digital: {
          stock: product.stock,
          platform: 'website',
          lastUpdated: new Date(),
          lastSync: new Date(),
          syncStatus: 'synced'
        }
      },
      lastRestocked: new Date(),
      totalSold: Math.floor(Math.random() * 50), // Ventas simuladas
      status: 'active',
      notes: 'Inventario inicial cargado automáticamente'
    }));

    const insertedInventory = await Inventory.insertMany(inventoryRecords);
    console.log(`✅ ${insertedInventory.length} registros de inventario creados`);

    // Resumen por categorías
    const categorySummary = {};
    insertedProducts.forEach(product => {
      product.categories.forEach(cat => {
        categorySummary[cat] = (categorySummary[cat] || 0) + 1;
      });
    });

    console.log("\n📊 Resumen por categorías:");
    Object.entries(categorySummary)
      .sort((a, b) => b[1] - a[1])
      .forEach(([cat, count]) => {
        console.log(`   - ${cat}: ${count} productos`);
      });

    console.log("\n🎉 ¡Seed completado exitosamente!");
    console.log(`   Total productos: ${insertedProducts.length}`);
    console.log(`   Total inventario: ${insertedInventory.length}`);
    console.log(`   Stock total: ${insertedProducts.reduce((sum, p) => sum + p.stock, 0)} unidades`);

  } catch (error) {
    console.error("❌ Error en el seed:", error.message);
    console.error(error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Desconectado de MongoDB");
  }
}

// Ejecutar el seed
seedProducts();

