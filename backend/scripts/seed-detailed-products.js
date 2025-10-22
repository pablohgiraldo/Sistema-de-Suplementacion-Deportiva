import "dotenv/config";
import mongoose from "mongoose";
import Product from "../src/models/Product.js";
import Inventory from "../src/models/Inventory.js";

// Productos con información DETALLADA y ÚNICA - HU48
const detailedProducts = [
  // PRODUCTO 1: Whey Protein Isolate Gold Standard
  {
    name: "Whey Protein Isolate Gold Standard - Doble Chocolate Rico",
    brand: "SuperGains Elite",
    price: 54.99,
    stock: 45,
    imageUrl: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400&h=400&fit=crop",
    description: "Proteína aislada de suero premium con 25g de proteína pura por porción y menos de 1g de carbohidratos. Procesada mediante microfiltración de flujo cruzado para preservar los péptidos naturales de proteína. Perfecta para fase de definición muscular. Contiene enzimas digestivas (lactasa, proteasa) para máxima absorción. Sabor intenso a chocolate doble con cacao belga premium. Mezcla instantánea sin grumos.",
    categories: ["proteina", "whey", "isolate", "chocolate", "sin-azucar", "sin-gluten"],
    
    nutritionalInfo: {
      servingSize: "30g (1 scoop)",
      servingsPerContainer: 33,
      calories: 120,
      protein: 25,
      carbs: 2,
      fats: 1,
      fiber: 0,
      sugar: 1,
      sodium: 50,
      vitamins: [
        { name: "Vitamina B6", amount: "0.8mg", dailyValue: 40 },
        { name: "Vitamina B12", amount: "2.4mcg", dailyValue: 100 }
      ],
      minerals: [
        { name: "Calcio", amount: "120mg", dailyValue: 12 },
        { name: "Hierro", amount: "1.2mg", dailyValue: 7 }
      ]
    },
    
    ingredients: {
      main: [
        "Aislado de proteína de suero de leche (WPI) microfiltrado",
        "Cacao en polvo premium (procesado alcalino)",
        "Chocolate belga en trozos (5%)"
      ],
      additives: [
        "Saborizantes naturales y artificiales",
        "Lecitina de girasol (emulsionante)",
        "Sucralosa (edulcorante)",
        "Enzimas digestivas (lactasa, proteasa)",
        "Goma xantana (espesante)"
      ],
      allergens: [
        "Contiene lácteos (proteína de suero)",
        "Puede contener trazas de soja, huevo y frutos secos",
        "Procesado en instalaciones que manipulan gluten"
      ]
    },
    
    aminoAcids: [
      { name: "Leucina (BCAA)", amount: "2.8g", perServing: 2800 },
      { name: "Isoleucina (BCAA)", amount: "1.5g", perServing: 1500 },
      { name: "Valina (BCAA)", amount: "1.4g", perServing: 1400 },
      { name: "Lisina", amount: "2.2g", perServing: 2200 },
      { name: "Treonina", amount: "1.8g", perServing: 1800 },
      { name: "Metionina", amount: "0.5g", perServing: 500 },
      { name: "Fenilalanina", amount: "0.8g", perServing: 800 },
      { name: "Triptófano", amount: "0.4g", perServing: 400 },
      { name: "Histidina", amount: "0.4g", perServing: 400 },
      { name: "Glutamina y Ácido Glutámico", amount: "4.5g", perServing: 4500 }
    ],
    
    usage: {
      instructions: "Mezclar 1 scoop (30g) con 200-300ml de agua fría, leche o bebida vegetal. Agitar vigorosamente durante 20-30 segundos hasta obtener una mezcla homogénea. Consumir inmediatamente después de preparar.",
      dosage: "1-2 porciones diarias dependiendo de tus necesidades proteicas. Una porción aporta 25g de proteína.",
      timing: "Ideal consumir: 1) Inmediatamente después del entrenamiento (ventana anabólica), 2) Entre comidas como snack proteico, 3) En el desayuno para un inicio energético del día.",
      warnings: [
        "No exceder 3 porciones al día",
        "No sustituye una dieta equilibrada y variada",
        "Mantener fuera del alcance de los niños",
        "Consultar con un médico si estás embarazada, lactando o bajo tratamiento médico",
        "No usar si el sello de seguridad está roto",
        "Beber abundante agua durante el día"
      ]
    },
    
    productDetails: {
      flavor: "Doble Chocolate Rico con trozos de chocolate belga",
      size: "1kg (2.2 lbs)",
      weight: "1000g",
      servings: 33,
      isVegan: false,
      isGlutenFree: false,
      isLactoseFree: false,
      isSugarFree: true
    }
  },

  // PRODUCTO 2: BCAA Energy Powder (Completamente diferente)
  {
    name: "BCAA Energy Powder - Frutas del Bosque",
    brand: "SuperGains Performance",
    price: 34.99,
    stock: 62,
    imageUrl: "https://images.unsplash.com/photo-1541534401786-2077f4bf6b95?w=400&h=400&fit=crop",
    description: "Fórmula avanzada de aminoácidos de cadena ramificada (BCAA) en proporción 2:1:1 con cafeína natural y electrolitos. Diseñado para tomar durante el entrenamiento, proporciona energía sostenida, reduce la fatiga muscular y acelera la recuperación. Contiene vitaminas del complejo B para metabolismo energético óptimo. Sabor intenso a frutas del bosque, sin azúcar y con taurina para máximo rendimiento.",
    categories: ["aminoacidos", "bcaa", "energia", "rendimiento", "intra-workout"],
    
    nutritionalInfo: {
      servingSize: "12g (1 scoop)",
      servingsPerContainer: 30,
      calories: 5,
      protein: 0,
      carbs: 0,
      fats: 0,
      fiber: 0,
      sugar: 0,
      sodium: 120,
      vitamins: [
        { name: "Vitamina B1 (Tiamina)", amount: "1.1mg", dailyValue: 100 },
        { name: "Vitamina B2 (Riboflavina)", amount: "1.4mg", dailyValue: 100 },
        { name: "Vitamina B3 (Niacina)", amount: "16mg", dailyValue: 100 },
        { name: "Vitamina B6", amount: "1.4mg", dailyValue: 100 },
        { name: "Vitamina B12", amount: "2.5mcg", dailyValue: 100 }
      ],
      minerals: [
        { name: "Sodio", amount: "120mg", dailyValue: 5 },
        { name: "Potasio", amount: "80mg", dailyValue: 2 },
        { name: "Magnesio", amount: "30mg", dailyValue: 8 }
      ]
    },
    
    ingredients: {
      main: [
        "L-Leucina (4000mg)",
        "L-Isoleucina (2000mg)",
        "L-Valina (2000mg)",
        "Cafeína anhidra (150mg)",
        "Taurina (1000mg)"
      ],
      additives: [
        "Ácido cítrico (regulador de acidez)",
        "Saborizante natural de frutas del bosque",
        "Extracto de remolacha (colorante natural)",
        "Sucralosa y acesulfamo K (edulcorantes)",
        "Citrato de sodio",
        "Citrato de potasio",
        "Óxido de magnesio"
      ],
      allergens: [
        "Libre de alérgenos principales",
        "Puede contener trazas de soja y lácteos por procesamiento compartido"
      ]
    },
    
    aminoAcids: [
      { name: "L-Leucina", amount: "4g", perServing: 4000 },
      { name: "L-Isoleucina", amount: "2g", perServing: 2000 },
      { name: "L-Valina", amount: "2g", perServing: 2000 }
    ],
    
    usage: {
      instructions: "Disolver 1 scoop (12g) en 400-500ml de agua fría. Agitar bien hasta completa disolución. Para mejor resultado, usar un shaker.",
      dosage: "1 porción durante el entrenamiento. Puede tomarse también antes o después del ejercicio según preferencia.",
      timing: "Momento óptimo: 1) Durante el entrenamiento (sorbos constantes), 2) 15-30 minutos antes del entreno para energía inmediata, 3) Inmediatamente después del entreno si no se consumió durante.",
      warnings: [
        "Contiene 150mg de cafeína por porción (equivalente a 1.5 tazas de café)",
        "No consumir 4-6 horas antes de dormir si eres sensible a la cafeína",
        "No exceder 2 porciones en 24 horas",
        "No combinar con otros productos que contengan cafeína",
        "Personas sensibles a estimulantes deben consultar médico",
        "No recomendado para menores de 18 años, embarazadas o lactantes",
        "Mantener hidratación adecuada durante el uso"
      ]
    },
    
    productDetails: {
      flavor: "Frutas del Bosque (Mora, Frambuesa, Arándano)",
      size: "360g",
      weight: "360g",
      servings: 30,
      isVegan: true,
      isGlutenFree: true,
      isLactoseFree: true,
      isSugarFree: true
    }
  },

  // PRODUCTO 3: Multivitamínico (Completamente diferente a los anteriores)
  {
    name: "Daily Complete Multivitamin - Fórmula Deportiva",
    brand: "SuperGains Wellness",
    price: 29.99,
    stock: 85,
    imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop",
    description: "Complejo multivitamínico y mineral especialmente formulado para atletas y personas activas. Contiene 25 vitaminas y minerales esenciales en dosis óptimas, incluyendo antioxidantes, vitaminas del complejo B para energía, vitamina D3 para salud ósea, zinc y magnesio para recuperación muscular. Incluye extractos botánicos como ginseng y té verde para vitalidad adicional. Cápsulas fáciles de tragar, sin colorantes artificiales.",
    categories: ["vitaminas", "minerales", "salud", "wellness", "suplemento-diario"],
    
    nutritionalInfo: {
      servingSize: "2 cápsulas",
      servingsPerContainer: 30,
      calories: 10,
      protein: 0,
      carbs: 2,
      fats: 0,
      fiber: 0,
      sugar: 0,
      sodium: 5,
      vitamins: [
        { name: "Vitamina A (como betacaroteno)", amount: "900mcg", dailyValue: 100 },
        { name: "Vitamina C (ácido ascórbico)", amount: "150mg", dailyValue: 167 },
        { name: "Vitamina D3 (colecalciferol)", amount: "50mcg (2000 IU)", dailyValue: 250 },
        { name: "Vitamina E (d-alfa tocoferol)", amount: "20mg", dailyValue: 133 },
        { name: "Vitamina K2", amount: "75mcg", dailyValue: 63 },
        { name: "Vitamina B1 (Tiamina)", amount: "25mg", dailyValue: 2083 },
        { name: "Vitamina B2 (Riboflavina)", amount: "25mg", dailyValue: 1923 },
        { name: "Vitamina B3 (Niacina)", amount: "30mg", dailyValue: 188 },
        { name: "Vitamina B6 (Piridoxina)", amount: "25mg", dailyValue: 1471 },
        { name: "Ácido Fólico (B9)", amount: "400mcg", dailyValue: 100 },
        { name: "Vitamina B12 (Metilcobalamina)", amount: "100mcg", dailyValue: 4167 },
        { name: "Biotina (B7)", amount: "300mcg", dailyValue: 600 }
      ],
      minerals: [
        { name: "Calcio (citrato)", amount: "200mg", dailyValue: 20 },
        { name: "Hierro (bisglicinato)", amount: "10mg", dailyValue: 56 },
        { name: "Magnesio (citrato)", amount: "150mg", dailyValue: 36 },
        { name: "Zinc (picolinato)", amount: "15mg", dailyValue: 136 },
        { name: "Selenio (L-selenometionina)", amount: "100mcg", dailyValue: 182 },
        { name: "Cobre (quelato)", amount: "1mg", dailyValue: 100 },
        { name: "Manganeso (quelato)", amount: "2mg", dailyValue: 87 },
        { name: "Cromo (picolinato)", amount: "120mcg", dailyValue: 343 },
        { name: "Molibdeno", amount: "75mcg", dailyValue: 167 },
        { name: "Yodo (kelp)", amount: "150mcg", dailyValue: 100 }
      ]
    },
    
    ingredients: {
      main: [
        "Mezcla de vitaminas (ver tabla nutricional)",
        "Mezcla de minerales quelados (ver tabla nutricional)",
        "Extracto de Ginseng Panax (100mg)",
        "Extracto de Té Verde estandarizado 50% EGCG (50mg)",
        "CoQ10 (Coenzima Q10) (30mg)",
        "Ácido Alfa Lipoico (25mg)",
        "Luteína y Zeaxantina (6mg)"
      ],
      additives: [
        "Celulosa microcristalina (agente de carga)",
        "Estearato de magnesio (antiaglomerante)",
        "Dióxido de silicio (antiaglomerante)",
        "Cápsula vegetal (HPMC)",
        "Agua purificada"
      ],
      allergens: [
        "Sin gluten, sin lácteos, sin soja",
        "Apto para vegetarianos",
        "Libre de colorantes y saborizantes artificiales"
      ]
    },
    
    aminoAcids: [],
    
    usage: {
      instructions: "Tomar 2 cápsulas al día con alimentos, preferiblemente con el desayuno o almuerzo. Tragar con abundante agua. No masticar ni abrir las cápsulas.",
      dosage: "Dosis diaria: 2 cápsulas. Proporciona el 100% o más del valor diario recomendado de vitaminas y minerales esenciales.",
      timing: "Mejor momento: Con la primera comida del día (desayuno) para óptima absorción. Las vitaminas liposolubles (A, D, E, K) se absorben mejor con alimentos que contengan grasas saludables.",
      warnings: [
        "No exceder la dosis recomendada",
        "Los suplementos no deben usarse como sustituto de una dieta variada y equilibrada",
        "Si estás tomando medicamentos, consulta con tu médico antes de usar",
        "No recomendado durante el embarazo o lactancia sin supervisión médica",
        "Mantener fuera del alcance de los niños",
        "Almacenar en lugar fresco y seco, alejado de la luz solar",
        "Las vitaminas B pueden dar un color amarillo brillante a la orina (normal)",
        "Contiene hierro: mantener alejado de niños pequeños"
      ]
    },
    
    productDetails: {
      flavor: "Sin sabor (cápsulas)",
      size: "60 cápsulas",
      weight: "45g",
      servings: 30,
      isVegan: true,
      isGlutenFree: true,
      isLactoseFree: true,
      isSugarFree: true
    }
  }
];

// Función para limpiar y poblar la base de datos
async function seedDetailedProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Conectado a MongoDB");

    // Limpiar productos existentes (opcional)
    console.log("🗑️  Limpiando productos existentes...");
    await Product.deleteMany({});
    await Inventory.deleteMany({});
    
    // Insertar productos detallados
    console.log("📦 Insertando productos detallados...");
    const insertedProducts = await Product.insertMany(detailedProducts);
    console.log(`✅ ${insertedProducts.length} productos detallados insertados correctamente`);

    // Crear inventario para cada producto
    console.log("📊 Creando registros de inventario...");
    for (const product of insertedProducts) {
      await Inventory.create({
        product: product._id,
        availableStock: product.stock,
        reservedStock: 0,
        lastUpdated: new Date()
      });
    }
    console.log("✅ Inventario creado exitosamente");

    console.log("\n🎉 ¡Seed de productos detallados completado!");
    console.log("\nProductos creados:");
    insertedProducts.forEach((p, i) => {
      console.log(`${i + 1}. ${p.name} - $${p.price}`);
      console.log(`   Categorías: ${p.categories.join(", ")}`);
      console.log(`   Stock: ${p.stock} unidades`);
      console.log(`   Info nutricional: ${p.nutritionalInfo ? '✓' : '✗'}`);
      console.log(`   Ingredientes: ${p.ingredients ? '✓' : '✗'}`);
      console.log(`   Aminoácidos: ${p.aminoAcids && p.aminoAcids.length > 0 ? '✓' : '✗'}`);
      console.log(`   Instrucciones de uso: ${p.usage ? '✓' : '✗'}`);
      console.log("");
    });

  } catch (error) {
    console.error("❌ Error en seed:", error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log("👋 Desconectado de MongoDB");
  }
}

// Ejecutar
seedDetailedProducts()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

