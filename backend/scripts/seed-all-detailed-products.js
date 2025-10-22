import "dotenv/config";
import mongoose from "mongoose";
import Product from "../src/models/Product.js";
import Inventory from "../src/models/Inventory.js";

// CATÁLOGO COMPLETO CON INFORMACIÓN ÚNICA Y DETALLADA - HU48
// Cada producto tiene información nutricional, ingredientes, aminoácidos, instrucciones de uso específicas

const products = [
    // ==================== CATEGORÍA: PROTEÍNAS EN POLVO ====================

    // PRODUCTO 1: Whey Protein Isolate Gold Standard
    {
        name: "Whey Protein Isolate Gold Standard - Doble Chocolate Rico",
        brand: "SuperGains Elite",
        price: 54.99,
        stock: 45,
        imageUrl: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400&h=400&fit=crop",
        description: "Proteína aislada de suero premium con 25g de proteína pura por porción y menos de 1g de carbohidratos. Procesada mediante microfiltración de flujo cruzado para preservar los péptidos naturales. Perfecta para fase de definición muscular. Contiene enzimas digestivas (lactasa, proteasa) para máxima absorción. Sabor intenso a chocolate doble con cacao belga premium.",
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
                "Puede contener trazas de soja, huevo y frutos secos"
            ]
        },

        aminoAcids: [
            { name: "Leucina (BCAA)", amount: "2.8g", perServing: 2800 },
            { name: "Isoleucina (BCAA)", amount: "1.5g", perServing: 1500 },
            { name: "Valina (BCAA)", amount: "1.4g", perServing: 1400 },
            { name: "Lisina", amount: "2.2g", perServing: 2200 },
            { name: "Treonina", amount: "1.8g", perServing: 1800 },
            { name: "Glutamina", amount: "4.5g", perServing: 4500 }
        ],

        usage: {
            instructions: "Mezclar 1 scoop (30g) con 200-300ml de agua fría o leche. Agitar vigorosamente 20-30 segundos.",
            dosage: "1-2 porciones diarias (25-50g de proteína total)",
            timing: "Post-entrenamiento inmediato, entre comidas, o en el desayuno",
            warnings: [
                "No exceder 3 porciones diarias",
                "Mantener fuera del alcance de niños",
                "Consultar médico si está embarazada o bajo tratamiento",
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

    // PRODUCTO 2: Designer Whey Protein Vainilla
    {
        name: "Designer Whey Protein 2lb - Vainilla Francesa",
        brand: "SuperGains",
        price: 39.99,
        stock: 38,
        imageUrl: "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=400&h=400&fit=crop",
        description: "Proteína de suero concentrada premium con 24g de proteína por porción. Elaborada con vainilla francesa natural y extracto de vainilla de Madagascar. Mezcla cremosa y suave, perfecta para batidos y recetas. Bajo en carbohidratos y grasas. Ideal para construcción muscular y recuperación post-entrenamiento.",
        categories: ["proteina", "whey", "vainilla", "concentrado"],

        nutritionalInfo: {
            servingSize: "32g (1 scoop)",
            servingsPerContainer: 28,
            calories: 130,
            protein: 24,
            carbs: 4,
            fats: 2,
            fiber: 0,
            sugar: 2,
            sodium: 65,
            vitamins: [
                { name: "Vitamina A", amount: "150mcg", dailyValue: 17 },
                { name: "Vitamina C", amount: "6mg", dailyValue: 7 }
            ],
            minerals: [
                { name: "Calcio", amount: "180mg", dailyValue: 18 },
                { name: "Fósforo", amount: "140mg", dailyValue: 14 }
            ]
        },

        ingredients: {
            main: [
                "Concentrado de proteína de suero de leche (WPC80)",
                "Extracto natural de vainilla de Madagascar",
                "Vainilla francesa en polvo"
            ],
            additives: [
                "Aroma natural de vainilla",
                "Lecitina de soja (emulsionante)",
                "Acesulfamo K y sucralosa (edulcorantes)",
                "Carragenina (espesante)",
                "Dióxido de silicio (antiaglomerante)"
            ],
            allergens: [
                "Contiene lácteos y soja",
                "Puede contener trazas de huevo, trigo y frutos secos"
            ]
        },

        aminoAcids: [
            { name: "Leucina (BCAA)", amount: "2.5g", perServing: 2500 },
            { name: "Isoleucina (BCAA)", amount: "1.4g", perServing: 1400 },
            { name: "Valina (BCAA)", amount: "1.3g", perServing: 1300 },
            { name: "Lisina", amount: "2.0g", perServing: 2000 },
            { name: "Metionina", amount: "0.4g", perServing: 400 },
            { name: "Glutamina", amount: "4.2g", perServing: 4200 }
        ],

        usage: {
            instructions: "Mezclar 1 scoop (32g) con 250ml de agua, leche o bebida vegetal en un shaker. Agitar hasta mezcla homogénea.",
            dosage: "1-2 porciones al día según necesidades proteicas (24-48g proteína)",
            timing: "Ideal después del entrenamiento, en el desayuno o como merienda proteica",
            warnings: [
                "No sustituye una dieta variada",
                "Consumir como parte de un estilo de vida saludable",
                "Si tiene alergia a lácteos, no consumir",
                "Almacenar en lugar fresco y seco"
            ]
        },

        productDetails: {
            flavor: "Vainilla Francesa Natural de Madagascar",
            size: "2 lbs (907g)",
            weight: "907g",
            servings: 28,
            isVegan: false,
            isGlutenFree: true,
            isLactoseFree: false,
            isSugarFree: false
        }
    },

    // PRODUCTO 3: Designer Whey 5lb Chocolate
    {
        name: "Designer Whey Protein 5lb - Chocolate Intenso",
        brand: "SuperGains",
        price: 79.99,
        stock: 25,
        imageUrl: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400&h=400&fit=crop",
        description: "Presentación económica familiar de 5 libras. Proteína de suero concentrada de máxima calidad con 23g de proteína por porción. Sabor chocolate intenso con cacao natural premium. Perfecto para atletas y familias que entrenan regularmente. Excelente relación calidad-precio. Rico en BCAAs naturales para recuperación y crecimiento muscular.",
        categories: ["proteina", "whey", "chocolate", "economico", "concentrado"],

        nutritionalInfo: {
            servingSize: "33g (1 scoop)",
            servingsPerContainer: 68,
            calories: 135,
            protein: 23,
            carbs: 5,
            fats: 2.5,
            fiber: 1,
            sugar: 3,
            sodium: 70,
            vitamins: [
                { name: "Vitamina D", amount: "2mcg", dailyValue: 10 },
                { name: "Vitamina B6", amount: "0.7mg", dailyValue: 35 }
            ],
            minerals: [
                { name: "Calcio", amount: "200mg", dailyValue: 20 },
                { name: "Hierro", amount: "1.5mg", dailyValue: 8 },
                { name: "Magnesio", amount: "25mg", dailyValue: 6 }
            ]
        },

        ingredients: {
            main: [
                "Concentrado de proteína de suero de leche (WPC80)",
                "Cacao en polvo natural (10%)",
                "Chocolate en polvo"
            ],
            additives: [
                "Sabor natural y artificial a chocolate",
                "Lecitina de girasol",
                "Goma guar (espesante)",
                "Stevia y sucralosa (edulcorantes)",
                "Sal marina"
            ],
            allergens: [
                "Contiene lácteos",
                "Procesado en instalación que maneja soja, huevo, trigo y frutos secos"
            ]
        },

        aminoAcids: [
            { name: "Leucina (BCAA)", amount: "2.4g", perServing: 2400 },
            { name: "Isoleucina (BCAA)", amount: "1.3g", perServing: 1300 },
            { name: "Valina (BCAA)", amount: "1.2g", perServing: 1200 },
            { name: "Lisina", amount: "1.9g", perServing: 1900 },
            { name: "Treonina", amount: "1.5g", perServing: 1500 },
            { name: "Glutamina", amount: "4.0g", perServing: 4000 }
        ],

        usage: {
            instructions: "Agregar 1 scoop (33g) a 300ml de líquido frío. Mezclar con licuadora o shaker durante 30 segundos.",
            dosage: "1-3 porciones diarias dependiendo de objetivos y peso corporal",
            timing: "Post-entrenamiento para recuperación, entre comidas, o antes de dormir",
            warnings: [
                "No exceder 4 porciones al día",
                "Mantener el envase bien cerrado después de cada uso",
                "Producto de uso deportivo, consultar entrenador para dosis óptima",
                "Mantener hidratación adecuada"
            ]
        },

        productDetails: {
            flavor: "Chocolate Intenso con cacao natural",
            size: "5 lbs (2.27 kg)",
            weight: "2270g",
            servings: 68,
            isVegan: false,
            isGlutenFree: true,
            isLactoseFree: false,
            isSugarFree: false
        }
    },

    // PRODUCTO 4: Isoclear Whey Isolate Frutas Tropicales
    {
        name: "Isoclear Whey Isolate - Frutas Tropicales",
        brand: "SuperGains Clear",
        price: 49.99,
        stock: 32,
        imageUrl: "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=400&h=400&fit=crop",
        description: "Proteína aislada transparente y refrescante, diferente a las proteínas tradicionales cremosas. Textura ligera similar a un jugo de frutas. 25g de proteína pura sin lactosa por porción. Perfecta para climas cálidos o quienes prefieren bebidas ligeras. Tecnología de hidrólisis enzimática para transparencia total. Sabor intenso a frutas tropicales (mango, piña, maracuyá).",
        categories: ["proteina", "isolate", "frutas", "sin-lactosa", "refrescante"],

        nutritionalInfo: {
            servingSize: "25g (1 scoop)",
            servingsPerContainer: 20,
            calories: 95,
            protein: 25,
            carbs: 0.5,
            fats: 0.2,
            fiber: 0,
            sugar: 0.5,
            sodium: 45,
            vitamins: [],
            minerals: [
                { name: "Sodio", amount: "45mg", dailyValue: 2 }
            ]
        },

        ingredients: {
            main: [
                "Aislado de proteína de suero hidrolizado (95%)",
                "Extracto natural de mango",
                "Extracto natural de piña",
                "Extracto natural de maracuyá"
            ],
            additives: [
                "Ácido cítrico (acidulante)",
                "Aroma natural de frutas tropicales",
                "Sucralosa (edulcorante)",
                "Colorante natural (curcumina)",
                "Ácido málico"
            ],
            allergens: [
                "Contiene derivados de lácteos (sin lactosa)",
                "Libre de soja, gluten y frutos secos"
            ]
        },

        aminoAcids: [
            { name: "Leucina (BCAA)", amount: "3.2g", perServing: 3200 },
            { name: "Isoleucina (BCAA)", amount: "1.7g", perServing: 1700 },
            { name: "Valina (BCAA)", amount: "1.5g", perServing: 1500 },
            { name: "Lisina", amount: "2.4g", perServing: 2400 }
        ],

        usage: {
            instructions: "Mezclar 1 scoop (25g) con 300-400ml de agua MUY FRÍA. Agitar suavemente y dejar reposar 1 minuto. Consumir frío.",
            dosage: "1-2 porciones diarias",
            timing: "Excelente post-entrenamiento en verano, durante entrenamientos largos, o como bebida proteica refrescante",
            warnings: [
                "Usar agua fría para mejor disolución",
                "No mezclar con leche (perderá transparencia)",
                "Consumir inmediatamente después de preparar",
                "Puede formar espuma al agitar"
            ]
        },

        productDetails: {
            flavor: "Frutas Tropicales (Mango, Piña, Maracuyá)",
            size: "500g",
            weight: "500g",
            servings: 20,
            isVegan: false,
            isGlutenFree: true,
            isLactoseFree: true,
            isSugarFree: true
        }
    },

    // PRODUCTO 5: Vegan Protein Chocolate
    {
        name: "Vegan Protein - Chocolate Orgánico",
        brand: "SuperGains Plant",
        price: 44.99,
        stock: 28,
        imageUrl: "https://images.unsplash.com/photo-1610440042657-612c34d95e9f?w=400&h=400&fit=crop",
        description: "Proteína vegetal 100% plant-based elaborada con mezcla de proteína de arveja orgánica, arroz integral y semillas de calabaza. 22g de proteína completa por porción con todos los aminoácidos esenciales. Endulzada con stevia orgánica. Rico sabor a chocolate con cacao orgánico certificado. Sin lácteos, sin soja, sin gluten. Ideal para veganos, vegetarianos e intolerantes a lactosa.",
        categories: ["proteina", "vegano", "plant-based", "chocolate", "organico"],

        nutritionalInfo: {
            servingSize: "35g (1 scoop)",
            servingsPerContainer: 20,
            calories: 140,
            protein: 22,
            carbs: 6,
            fats: 3,
            fiber: 4,
            sugar: 1,
            sodium: 320,
            vitamins: [
                { name: "Vitamina B12 (añadida)", amount: "2.4mcg", dailyValue: 100 },
                { name: "Hierro", amount: "3.6mg", dailyValue: 20 }
            ],
            minerals: [
                { name: "Calcio", amount: "100mg", dailyValue: 10 },
                { name: "Magnesio", amount: "45mg", dailyValue: 11 },
                { name: "Zinc", amount: "3mg", dailyValue: 27 }
            ]
        },

        ingredients: {
            main: [
                "Proteína de arveja orgánica (60%)",
                "Proteína de arroz integral germinado (30%)",
                "Proteína de semillas de calabaza (10%)",
                "Cacao orgánico en polvo"
            ],
            additives: [
                "Stevia orgánica (edulcorante natural)",
                "Aroma natural de chocolate",
                "Goma de acacia (fibra prebiótica)",
                "Sal marina del Himalaya",
                "Enzimas digestivas vegetales"
            ],
            allergens: [
                "100% libre de los 14 alérgenos principales",
                "Apto para veganos y vegetarianos",
                "Sin OGM, sin gluten, sin soja, sin lácteos"
            ]
        },

        aminoAcids: [
            { name: "Leucina (BCAA)", amount: "2.2g", perServing: 2200 },
            { name: "Isoleucina (BCAA)", amount: "1.1g", perServing: 1100 },
            { name: "Valina (BCAA)", amount: "1.2g", perServing: 1200 },
            { name: "Lisina", amount: "1.8g", perServing: 1800 },
            { name: "Arginina", amount: "2.0g", perServing: 2000 }
        ],

        usage: {
            instructions: "Mezclar 1 scoop (35g) con 300ml de bebida vegetal (almendra, avena, coco) o agua. Agitar bien por 45 segundos.",
            dosage: "1-2 porciones diarias (22-44g proteína vegetal)",
            timing: "Post-entrenamiento, desayuno, o entre comidas. Combina bien con plátano y mantequilla de almendra",
            warnings: [
                "Agitar vigorosamente para mejor textura",
                "Mejor con bebidas vegetales que con agua",
                "Producto orgánico certificado",
                "Apto para dietas veganas estrictas"
            ]
        },

        productDetails: {
            flavor: "Chocolate Orgánico con Cacao",
            size: "700g",
            weight: "700g",
            servings: 20,
            isVegan: true,
            isGlutenFree: true,
            isLactoseFree: true,
            isSugarFree: false
        }
    },

    // PRODUCTO 6: Vegan Protein Vainilla
    {
        name: "Vegan Protein - Vainilla Bourbon",
        brand: "SuperGains Plant",
        price: 44.99,
        stock: 24,
        imageUrl: "https://images.unsplash.com/photo-1610440042657-612c34d95e9f?w=400&h=400&fit=crop",
        description: "Proteína vegetal premium con extracto de vainilla bourbon auténtica. Mezcla sinérgica de proteína de arveja, arroz y semillas de hemp para perfil de aminoácidos completo. 22g de proteína plant-based por porción. Enriquecida con probióticos para salud digestiva. Sin azúcares refinados, endulzada con fruta de monje. Textura cremosa y suave, ideal para smoothies y recetas.",
        categories: ["proteina", "vegano", "plant-based", "vainilla"],

        nutritionalInfo: {
            servingSize: "35g (1 scoop)",
            servingsPerContainer: 20,
            calories: 135,
            protein: 22,
            carbs: 5,
            fats: 3.5,
            fiber: 3,
            sugar: 0,
            sodium: 280,
            vitamins: [
                { name: "Vitamina D2 (ergocalciferol)", amount: "10mcg", dailyValue: 50 },
                { name: "Vitamina B12", amount: "2.4mcg", dailyValue: 100 }
            ],
            minerals: [
                { name: "Hierro", amount: "4mg", dailyValue: 22 },
                { name: "Calcio", amount: "120mg", dailyValue: 12 }
            ]
        },

        ingredients: {
            main: [
                "Proteína de arveja amarilla (50%)",
                "Proteína de arroz integral (35%)",
                "Proteína de semillas de hemp (15%)",
                "Extracto de vainilla bourbon"
            ],
            additives: [
                "Fruta de monje en polvo (edulcorante natural)",
                "Cultivos probióticos (1 billón CFU)",
                "Goma xantana",
                "Sabor natural de vainilla",
                "Lecitina de girasol"
            ],
            allergens: [
                "Libre de todos los alérgenos principales",
                "Certificado vegano",
                "Sin gluten, sin soja, sin lácteos, sin nueces"
            ]
        },

        aminoAcids: [
            { name: "Leucina (BCAA)", amount: "2.3g", perServing: 2300 },
            { name: "Isoleucina (BCAA)", amount: "1.2g", perServing: 1200 },
            { name: "Valina (BCAA)", amount: "1.1g", perServing: 1100 },
            { name: "Lisina", amount: "1.9g", perServing: 1900 }
        ],

        usage: {
            instructions: "Agregar 1 scoop (35g) a 250-300ml de bebida vegetal fría. Licuar o agitar por 30-45 segundos hasta cremoso.",
            dosage: "1-2 porciones diarias",
            timing: "Desayuno con avena, post-entrenamiento, o como base para smoothie bowls",
            warnings: [
                "Contiene probióticos vivos, mantener refrigerado después de abrir",
                "Agitar bien el envase antes de cada uso",
                "Los probióticos benefician la digestión",
                "100% ingredientes vegetales"
            ]
        },

        productDetails: {
            flavor: "Vainilla Bourbon auténtica",
            size: "700g",
            weight: "700g",
            servings: 20,
            isVegan: true,
            isGlutenFree: true,
            isLactoseFree: true,
            isSugarFree: true
        }
    },

    // PRODUCTO 7: Casein Protein Nocturna
    {
        name: "Casein Protein - Nocturna Vainilla Canela",
        brand: "SuperGains Night",
        price: 45.99,
        stock: 18,
        imageUrl: "https://images.unsplash.com/photo-1614963366795-8718483af0f0?w=400&h=400&fit=crop",
        description: "Proteína de caseína micelar de liberación ultra lenta (6-8 horas). 24g de proteína por porción diseñada específicamente para tomar antes de dormir. La digestión lenta mantiene el flujo constante de aminoácidos durante toda la noche, previniendo catabolismo muscular. Sabor relajante a vainilla con toque de canela. Textura espesa y cremosa tipo pudding. Enriquecida con magnesio y zinc para mejor descanso.",
        categories: ["proteina", "caseina", "nocturna", "liberacion-lenta"],

        nutritionalInfo: {
            servingSize: "36g (1 scoop)",
            servingsPerContainer: 25,
            calories: 145,
            protein: 24,
            carbs: 5,
            fats: 1.5,
            fiber: 0,
            sugar: 4,
            sodium: 180,
            vitamins: [
                { name: "Vitamina B6", amount: "1.0mg", dailyValue: 50 },
                { name: "Ácido Fólico", amount: "200mcg", dailyValue: 50 }
            ],
            minerals: [
                { name: "Calcio", amount: "500mg", dailyValue: 50 },
                { name: "Magnesio", amount: "100mg", dailyValue: 24 },
                { name: "Zinc", amount: "5mg", dailyValue: 45 }
            ]
        },

        ingredients: {
            main: [
                "Caseína micelar (proteína de leche de liberación lenta)",
                "Extracto de vainilla natural",
                "Canela de Ceilán en polvo"
            ],
            additives: [
                "Maltodextrina (portador)",
                "Saborizante natural",
                "Acesulfamo K y sucralosa",
                "Carragenina (espesante)",
                "Óxido de magnesio",
                "Quelato de zinc"
            ],
            allergens: [
                "Contiene lácteos (caseína)",
                "Puede contener trazas de soja y huevo"
            ]
        },

        aminoAcids: [
            { name: "Leucina (BCAA)", amount: "2.1g", perServing: 2100 },
            { name: "Isoleucina (BCAA)", amount: "1.2g", perServing: 1200 },
            { name: "Valina (BCAA)", amount: "1.4g", perServing: 1400 },
            { name: "Glutamina", amount: "5.0g", perServing: 5000 },
            { name: "Prolina", amount: "2.5g", perServing: 2500 }
        ],

        usage: {
            instructions: "Mezclar 1 scoop (36g) con 250ml de agua o leche 30-60 minutos antes de dormir. Agitar bien, dejará textura espesa.",
            dosage: "1 porción antes de dormir",
            timing: "30-60 minutos antes de acostarse. En días de descanso puede usarse entre comidas",
            warnings: [
                "Diseñado específicamente para uso nocturno",
                "No sustituye la cena",
                "Textura más espesa que otras proteínas (normal en caseína)",
                "Magnesio y zinc ayudan a conciliar el sueño",
                "Ideal para períodos de ayuno largo (sueño)"
            ]
        },

        productDetails: {
            flavor: "Vainilla con toque de Canela",
            size: "900g",
            weight: "900g",
            servings: 25,
            isVegan: false,
            isGlutenFree: true,
            isLactoseFree: false,
            isSugarFree: false
        }
    },

    // ==================== CATEGORÍA: CREATINA Y RENDIMIENTO ====================

    // PRODUCTO 8: Creatina Monohidratada 300g
    {
        name: "Creatina Monohidratada 300g - Pureza Certificada",
        brand: "SuperGains Performance",
        price: 24.99,
        stock: 52,
        imageUrl: "https://images.unsplash.com/photo-1541534401786-2077f4bf6b95?w=400&h=400&fit=crop",
        description: "Creatina monohidratada micronizada de pureza farmacéutica (99.9%). Cada porción proporciona 5g de creatina pura certificada Creapure®. Micronizada para absorción superior y sin problemas estomacales. Aumenta fuerza, potencia y volumen muscular. Sin sabor, se mezcla con cualquier bebida. Testada por laboratorio independiente. Ideal para deportes explosivos y entrenamiento de fuerza.",
        categories: ["creatina", "rendimiento", "fuerza", "sin-sabor"],

        nutritionalInfo: {
            servingSize: "5g (1 cucharadita)",
            servingsPerContainer: 60,
            calories: 0,
            protein: 0,
            carbs: 0,
            fats: 0,
            fiber: 0,
            sugar: 0,
            sodium: 0,
            vitamins: [],
            minerals: []
        },

        ingredients: {
            main: [
                "Creatina monohidratada micronizada Creapure® (100%)"
            ],
            additives: [],
            allergens: [
                "Libre de alérgenos",
                "Sin gluten, sin lactosa, sin soja",
                "Apto para veganos"
            ]
        },

        aminoAcids: [],

        usage: {
            instructions: "Fase de carga: 20g al día (4 porciones) durante 5-7 días. Fase de mantenimiento: 5g al día (1 porción). Mezclar con agua, jugo o tu batido de proteína.",
            dosage: "5g diarios en fase de mantenimiento",
            timing: "Puede tomarse en cualquier momento. Ideal post-entrenamiento con carbohidratos simples para mejor absorción.",
            warnings: [
                "Beber al menos 2-3 litros de agua al día",
                "La fase de carga es opcional",
                "Consultar médico si tienes problemas renales",
                "No exceder 20g en fase de carga"
            ]
        },

        productDetails: {
            flavor: "Sin sabor (neutral)",
            size: "300g",
            weight: "300g",
            servings: 60,
            isVegan: true,
            isGlutenFree: true,
            isLactoseFree: true,
            isSugarFree: true
        }
    },

    // PRODUCTO 9: Creatina 500g
    {
        name: "Creatina Monohidratada 500g - Presentación Económica",
        brand: "SuperGains Performance",
        price: 34.99,
        stock: 35,
        imageUrl: "https://images.unsplash.com/photo-1541534401786-2077f4bf6b95?w=400&h=400&fit=crop",
        description: "Presentación económica de 500g de creatina monohidratada de alta pureza (99.5%). Formato familiar ideal para usuarios regulares. Aumenta ATP muscular, mejora fuerza máxima en 1RM y favorece hipertrofia. Micronización ultrafina para máxima solubilidad. Sin rellenos ni aditivos innecesarios. Producto con mejor relación calidad-precio del mercado. Incluye cucharita dosificadora de 5g.",
        categories: ["creatina", "rendimiento", "fuerza", "economico"],

        nutritionalInfo: {
            servingSize: "5g",
            servingsPerContainer: 100,
            calories: 0,
            protein: 0,
            carbs: 0,
            fats: 0,
            fiber: 0,
            sugar: 0,
            sodium: 0,
            vitamins: [],
            minerals: []
        },

        ingredients: {
            main: [
                "Creatina monohidratada micronizada"
            ],
            additives: [
                "Dióxido de silicio (antiaglomerante, <1%)"
            ],
            allergens: [
                "Libre de los 14 alérgenos principales",
                "Producto 100% puro",
                "Apto para dietas veganas y vegetarianas"
            ]
        },

        aminoAcids: [],

        usage: {
            instructions: "Mezclar 5g con 200-300ml de agua, jugo de uva o bebida deportiva. Agitar o revolver hasta disolución completa.",
            dosage: "5g diarios continuos. Fase de carga opcional: 20g/día x 7 días divididos en 4 tomas",
            timing: "Pre-entrenamiento (30 min antes) o post-entrenamiento con comida rica en carbohidratos",
            warnings: [
                "Mantener hidratación óptima (mínimo 2L agua/día)",
                "Puede causar retención de agua (beneficiosa para músculo)",
                "No mezclar con cafeína en exceso",
                "Almacenar en lugar seco"
            ]
        },

        productDetails: {
            flavor: "Sin sabor",
            size: "500g",
            weight: "500g",
            servings: 100,
            isVegan: true,
            isGlutenFree: true,
            isLactoseFree: true,
            isSugarFree: true
        }
    },

    // PRODUCTO 10: Pre-Workout Extreme
    {
        name: "Pre-Workout Extreme - Explosión de Energía",
        brand: "SuperGains Ignite",
        price: 32.99,
        stock: 41,
        imageUrl: "https://images.unsplash.com/photo-1590556409324-aa1d726e5c3c?w=400&h=400&fit=crop",
        description: "Fórmula pre-entreno de máxima potencia con 300mg de cafeína anhidra, 3.2g beta-alanina, 6g citrulina malato, y 2g betaína. Proporciona energía explosiva, enfoque mental láser, pumps vasculares intensos y retraso de fatiga. Sabor ponche de frutas tropical. Incluye taurina, tirosina y vitaminas B para metabolismo energético. Sin creatina (combínalo con la tuya). Ideal para entrenamientos de alta intensidad.",
        categories: ["pre-workout", "energia", "rendimiento", "pump"],

        nutritionalInfo: {
            servingSize: "15g (1 scoop)",
            servingsPerContainer: 20,
            calories: 10,
            protein: 0,
            carbs: 2,
            fats: 0,
            fiber: 0,
            sugar: 0,
            sodium: 200,
            vitamins: [
                { name: "Niacina (B3)", amount: "20mg", dailyValue: 125 },
                { name: "Vitamina B6", amount: "2mg", dailyValue: 100 },
                { name: "Vitamina B12", amount: "6mcg", dailyValue: 250 }
            ],
            minerals: [
                { name: "Sodio", amount: "200mg", dailyValue: 9 }
            ]
        },

        ingredients: {
            main: [
                "Citrulina malato 2:1 (6000mg)",
                "Beta-alanina (3200mg)",
                "Betaína anhidra (2000mg)",
                "Cafeína anhidra (300mg)",
                "L-Taurina (1000mg)",
                "L-Tirosina (500mg)"
            ],
            additives: [
                "Sabor natural y artificial ponche de frutas",
                "Ácido cítrico",
                "Ácido málico",
                "Sucralosa",
                "Colorante natural (remolacha)",
                "Dióxido de silicio"
            ],
            allergens: [
                "Libre de alérgenos principales",
                "Contiene cafeína (equivalente a 3 cafés)"
            ]
        },

        aminoAcids: [],

        usage: {
            instructions: "Mezclar 1 scoop (15g) con 300ml de agua fría 20-30 minutos antes del entrenamiento. Comenzar con medio scoop para evaluar tolerancia.",
            dosage: "1 scoop (máximo 2 scoops para usuarios avanzados con alta tolerancia a estimulantes)",
            timing: "20-30 minutos pre-entrenamiento. No consumir 6 horas antes de dormir.",
            warnings: [
                "Contiene 300mg cafeína por porción",
                "Puede causar hormigueo (beta-alanina, es normal)",
                "No combinar con otras fuentes de cafeína",
                "No apto para menores de 18 años, embarazadas",
                "Evaluar tolerancia con medio scoop primero",
                "No exceder 2 scoops en 24 horas"
            ]
        },

        productDetails: {
            flavor: "Ponche de Frutas Tropical",
            size: "300g",
            weight: "300g",
            servings: 20,
            isVegan: true,
            isGlutenFree: true,
            isLactoseFree: true,
            isSugarFree: true
        }
    },

    // PRODUCTO 11: BCAA 2:1:1
    {
        name: "BCAA 2:1:1 - Aminoácidos Ramificados 300g",
        brand: "SuperGains Recovery",
        price: 22.99,
        stock: 48,
        imageUrl: "https://images.unsplash.com/photo-1614963366795-8718483af0f0?w=400&h=400&fit=crop",
        description: "Aminoácidos de cadena ramificada en proporción clásica 2:1:1 (Leucina:Isoleucina:Valina). 5g de BCAAs por porción para prevenir catabolismo muscular, acelerar recuperación y reducir dolor post-entreno. Sabor limón lima refrescante. Sin rellenos. Ideal para tomar durante entrenamientos largos o en ayunas. Promueve síntesis proteica muscular. Instantáneo, se disuelve fácilmente en agua fría.",
        categories: ["aminoacidos", "bcaa", "recuperacion", "intra-workout"],

        nutritionalInfo: {
            servingSize: "5g (1 scoop)",
            servingsPerContainer: 60,
            calories: 0,
            protein: 5,
            carbs: 0,
            fats: 0,
            fiber: 0,
            sugar: 0,
            sodium: 0,
            vitamins: [],
            minerals: []
        },

        ingredients: {
            main: [
                "L-Leucina (2500mg)",
                "L-Isoleucina (1250mg)",
                "L-Valina (1250mg)"
            ],
            additives: [
                "Sabor natural limón-lima",
                "Ácido cítrico",
                "Sucralosa",
                "Lecitina de girasol",
                "Colorante natural (cúrcuma)"
            ],
            allergens: [
                "Libre de alérgenos",
                "Apto para veganos (fermentación vegetal)"
            ]
        },

        aminoAcids: [
            { name: "L-Leucina", amount: "2.5g", perServing: 2500 },
            { name: "L-Isoleucina", amount: "1.25g", perServing: 1250 },
            { name: "L-Valina", amount: "1.25g", perServing: 1250 }
        ],

        usage: {
            instructions: "Mezclar 1 scoop (5g) con 400-500ml de agua fría. Agitar bien y consumir durante o entre entrenamientos.",
            dosage: "1-2 porciones diarias (5-10g BCAAs totales)",
            timing: "Durante el entrenamiento (intra-workout), o en ayunas antes de cardio matutino",
            warnings: [
                "Puede tener sabor ligeramente amargo (característico de BCAAs)",
                "Mejor con agua fría",
                "Complementa a proteína en polvo, no la sustituye",
                "Ideal para entrenamientos en ayunas"
            ]
        },

        productDetails: {
            flavor: "Limón Lima refrescante",
            size: "300g",
            weight: "300g",
            servings: 60,
            isVegan: true,
            isGlutenFree: true,
            isLactoseFree: true,
            isSugarFree: true
        }
    },

    // PRODUCTO 12: Glutamina
    {
        name: "L-Glutamina 300g - Recuperación y Sistema Inmune",
        brand: "SuperGains Recovery",
        price: 19.99,
        stock: 33,
        imageUrl: "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=400&h=400&fit=crop",
        description: "L-Glutamina pura en polvo, el aminoácido más abundante en tejido muscular. 5g por porción para acelerar recuperación post-entrenamiento intenso, reparar tejido muscular, fortalecer sistema inmune y mejorar salud intestinal. Sin sabor, micronizada para fácil disolución. Especialmente útil en fases de volumen, definición severa o entrenamientos de alto volumen. Reduce DOMS (dolor muscular de aparición tardía).",
        categories: ["aminoacidos", "glutamina", "recuperacion", "inmunidad"],

        nutritionalInfo: {
            servingSize: "5g",
            servingsPerContainer: 60,
            calories: 20,
            protein: 5,
            carbs: 0,
            fats: 0,
            fiber: 0,
            sugar: 0,
            sodium: 0,
            vitamins: [],
            minerals: []
        },

        ingredients: {
            main: [
                "L-Glutamina micronizada (100%)"
            ],
            additives: [],
            allergens: [
                "Libre de alérgenos",
                "Producto puro sin aditivos",
                "Apto para veganos"
            ]
        },

        aminoAcids: [
            { name: "L-Glutamina", amount: "5g", perServing: 5000 }
        ],

        usage: {
            instructions: "Mezclar 5g (1 cucharadita) con agua, jugo o tu batido de proteína. Se disuelve fácilmente en líquidos fríos o calientes.",
            dosage: "5-10g diarios, divididos en 1-2 tomas",
            timing: "Post-entrenamiento inmediato, o antes de dormir. En fases intensas: 5g post-entreno + 5g antes de dormir.",
            warnings: [
                "Especialmente beneficiosa durante entrenamientos intensos",
                "No tiene sabor, se mezcla con cualquier bebida",
                "Importante durante dietas de definición",
                "Apoya salud digestiva e intestinal"
            ]
        },

        productDetails: {
            flavor: "Sin sabor (neutral)",
            size: "300g",
            weight: "300g",
            servings: 60,
            isVegan: true,
            isGlutenFree: true,
            isLactoseFree: true,
            isSugarFree: true
        }
    },

    // ==================== CATEGORÍA: BARRAS Y SNACKS ====================

    // PRODUCTO 13: Protein Bar Chocolate Chip
    {
        name: "Designer Protein Bar - Chocolate Chip Cookie Dough",
        brand: "SuperGains Snacks",
        price: 2.99,
        stock: 120,
        imageUrl: "https://images.unsplash.com/photo-1571506165871-ee72a35f50e7?w=400&h=400&fit=crop",
        description: "Barra de proteína sabor masa de galleta con chispas de chocolate. 20g de proteína de suero de alta calidad. Solo 2g de azúcar, endulzada con eritritol y stevia. Textura suave y masticable, no dura ni seca. Perfecta para snack entre comidas o post-entrenamiento cuando no tienes tiempo para batido. Fibra prebiótica para salud digestiva. Sin gluten. Delicioso sabor a cookie dough auténtica.",
        categories: ["barra", "snack", "proteina", "sin-azucar", "chocolate"],

        nutritionalInfo: {
            servingSize: "60g (1 barra)",
            servingsPerContainer: 1,
            calories: 210,
            protein: 20,
            carbs: 22,
            fats: 7,
            fiber: 12,
            sugar: 2,
            sodium: 200,
            vitamins: [
                { name: "Vitamina A", amount: "150mcg", dailyValue: 17 },
                { name: "Vitamina C", amount: "12mg", dailyValue: 13 }
            ],
            minerals: [
                { name: "Calcio", amount: "250mg", dailyValue: 25 },
                { name: "Hierro", amount: "2mg", dailyValue: 11 }
            ]
        },

        ingredients: {
            main: [
                "Aislado de proteína de suero",
                "Fibra de raíz de achicoria (prebiótico)",
                "Chispas de chocolate sin azúcar (15%)",
                "Mantequilla de almendra"
            ],
            additives: [
                "Eritritol (edulcorante natural)",
                "Stevia",
                "Sabor natural a cookie dough",
                "Sal marina",
                "Lecitina de girasol"
            ],
            allergens: [
                "Contiene lácteos y almendras",
                "Puede contener trazas de maní, otros frutos secos, huevo y soja",
                "Sin gluten"
            ]
        },

        aminoAcids: [],

        usage: {
            instructions: "Lista para consumir. Abrir y disfrutar. Ideal a temperatura ambiente o ligeramente calentada (10 seg microondas).",
            dosage: "1-2 barras al día según necesidades calóricas y proteicas",
            timing: "Entre comidas, post-entrenamiento, snack de media mañana/tarde, o viajes",
            warnings: [
                "El consumo excesivo de eritritol puede tener efecto laxante",
                "Mantener en lugar fresco y seco",
                "Alta en fibra (beneficioso para saciedad)",
                "No sustituye comidas principales"
            ]
        },

        productDetails: {
            flavor: "Cookie Dough con Chispas de Chocolate",
            size: "60g",
            weight: "60g",
            servings: 1,
            isVegan: false,
            isGlutenFree: true,
            isLactoseFree: false,
            isSugarFree: false
        }
    },

    // PRODUCTO 14: Protein Bar Peanut Butter
    {
        name: "Designer Protein Bar - Peanut Butter Crunch",
        brand: "SuperGains Snacks",
        price: 2.99,
        stock: 98,
        imageUrl: "https://images.unsplash.com/photo-1595575042032-382084a0b6e0?w=400&h=400&fit=crop",
        description: "Barra proteica con auténtica mantequilla de maní y cacahuetes crujientes. 20g de proteína. Combinación perfecta de proteína de suero y proteína de maní. Solo 3g azúcar. Rica en grasas saludables monoinsaturadas. Textura crujiente por fuera, cremosa por dentro. Excelente perfil de saciedad por combinación de proteína, grasas saludables y fibra. Para amantes del peanut butter.",
        categories: ["barra", "snack", "proteina", "mani", "crujiente"],

        nutritionalInfo: {
            servingSize: "60g (1 barra)",
            servingsPerContainer: 1,
            calories: 230,
            protein: 20,
            carbs: 20,
            fats: 9,
            fiber: 10,
            sugar: 3,
            sodium: 250,
            vitamins: [
                { name: "Vitamina E", amount: "4mg", dailyValue: 27 },
                { name: "Niacina", amount: "6mg", dailyValue: 38 }
            ],
            minerals: [
                { name: "Magnesio", amount: "80mg", dailyValue: 19 },
                { name: "Fósforo", amount: "180mg", dailyValue: 14 }
            ]
        },

        ingredients: {
            main: [
                "Mezcla de proteínas (aislado de suero, proteína de maní)",
                "Mantequilla de maní natural (20%)",
                "Cacahuetes tostados (10%)",
                "Fibra soluble de maíz"
            ],
            additives: [
                "Jarabe de tapioca",
                "Glicerina vegetal",
                "Eritritol y monk fruit (edulcorantes)",
                "Sal marina del Himalaya",
                "Sabor natural a mantequilla tostada"
            ],
            allergens: [
                "Contiene maní (cacahuetes) y lácteos",
                "Procesado en instalación que maneja frutos secos y soja",
                "Sin gluten certificado"
            ]
        },

        aminoAcids: [],

        usage: {
            instructions: "Consumir directamente del empaque. No requiere refrigeración. Puedes calentarla 15 segundos para textura más cremosa.",
            dosage: "1 barra como snack o suplemento proteico",
            timing: "Pre-entrenamiento (60 min antes), post-entrenamiento, o snack entre comidas",
            warnings: [
                "Contiene maní - no consumir si eres alérgico",
                "Alto contenido de proteína ayuda a controlar apetito",
                "Grasas saludables de maní para energía sostenida",
                "Verificar fecha de caducidad"
            ]
        },

        productDetails: {
            flavor: "Mantequilla de Maní Crujiente",
            size: "60g",
            weight: "60g",
            servings: 1,
            isVegan: false,
            isGlutenFree: true,
            isLactoseFree: false,
            isSugarFree: false
        }
    },

    // PRODUCTO 15: Protein Cookie
    {
        name: "Protein Cookie - Double Chocolate Fudge",
        brand: "SuperGains Bakery",
        price: 3.49,
        stock: 85,
        imageUrl: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=400&fit=crop",
        description: "Galleta proteica horneada con doble chocolate (cacao oscuro + chispas de chocolate). 16g de proteína por galleta. Textura suave tipo bakery, nada seca. Endulzada con alulosa (edulcorante natural de bajo índice glicémico). Perfecta con café o leche. Cada galleta es como un postre saludable. Horneada en pequeños lotes para frescura. Ideal para satisfacer antojos dulces sin descarrilar tu dieta.",
        categories: ["snack", "galleta", "proteina", "chocolate", "postre"],

        nutritionalInfo: {
            servingSize: "80g (1 galleta grande)",
            servingsPerContainer: 1,
            calories: 280,
            protein: 16,
            carbs: 30,
            fats: 10,
            fiber: 8,
            sugar: 4,
            sodium: 180,
            vitamins: [],
            minerals: [
                { name: "Hierro", amount: "3mg", dailyValue: 17 },
                { name: "Calcio", amount: "150mg", dailyValue: 15 }
            ]
        },

        ingredients: {
            main: [
                "Proteína de suero concentrada",
                "Harina de almendra",
                "Cacao en polvo oscuro (12%)",
                "Chispas de chocolate 70% cacao (15%)",
                "Huevos pasteurizados"
            ],
            additives: [
                "Alulosa (edulcorante natural)",
                "Mantequilla de cacao",
                "Polvo de hornear (sin aluminio)",
                "Extracto de vainilla",
                "Sal marina"
            ],
            allergens: [
                "Contiene lácteos, huevo y almendras",
                "Puede contener trazas de otros frutos secos y soja"
            ]
        },

        aminoAcids: [],

        usage: {
            instructions: "Lista para comer. Disfrutar a temperatura ambiente. Puedes calentarla 15-20 seg para textura recién horneada.",
            dosage: "1 galleta como snack o postre proteico",
            timing: "Post-entrenamiento, postre saludable, snack dulce, o con café",
            warnings: [
                "Contiene edulcorante alulosa (bien tolerado)",
                "Cada galleta es una porción completa",
                "Mejor si se consume el mismo día de abierta",
                "Comparti con alguien si resulta muy saciante"
            ]
        },

        productDetails: {
            flavor: "Doble Chocolate Fudge",
            size: "80g",
            weight: "80g",
            servings: 1,
            isVegan: false,
            isGlutenFree: true,
            isLactoseFree: false,
            isSugarFree: false
        }
    },

    // PRODUCTO 16: Protein Chips
    {
        name: "Protein Chips - BBQ Ahumado",
        brand: "SuperGains Savory",
        price: 2.49,
        stock: 76,
        imageUrl: "https://images.unsplash.com/photo-1600952841320-db92ec4047ca?w=400&h=400&fit=crop",
        description: "Chips proteicos crujientes sabor BBQ ahumado. 15g de proteína por bolsa. Elaborados a base de proteína de soja texturizada y proteína de guisante. Horneados, no fritos. Bajo en carbohidratos (8g netos). Condimento BBQ con especias naturales y pimentón ahumado. Perfecto snack salado cuando quieres algo crujiente pero proteico. Alternativa saludable a papas fritas regulares. Ideal para ver películas o como acompañamiento.",
        categories: ["snack", "chips", "proteina", "salado", "bbq"],

        nutritionalInfo: {
            servingSize: "50g (1 bolsa)",
            servingsPerContainer: 1,
            calories: 180,
            protein: 15,
            carbs: 18,
            fats: 5,
            fiber: 10,
            sugar: 2,
            sodium: 420,
            vitamins: [],
            minerals: [
                { name: "Hierro", amount: "2.5mg", dailyValue: 14 },
                { name: "Potasio", amount: "280mg", dailyValue: 6 }
            ]
        },

        ingredients: {
            main: [
                "Proteína de soja texturizada",
                "Proteína de guisante aislada",
                "Harina de garbanzos",
                "Condimento BBQ (pimentón ahumado, especias, cebolla, ajo)"
            ],
            additives: [
                "Aceite de girasol alto oleico (horneado)",
                "Sal marina",
                "Vinagre en polvo",
                "Azúcar de coco",
                "Extracto de levadura (umami natural)"
            ],
            allergens: [
                "Contiene soja",
                "Puede contener trazas de lácteos y mostaza",
                "Vegano certificado"
            ]
        },

        aminoAcids: [],

        usage: {
            instructions: "Abrir y disfrutar. Chips listos para consumir. Crujientes y sabrosos.",
            dosage: "1 bolsa como snack",
            timing: "Snack de media tarde, con sandwiches, viendo series, o cuando desees algo salado y crujiente",
            warnings: [
                "Alto en sodio - moderar si tienes hipertensión",
                "Horneados, no fritos (más saludables)",
                "Una vez abierto, consumir el mismo día para mantener crocancia",
                "Alternativa proteica a snacks tradicionales"
            ]
        },

        productDetails: {
            flavor: "BBQ Ahumado con especias",
            size: "50g",
            weight: "50g",
            servings: 1,
            isVegan: true,
            isGlutenFree: true,
            isLactoseFree: true,
            isSugarFree: false
        }
    },

    // ==================== CATEGORÍA: VITAMINAS Y SUPLEMENTOS ====================

    // PRODUCTO 17: Multivitamínico Completo
    {
        name: "Multivitamínico Completo - Fórmula Deportista",
        brand: "SuperGains Wellness",
        price: 16.99,
        stock: 62,
        imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop",
        description: "Multivitamínico específicamente formulado para atletas y personas activas. 25 vitaminas y minerales esenciales en dosis óptimas. Incluye complejo B completo para energía, antioxidantes (C, E, selenio) para recuperación, y minerales quelados para mejor absorción. Cápsulas vegetales fáciles de tragar. Una dosis diaria (2 cápsulas) cubre necesidades aumentadas por ejercicio intenso. Sin megadosis peligrosas, todo en rangos seguros.",
        categories: ["vitaminas", "minerales", "salud", "multivitaminico"],

        nutritionalInfo: {
            servingSize: "2 cápsulas",
            servingsPerContainer: 30,
            calories: 10,
            protein: 0,
            carbs: 2,
            fats: 0,
            fiber: 0,
            sugar: 0,
            sodium: 0,
            vitamins: [
                { name: "Vitamina A", amount: "900mcg", dailyValue: 100 },
                { name: "Vitamina C", amount: "200mg", dailyValue: 222 },
                { name: "Vitamina D3", amount: "25mcg", dailyValue: 125 },
                { name: "Vitamina E", amount: "20mg", dailyValue: 133 },
                { name: "Vitamina K", amount: "120mcg", dailyValue: 100 },
                { name: "Tiamina (B1)", amount: "5mg", dailyValue: 417 },
                { name: "Riboflavina (B2)", amount: "5mg", dailyValue: 385 },
                { name: "Niacina (B3)", amount: "25mg", dailyValue: 156 },
                { name: "B6", amount: "10mg", dailyValue: 588 },
                { name: "Ácido Fólico", amount: "400mcg", dailyValue: 100 },
                { name: "B12", amount: "50mcg", dailyValue: 2083 },
                { name: "Biotina", amount: "300mcg", dailyValue: 1000 }
            ],
            minerals: [
                { name: "Calcio", amount: "200mg", dailyValue: 20 },
                { name: "Hierro", amount: "18mg", dailyValue: 100 },
                { name: "Magnesio", amount: "100mg", dailyValue: 24 },
                { name: "Zinc", amount: "15mg", dailyValue: 136 },
                { name: "Selenio", amount: "70mcg", dailyValue: 127 },
                { name: "Cromo", amount: "120mcg", dailyValue: 343 }
            ]
        },

        ingredients: {
            main: [
                "Mezcla de 25 vitaminas y minerales quelados",
                "Extracto de frutas y vegetales (antioxidantes)"
            ],
            additives: [
                "Celulosa microcristalina (agente de volumen)",
                "Estearato de magnesio vegetal",
                "Cápsula vegetal (celulosa)"
            ],
            allergens: [
                "Libre de alérgenos principales",
                "Sin gluten, sin lácteos, sin soja",
                "Apto para vegetarianos y veganos"
            ]
        },

        aminoAcids: [],

        usage: {
            instructions: "Tomar 2 cápsulas al día con alimentos, preferiblemente con desayuno o almuerzo.",
            dosage: "2 cápsulas diarias",
            timing: "Con comida para mejor absorción. Preferiblemente en la mañana.",
            warnings: [
                "No exceder la dosis recomendada",
                "Tomar con alimentos para evitar malestar estomacal",
                "Si tomas otros suplementos, verifica no duplicar dosis",
                "Consultar médico si estás embarazada o bajo medicación"
            ]
        },

        productDetails: {
            flavor: "Sin sabor (cápsulas)",
            size: "60 cápsulas",
            weight: "60 cápsulas",
            servings: 30,
            isVegan: true,
            isGlutenFree: true,
            isLactoseFree: true,
            isSugarFree: true
        }
    },

    // PRODUCTO 18: Omega-3
    {
        name: "Omega-3 Fish Oil 1000mg - Triple Potencia",
        brand: "SuperGains Wellness",
        price: 14.99,
        stock: 55,
        imageUrl: "https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=400&h=400&fit=crop",
        description: "Aceite de pescado ultra concentrado con 1000mg por softgel (600mg EPA + 400mg DHA). Extraído de peces salvajes de aguas frías profundas (anchoveta peruana). Destilación molecular para pureza farmacéutica, libre de metales pesados, PCBs y dioxinas. Soporta salud cardiovascular, función cerebral, reducción de inflamación post-ejercicio y salud articular. Softgels con recubrimiento entérico para evitar reflujo a pescado. Certificado por laboratorios terceros.",
        categories: ["omega-3", "salud", "cardiovascular", "cerebral", "articulaciones"],

        nutritionalInfo: {
            servingSize: "3 softgels",
            servingsPerContainer: 30,
            calories: 30,
            protein: 0,
            carbs: 0,
            fats: 3,
            fiber: 0,
            sugar: 0,
            sodium: 0,
            vitamins: [
                { name: "Vitamina E (añadida)", amount: "10mg", dailyValue: 67 }
            ],
            minerals: []
        },

        ingredients: {
            main: [
                "Aceite de pescado concentrado (anchoveta salvaje)",
                "EPA (Ácido eicosapentaenoico) 600mg",
                "DHA (Ácido docosahexaenoico) 400mg"
            ],
            additives: [
                "Vitamina E natural (antioxidante y preservante)",
                "Softgel (gelatina, glicerina, agua purificada)"
            ],
            allergens: [
                "Contiene pescado",
                "Libre de gluten, lácteos, soja"
            ]
        },

        aminoAcids: [],

        usage: {
            instructions: "Tomar 3 softgels al día con comidas, o según indicación de profesional de salud.",
            dosage: "3 softgels diarios (1000mg EPA+DHA combinados)",
            timing: "Con cualquier comida principal. Distribuir durante el día si lo prefieres.",
            warnings: [
                "Consultar médico si tomas anticoagulantes",
                "Refrigerar después de abrir para mayor frescura",
                "Recubrimiento entérico evita reflujo a pescado",
                "No exceder 5 softgels al día sin supervisión médica"
            ]
        },

        productDetails: {
            flavor: "Sin sabor (softgels recubiertos)",
            size: "90 softgels",
            weight: "90 softgels",
            servings: 30,
            isVegan: false,
            isGlutenFree: true,
            isLactoseFree: true,
            isSugarFree: true
        }
    },

    // PRODUCTO 19: Vitamina D3
    {
        name: "Vitamina D3 5000 IU - Colecalciferol Alta Potencia",
        brand: "SuperGains Wellness",
        price: 11.99,
        stock: 71,
        imageUrl: "https://images.unsplash.com/photo-1550572017-4414e1506611?w=400&h=400&fit=crop",
        description: "Vitamina D3 (colecalciferol) de 5000 IU por softgel. La forma más bioactiva de vitamina D. Esencial para salud ósea, función inmune, estado de ánimo y niveles óptimos de testosterona. Especialmente importante para atletas que entrenan en gimnasios cerrados con poca exposición solar. Softgels pequeños con aceite MCT para absorción superior. Dosis terapéutica alta pero segura. Sin soja, sin gluten. 4 meses de suministro.",
        categories: ["vitaminas", "d3", "inmunidad", "huesos", "hormonal"],

        nutritionalInfo: {
            servingSize: "1 softgel",
            servingsPerContainer: 120,
            calories: 5,
            protein: 0,
            carbs: 0,
            fats: 0.5,
            fiber: 0,
            sugar: 0,
            sodium: 0,
            vitamins: [
                { name: "Vitamina D3 (colecalciferol)", amount: "125mcg (5000 IU)", dailyValue: 625 }
            ],
            minerals: []
        },

        ingredients: {
            main: [
                "Vitamina D3 (colecalciferol de lanolina)"
            ],
            additives: [
                "Aceite MCT (triglicéridos de cadena media de coco)",
                "Softgel (gelatina, glicerina, agua)"
            ],
            allergens: [
                "Derivado de lanolina (lana de oveja)",
                "Libre de gluten, lácteos, soja, maní"
            ]
        },

        aminoAcids: [],

        usage: {
            instructions: "Tomar 1 softgel al día con una comida que contenga grasas para mejor absorción.",
            dosage: "1 softgel diario (5000 IU)",
            timing: "Con comida principal que incluya grasas (desayuno o almuerzo)",
            warnings: [
                "Dosis alta, monitorear niveles sanguíneos si usas largo plazo",
                "No exceder 1 softgel diario sin supervisión",
                "Tomar con grasa para absorción (vitamina liposoluble)",
                "Consultar médico si tienes hipercalcemia o problemas renales"
            ]
        },

        productDetails: {
            flavor: "Sin sabor (softgels)",
            size: "120 softgels",
            weight: "120 softgels",
            servings: 120,
            isVegan: false,
            isGlutenFree: true,
            isLactoseFree: true,
            isSugarFree: true
        }
    },

    // PRODUCTO 20: ZMA (Magnesio + Zinc + B6)
    {
        name: "ZMA - Magnesio + Zinc + Vitamina B6 para Recuperación",
        brand: "SuperGains Sleep & Recovery",
        price: 13.99,
        stock: 48,
        imageUrl: "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400&h=400&fit=crop",
        description: "Fórmula ZMA sinérgica con aspartato de magnesio (450mg), monometionina de zinc (30mg) y vitamina B6 (10.5mg). Mejora calidad del sueño profundo, acelera recuperación muscular, optimiza producción natural de testosterona y hormona de crecimiento durante el sueño. Minerales quelados para absorción superior. Diseñado específicamente para atletas con deficiencias por sudoración intensa. Tomar antes de dormir con estómago semi-vacío.",
        categories: ["minerales", "zma", "recuperacion", "sueño", "testosterona"],

        nutritionalInfo: {
            servingSize: "3 cápsulas",
            servingsPerContainer: 30,
            calories: 0,
            protein: 0,
            carbs: 0,
            fats: 0,
            fiber: 0,
            sugar: 0,
            sodium: 0,
            vitamins: [
                { name: "Vitamina B6 (piridoxina HCl)", amount: "10.5mg", dailyValue: 618 }
            ],
            minerals: [
                { name: "Magnesio (aspartato)", amount: "450mg", dailyValue: 107 },
                { name: "Zinc (L-monometionina)", amount: "30mg", dailyValue: 273 }
            ]
        },

        ingredients: {
            main: [
                "Aspartato de magnesio",
                "L-Monometionina de zinc",
                "Piridoxina HCl (Vitamina B6)"
            ],
            additives: [
                "Celulosa microcristalina",
                "Estearato de magnesio vegetal",
                "Cápsula vegetal (celulosa)"
            ],
            allergens: [
                "Libre de alérgenos principales",
                "Sin gluten, sin lácteos, sin soja",
                "Apto para vegetarianos"
            ]
        },

        aminoAcids: [],

        usage: {
            instructions: "Tomar 3 cápsulas 30-60 minutos antes de dormir con estómago relativamente vacío (al menos 2h después de cena).",
            dosage: "3 cápsulas antes de dormir",
            timing: "30-60 minutos antes de acostarse. NO tomar con lácteos o calcio (compiten por absorción)",
            warnings: [
                "No tomar con productos lácteos o suplementos de calcio",
                "Puede causar sueños más vívidos (efecto de la B6)",
                "Algunos usuarios reportan mejor calidad de sueño",
                "Esperar al menos 2-3 horas después de la última comida"
            ]
        },

        productDetails: {
            flavor: "Sin sabor (cápsulas)",
            size: "90 cápsulas",
            weight: "90 cápsulas",
            servings: 30,
            isVegan: true,
            isGlutenFree: true,
            isLactoseFree: true,
            isSugarFree: true
        }
    },

    // ==================== CATEGORÍA: QUEMADORES Y CONTROL DE PESO ====================

    // PRODUCTO 21: Fat Burner Thermogenic
    {
        name: "Fat Burner Thermogenic - Quemador Termogénico Avanzado",
        brand: "SuperGains Lean",
        price: 27.99,
        stock: 37,
        imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop",
        description: "Quemador de grasa termogénico de nueva generación. Fórmula con extracto de té verde (EGCG 50%), cafeína anhidra, L-carnitina, extracto de café verde, capsaicina y sinefrina. Aumenta metabolismo basal, promueve lipólisis, reduce apetito, y proporciona energía limpia sin crash. Incluye cromo para control de antojos de azúcar. Diseñado para fases de definición o pérdida de grasa. Efecto termogénico notorio. Contiene 200mg cafeína por porción.",
        categories: ["quemador", "termogenico", "perdida-peso", "energia", "definicion"],

        nutritionalInfo: {
            servingSize: "2 cápsulas",
            servingsPerContainer: 30,
            calories: 5,
            protein: 0,
            carbs: 1,
            fats: 0,
            fiber: 0,
            sugar: 0,
            sodium: 0,
            vitamins: [
                { name: "Niacina", amount: "20mg", dailyValue: 125 },
                { name: "Vitamina B6", amount: "5mg", dailyValue: 294 },
                { name: "Vitamina B12", amount: "10mcg", dailyValue: 417 }
            ],
            minerals: [
                { name: "Cromo (picolinato)", amount: "200mcg", dailyValue: 571 }
            ]
        },

        ingredients: {
            main: [
                "Extracto de té verde (50% EGCG) 400mg",
                "Cafeína anhidra 200mg",
                "Acetil L-Carnitina 500mg",
                "Extracto de café verde (45% ácido clorogénico) 200mg",
                "Capsaicina (de pimiento cayena) 50mg",
                "Sinefrina (de naranja amarga) 30mg"
            ],
            additives: [
                "Pimienta negra (Bioperine® para absorción)",
                "Celulosa microcristalina",
                "Estearato de magnesio",
                "Cápsula vegetal"
            ],
            allergens: [
                "Libre de alérgenos principales",
                "Contiene 200mg cafeína por porción"
            ]
        },

        aminoAcids: [],

        usage: {
            instructions: "Tomar 1 cápsula por la mañana con desayuno y 1 cápsula a media tarde. Comenzar con 1 cápsula para evaluar tolerancia.",
            dosage: "2 cápsulas diarias (mañana y tarde)",
            timing: "1ra dosis: Con desayuno. 2da dosis: Media tarde (no después de 4pm)",
            warnings: [
                "Contiene 200mg cafeína - no combinar con café o energizantes",
                "No tomar 6 horas antes de dormir",
                "Efecto termogénico puede causar aumento de temperatura corporal y sudoración",
                "No exceder 2 cápsulas en 24 horas",
                "No apto para menores de 18, embarazadas o personas con problemas cardíacos",
                "Evaluar tolerancia comenzando con 1 cápsula"
            ]
        },

        productDetails: {
            flavor: "Sin sabor (cápsulas)",
            size: "60 cápsulas",
            weight: "60 cápsulas",
            servings: 30,
            isVegan: true,
            isGlutenFree: true,
            isLactoseFree: true,
            isSugarFree: true
        }
    },

    // PRODUCTO 22: CLA
    {
        name: "CLA 1000mg - Ácido Linoleico Conjugado para Definición",
        brand: "SuperGains Lean",
        price: 22.99,
        stock: 42,
        imageUrl: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=400&h=400&fit=crop",
        description: "CLA (Ácido Linoleico Conjugado) 1000mg por softgel, derivado de aceite de cártamo no-GMO. Apoya metabolismo de grasas, ayuda a mantener masa muscular magra durante déficit calórico, y favorece recomposición corporal. Funciona inhibiendo la enzima lipoproteína lipasa que almacena grasa. Ideal para fases de cutting o definición. Sin estimulantes. Se puede combinar con quemadores termogénicos. 90 softgels = 3 meses.",
        categories: ["cla", "definicion", "metabolismo", "recomposicion"],

        nutritionalInfo: {
            servingSize: "3 softgels",
            servingsPerContainer: 30,
            calories: 30,
            protein: 0,
            carbs: 0,
            fats: 3,
            fiber: 0,
            sugar: 0,
            sodium: 0,
            vitamins: [],
            minerals: []
        },

        ingredients: {
            main: [
                "CLA (Ácido Linoleico Conjugado) de aceite de cártamo (80% activo) 3000mg"
            ],
            additives: [
                "Softgel (gelatina, glicerina, agua, caramelo)",
                "Vitamina E natural (conservante)"
            ],
            allergens: [
                "Libre de alérgenos principales",
                "Sin gluten, sin lácteos, sin soja"
            ]
        },

        aminoAcids: [],

        usage: {
            instructions: "Tomar 1 softgel con desayuno, almuerzo y cena (3 softgels diarios con comidas).",
            dosage: "3 softgels al día (3000mg CLA total)",
            timing: "Distribuir durante el día con comidas principales para absorción óptima",
            warnings: [
                "Tomar con comidas que contengan grasas",
                "Los resultados son graduales (8-12 semanas)",
                "No es sustituto de dieta y ejercicio",
                "Combinar con déficit calórico moderado y entrenamiento",
                "Sin efectos estimulantes"
            ]
        },

        productDetails: {
            flavor: "Sin sabor (softgels)",
            size: "90 softgels",
            weight: "90 softgels",
            servings: 30,
            isVegan: false,
            isGlutenFree: true,
            isLactoseFree: true,
            isSugarFree: true
        }
    },

    // PRODUCTO 23: L-Carnitina Líquida
    {
        name: "L-Carnitina Líquida 3000mg - Shot de Energía",
        brand: "SuperGains Lean",
        price: 24.99,
        stock: 34,
        imageUrl: "https://images.unsplash.com/photo-1556911261-6bd341186b2f?w=400&h=400&fit=crop",
        description: "L-Carnitina líquida ultra concentrada con 3000mg por shot. Transporta ácidos grasos a mitocondrias para producción de energía. Mejora rendimiento aeróbico, reduce fatiga muscular, y apoya oxidación de grasas durante cardio. Sabor tropical refrescante. Absorción superior vs. cápsulas (biodisponibilidad 95%). Sin azúcar, con vitaminas del complejo B. Shots individuales portátiles. Perfecta pre-cardio o pre-entrenamiento. 12 shots por caja.",
        categories: ["carnitina", "energia", "liquido", "cardio", "oxidacion-grasas"],

        nutritionalInfo: {
            servingSize: "1 shot (25ml)",
            servingsPerContainer: 12,
            calories: 10,
            protein: 0,
            carbs: 2,
            fats: 0,
            fiber: 0,
            sugar: 0,
            sodium: 10,
            vitamins: [
                { name: "Niacina", amount: "15mg", dailyValue: 94 },
                { name: "Vitamina B6", amount: "2mg", dailyValue: 118 },
                { name: "Vitamina B12", amount: "6mcg", dailyValue: 250 }
            ],
            minerals: []
        },

        ingredients: {
            main: [
                "L-Carnitina L-Tartrato 3000mg"
            ],
            additives: [
                "Agua purificada",
                "Sabor natural tropical (mango-piña)",
                "Ácido cítrico",
                "Sucralosa",
                "Benzoato de sodio (conservante)",
                "Colorante natural"
            ],
            allergens: [
                "Libre de alérgenos",
                "Sin azúcar, sin gluten, sin lácteos",
                "Apto para veganos"
            ]
        },

        aminoAcids: [],

        usage: {
            instructions: "Tomar 1 shot (25ml) 15-30 minutos antes de cardio o entrenamiento. Agitar antes de usar. Consumir directamente o mezclar con agua.",
            dosage: "1 shot al día (3000mg L-Carnitina)",
            timing: "15-30 min pre-entrenamiento o pre-cardio. En días de descanso: en ayunas por la mañana.",
            warnings: [
                "Efecto máximo durante actividad aeróbica",
                "Mejor en ayunas o 2-3h después de comida",
                "Portátil - ideal para llevar al gym",
                "Refrigerar después de abrir",
                "Agitar bien antes de consumir"
            ]
        },

        productDetails: {
            flavor: "Tropical (Mango-Piña)",
            size: "12 shots de 25ml",
            weight: "300ml total",
            servings: 12,
            isVegan: true,
            isGlutenFree: true,
            isLactoseFree: true,
            isSugarFree: true
        }
    },

    // ==================== CATEGORÍA: GANADORES DE PESO ====================

    // PRODUCTO 24: Mass Gainer Chocolate
    {
        name: "Mass Gainer 6lb - Chocolate Supremo",
        brand: "SuperGains Mass",
        price: 54.99,
        stock: 22,
        imageUrl: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400&h=400&fit=crop",
        description: "Ganador de peso premium diseñado para ectomorfos y hardgainers. 1250 calorías por porción con 50g de proteína de suero multi-fase (concentrada, aislada, hidrolizada), 252g de carbohidratos complejos de avena, maltodextrina y arroz integral, y 10g de grasas saludables. Enriquecido con creatina (5g), glutamina (5g), y complejo enzimático digestivo. Ideal para volumen limpio. Sabor chocolate supremo cremoso. Sin azúcares añadidos artificiales.",
        categories: ["mass-gainer", "volumen", "proteina", "chocolate", "hardgainer"],

        nutritionalInfo: {
            servingSize: "334g (2 scoops)",
            servingsPerContainer: 8,
            calories: 1250,
            protein: 50,
            carbs: 252,
            fats: 10,
            fiber: 8,
            sugar: 20,
            sodium: 380,
            vitamins: [
                { name: "Vitamina A", amount: "300mcg", dailyValue: 33 },
                { name: "Vitamina C", amount: "30mg", dailyValue: 33 },
                { name: "Vitamina D", amount: "5mcg", dailyValue: 25 },
                { name: "Vitamina E", amount: "5mg", dailyValue: 33 },
                { name: "Complejo B", amount: "Varios", dailyValue: 50 }
            ],
            minerals: [
                { name: "Calcio", amount: "400mg", dailyValue: 40 },
                { name: "Hierro", amount: "6mg", dailyValue: 33 },
                { name: "Magnesio", amount: "120mg", dailyValue: 29 }
            ]
        },

        ingredients: {
            main: [
                "Mezcla de carbohidratos complejos (avena, maltodextrina, arroz integral)",
                "Mezcla de proteínas (concentrado, aislado e hidrolizado de suero)",
                "Harina de avena instantánea",
                "Cacao en polvo premium"
            ],
            additives: [
                "Creatina monohidratada micronizada 5g",
                "L-Glutamina 5g",
                "MCT en polvo (triglicéridos de cadena media)",
                "Complejo enzimático (amilasa, proteasa, lactasa)",
                "Sabores naturales",
                "Sucralosa, Acesulfamo K"
            ],
            allergens: [
                "Contiene lácteos",
                "Puede contener trazas de soja, huevo, trigo y frutos secos",
                "Procesado en avena (sin gluten pero puede tener trazas)"
            ]
        },

        aminoAcids: [
            { name: "Leucina", amount: "5.2g", perServing: 5200 },
            { name: "Isoleucina", amount: "2.8g", perServing: 2800 },
            { name: "Valina", amount: "2.6g", perServing: 2600 },
            { name: "Glutamina (total)", amount: "13g", perServing: 13000 }
        ],

        usage: {
            instructions: "Mezclar 2 scoops (334g) con 500-700ml de leche entera o agua. Licuar 60 segundos para textura cremosa. Puede dividirse en porciones más pequeñas.",
            dosage: "1-2 porciones diarias según necesidades calóricas (1250-2500 cal)",
            timing: "Post-entrenamiento, entre comidas, o antes de dormir. Puede dividir en 2 batidos de 1 scoop.",
            warnings: [
                "Alto contenido calórico - solo para fase de volumen",
                "Comenzar con 1 scoop si no estás acostumbrado",
                "Contiene enzimas digestivas para evitar pesadez",
                "Beber abundante agua durante el día",
                "No sustituye comidas reales, es un suplemento",
                "Ideal para personas con metabolismo muy rápido"
            ]
        },

        productDetails: {
            flavor: "Chocolate Supremo cremoso",
            size: "6 lbs (2.72 kg)",
            weight: "2720g",
            servings: 8,
            isVegan: false,
            isGlutenFree: false,
            isLactoseFree: false,
            isSugarFree: false
        }
    },

    // PRODUCTO 25: Mass Gainer Vainilla
    {
        name: "Mass Gainer 6lb - Vainilla Cremosa",
        brand: "SuperGains Mass",
        price: 54.99,
        stock: 19,
        imageUrl: "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=400&h=400&fit=crop",
        description: "Ganador de peso sabor vainilla francesa cremosa. Fórmula idéntica a versión chocolate pero con perfil de sabor dulce y suave. 1250 calorías, 50g proteína multi-fase, 252g carbohidratos de liberación gradual (avena + maltodextrina + arroz). Ideal para preparar batidos personalizados agregando frutas, mantequilla de maní, avena extra. Textura ultra cremosa con leche. Perfecto para ectomorfos que necesitan calorías de calidad. Incluye creatina y glutamina.",
        categories: ["mass-gainer", "volumen", "proteina", "vainilla", "hardgainer"],

        nutritionalInfo: {
            servingSize: "334g (2 scoops)",
            servingsPerContainer: 8,
            calories: 1250,
            protein: 50,
            carbs: 252,
            fats: 10,
            fiber: 8,
            sugar: 20,
            sodium: 370,
            vitamins: [
                { name: "Vitamina A", amount: "300mcg", dailyValue: 33 },
                { name: "Vitamina C", amount: "30mg", dailyValue: 33 },
                { name: "Vitamina D", amount: "5mcg", dailyValue: 25 },
                { name: "Vitamina E", amount: "5mg", dailyValue: 33 }
            ],
            minerals: [
                { name: "Calcio", amount: "400mg", dailyValue: 40 },
                { name: "Hierro", amount: "6mg", dailyValue: 33 },
                { name: "Magnesio", amount: "120mg", dailyValue: 29 }
            ]
        },

        ingredients: {
            main: [
                "Mezcla de carbohidratos (avena instantánea, maltodextrina, harina de arroz integral)",
                "Mezcla de proteínas de suero (WPC, WPI, WPH)",
                "Extracto de vainilla natural francesa"
            ],
            additives: [
                "Creatina monohidratada 5g",
                "L-Glutamina 5g",
                "Aceite MCT en polvo",
                "Complejo enzimático digestivo",
                "Sabor natural y artificial a vainilla",
                "Edulcorantes (sucralosa, ace-K)"
            ],
            allergens: [
                "Contiene lácteos",
                "Puede contener soja, huevo, frutos secos",
                "Avena (gluten-free pero procesado con granos)"
            ]
        },

        aminoAcids: [
            { name: "Leucina", amount: "5.2g", perServing: 5200 },
            { name: "Isoleucina", amount: "2.8g", perServing: 2800 },
            { name: "Valina", amount: "2.6g", perServing: 2600 }
        ],

        usage: {
            instructions: "Mezclar 2 scoops (334g) con 600ml de leche entera (adicional 300 cal) o bebida vegetal. Licuar bien. Añade plátano, fresas, mantequilla de maní para más calorías.",
            dosage: "1-2 porciones al día (evaluar según progreso de peso)",
            timing: "Post-entrenamiento (anabólico), entre comidas grandes, o antes de dormir. Dividir dosis si resulta muy abundante.",
            warnings: [
                "Producto hipercalórico - monitorear peso semanalmente",
                "Si ganas grasa rápidamente, reducir dosis o carbohidratos de comidas",
                "Versátil para mezclar con otros ingredientes",
                "Enzimas digestivas incluidas para mejor tolerancia",
                "Tomar abundante agua durante el día",
                "Complementar con alimentación sólida regular"
            ]
        },

        productDetails: {
            flavor: "Vainilla Francesa Cremosa",
            size: "6 lbs (2.72 kg)",
            weight: "2720g",
            servings: 8,
            isVegan: false,
            isGlutenFree: false,
            isLactoseFree: false,
            isSugarFree: false
        }
    },

    // ==================== CATEGORÍA: HIDRATACIÓN Y ELECTROLITOS ====================

    // PRODUCTO 26: Electrolitos + BCAA
    {
        name: "Electrolitos + BCAA - Hidratación Intra-Workout",
        brand: "SuperGains Hydration",
        price: 15.99,
        stock: 58,
        imageUrl: "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=400&h=400&fit=crop",
        description: "Bebida intra-entrenamiento 2-en-1: hidratación + aminoácidos. Mezcla de electrolitos (sodio, potasio, magnesio, calcio) + 5g BCAAs 2:1:1 por porción. Previene calambres, mantiene hidratación óptima, reduce fatiga muscular y protege masa muscular durante entrenamientos largos (>60 min). Sabor sandía refrescante. Cero azúcar, cero calorías. Ideal para entrenamientos intensos, crossfit, running, ciclismo. 30 porciones.",
        categories: ["hidratacion", "electrolitos", "bcaa", "intra-workout", "rendimiento"],

        nutritionalInfo: {
            servingSize: "10g (1 scoop)",
            servingsPerContainer: 30,
            calories: 5,
            protein: 5,
            carbs: 0,
            fats: 0,
            fiber: 0,
            sugar: 0,
            sodium: 250,
            vitamins: [
                { name: "Vitamina C", amount: "50mg", dailyValue: 56 }
            ],
            minerals: [
                { name: "Sodio", amount: "250mg", dailyValue: 11 },
                { name: "Potasio", amount: "120mg", dailyValue: 3 },
                { name: "Magnesio", amount: "50mg", dailyValue: 12 },
                { name: "Calcio", amount: "40mg", dailyValue: 4 }
            ]
        },

        ingredients: {
            main: [
                "BCAAs 2:1:1 (L-Leucina 2.5g, L-Isoleucina 1.25g, L-Valina 1.25g)",
                "Citrato de sodio",
                "Citrato de potasio",
                "Óxido de magnesio",
                "Calcio (carbonato)"
            ],
            additives: [
                "Sabor natural sandía",
                "Ácido cítrico",
                "Ácido málico",
                "Sucralosa",
                "Colorante natural (remolacha)",
                "Dióxido de silicio"
            ],
            allergens: [
                "Libre de todos los alérgenos",
                "Vegano, sin gluten, sin lácteos",
                "Sin azúcar, sin calorías"
            ]
        },

        aminoAcids: [
            { name: "L-Leucina", amount: "2.5g", perServing: 2500 },
            { name: "L-Isoleucina", amount: "1.25g", perServing: 1250 },
            { name: "L-Valina", amount: "1.25g", perServing: 1250 }
        ],

        usage: {
            instructions: "Mezclar 1 scoop (10g) con 500-700ml de agua fría. Beber durante el entrenamiento o actividad física prolongada.",
            dosage: "1 scoop durante entrenamiento",
            timing: "Intra-entrenamiento (durante la sesión). Ideal para entrenamientos >60 minutos, clima cálido, o sudoración intensa.",
            warnings: [
                "Beber a sorbos durante toda la sesión",
                "Ajustar cantidad de agua según preferencia de sabor",
                "Excelente para prevenir calambres",
                "Combinar con agua adicional en climas cálidos",
                "Reemplaza bebidas deportivas comerciales altas en azúcar"
            ]
        },

        productDetails: {
            flavor: "Sandía refrescante",
            size: "300g",
            weight: "300g",
            servings: 30,
            isVegan: true,
            isGlutenFree: true,
            isLactoseFree: true,
            isSugarFree: true
        }
    },

    // PRODUCTO 27: Bebida Isotónica
    {
        name: "Bebida Isotónica en Polvo - Naranja Energizante",
        brand: "SuperGains Hydration",
        price: 11.99,
        stock: 67,
        imageUrl: "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=400&h=400&fit=crop",
        description: "Bebida isotónica clásica para rehidratación rápida. Electrolitos en concentración óptima (330mg sodio, 150mg potasio) + 15g carbohidratos simples por porción para reposición de glucógeno durante ejercicio prolongado. Sabor naranja natural. Osmolalidad similar a plasma sanguíneo para absorción intestinal ultra rápida. Ideal para running, ciclismo, fútbol, tenis. Sin gas. Alternativa económica a bebidas comerciales. Rinde 40 porciones.",
        categories: ["hidratacion", "isotonica", "electrolitos", "carbohidratos", "resistencia"],

        nutritionalInfo: {
            servingSize: "20g",
            servingsPerContainer: 40,
            calories: 60,
            protein: 0,
            carbs: 15,
            fats: 0,
            fiber: 0,
            sugar: 14,
            sodium: 330,
            vitamins: [
                { name: "Vitamina C", amount: "30mg", dailyValue: 33 },
                { name: "Niacina", amount: "8mg", dailyValue: 50 }
            ],
            minerals: [
                { name: "Sodio", amount: "330mg", dailyValue: 14 },
                { name: "Potasio", amount: "150mg", dailyValue: 3 },
                { name: "Magnesio", amount: "20mg", dailyValue: 5 }
            ]
        },

        ingredients: {
            main: [
                "Dextrosa (glucosa)",
                "Sacarosa",
                "Citrato de sodio",
                "Cloruro de potasio",
                "Citrato de magnesio"
            ],
            additives: [
                "Sabor natural de naranja",
                "Ácido cítrico (acidulante)",
                "Colorante natural (beta-caroteno)",
                "Vitamina C (antioxidante)"
            ],
            allergens: [
                "Libre de alérgenos",
                "Sin gluten, sin lácteos",
                "Vegano, sin soja"
            ]
        },

        aminoAcids: [],

        usage: {
            instructions: "Mezclar 1 scoop (20g) con 500ml de agua fría. Agitar bien hasta disolver completamente. Beber frío.",
            dosage: "1-2 porciones durante actividad física prolongada (>90 min)",
            timing: "Durante ejercicios de resistencia (running, ciclismo, deportes de equipo). Empezar a beber desde el minuto 15-20 de actividad.",
            warnings: [
                "Contiene carbohidratos simples (15g) - ideal durante ejercicio, no en reposo",
                "Beber 150-200ml cada 15-20 minutos de actividad",
                "Temperatura ideal: 10-15°C (frío pero no helado)",
                "Para ejercicios <60 min, usar solo electrolitos sin carbohidratos",
                "Post-ejercicio: combinar con proteína"
            ]
        },

        productDetails: {
            flavor: "Naranja natural energizante",
            size: "800g",
            weight: "800g",
            servings: 40,
            isVegan: true,
            isGlutenFree: true,
            isLactoseFree: true,
            isSugarFree: false
        }
    },

    // ==================== CATEGORÍA: ACCESORIOS Y OUTLET ====================

    // PRODUCTO 28: Shaker
    {
        name: "Shaker SuperGains 700ml - Premium con Compartimentos",
        brand: "SuperGains Gear",
        price: 5.99,
        stock: 145,
        imageUrl: "https://images.unsplash.com/photo-1610440042657-612c34d95e9f?w=400&h=400&fit=crop",
        description: "Shaker oficial SuperGains con sistema de mezcla profesional. Capacidad 700ml con marcadores de medición. Incluye bola mezcladora de acero inoxidable, tapa a rosca hermética anti-derrames, y compartimento desmontable para guardar 3 dosis de polvo. Material BPA-free, libre de ftalatos. Apto para lavavajillas. Diseño ergonómico con agarre antideslizante. Logo SuperGains en relieve. Ideal para proteínas, pre-workouts, BCAAs. Colores: Negro con logo plateado.",
        categories: ["accesorio", "shaker", "gym", "practico"],

        nutritionalInfo: {
            servingSize: "N/A",
            servingsPerContainer: 0,
            calories: 0,
            protein: 0,
            carbs: 0,
            fats: 0,
            fiber: 0,
            sugar: 0,
            sodium: 0,
            vitamins: [],
            minerals: []
        },

        ingredients: {
            main: [
                "Plástico Tritan™ libre de BPA",
                "Bola mezcladora de acero inoxidable 304",
                "Silicona grado alimenticio (sello)"
            ],
            additives: [],
            allergens: [
                "N/A - Producto no alimenticio",
                "Materiales seguros para contacto con alimentos"
            ]
        },

        aminoAcids: [],

        usage: {
            instructions: "Agregar líquido primero, luego polvo, cerrar y agitar vigorosamente 20-30 segundos. Lavar después de cada uso.",
            dosage: "N/A",
            timing: "Usar para mezclar cualquier suplemento en polvo",
            warnings: [
                "Lavar con agua tibia y jabón después de cada uso",
                "Apto para lavavajillas (bandeja superior)",
                "No llenar con líquidos >80°C",
                "Compartimento de polvo es desmontable",
                "Verificar que tapa esté bien cerrada antes de agitar"
            ]
        },

        productDetails: {
            flavor: "N/A - Accesorio",
            size: "700ml",
            weight: "150g (peso del shaker)",
            servings: 0,
            isVegan: true,
            isGlutenFree: true,
            isLactoseFree: true,
            isSugarFree: true
        }
    },

    // PRODUCTO 29: Toalla Deportiva
    {
        name: "Toalla Deportiva SuperGains - Microfibra Premium",
        brand: "SuperGains Gear",
        price: 7.99,
        stock: 89,
        imageUrl: "https://images.unsplash.com/photo-1556906918-5f2e11e5f45c?w=400&h=400&fit=crop",
        description: "Toalla deportiva de microfibra ultra absorbente con logo SuperGains bordado. Dimensiones: 40x80cm (tamaño gym perfecto). Absorbe 4x su peso en agua y seca 3x más rápido que toallas de algodón. Ultra compacta, se pliega en bolsa de malla incluida. Antibacteriana, no retiene olores. Suave al tacto. Color negro premium con logo en azul eléctrico. Ideal para gym, crossfit, yoga, running, natación, viajes. Lavable a máquina. Dura años sin desgaste.",
        categories: ["accesorio", "toalla", "gym", "viaje"],

        nutritionalInfo: {
            servingSize: "N/A",
            servingsPerContainer: 0,
            calories: 0,
            protein: 0,
            carbs: 0,
            fats: 0,
            fiber: 0,
            sugar: 0,
            sodium: 0,
            vitamins: [],
            minerals: []
        },

        ingredients: {
            main: [
                "80% poliéster (microfibra)",
                "20% poliamida",
                "Tratamiento antibacteriano de iones de plata"
            ],
            additives: [],
            allergens: [
                "N/A - Producto textil no alimenticio",
                "Materiales hipoalergénicos"
            ]
        },

        aminoAcids: [],

        usage: {
            instructions: "Usar para secar sudor durante y después del entrenamiento. Lavar después de cada uso o cada 2-3 usos según intensidad.",
            dosage: "N/A",
            timing: "Llevar al gym, clases deportivas, o actividades outdoor",
            warnings: [
                "Lavar en máquina con agua fría-tibia (máx 40°C)",
                "No usar suavizante (reduce absorción)",
                "No planchar (microfibra no lo necesita)",
                "Secar al aire o secadora a baja temperatura",
                "Logo bordado de alta durabilidad",
                "Incluye bolsa de malla para transporte"
            ]
        },

        productDetails: {
            flavor: "N/A - Accesorio",
            size: "40cm x 80cm",
            weight: "100g",
            servings: 0,
            isVegan: true,
            isGlutenFree: true,
            isLactoseFree: true,
            isSugarFree: true
        }
    }
];
async function seedAllDetailedProducts() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ Conectado a MongoDB");

        console.log("🗑️  Limpiando productos existentes...");
        await Product.deleteMany({});
        await Inventory.deleteMany({});

        console.log("📦 Insertando productos detallados...");
        const insertedProducts = await Product.insertMany(products);
        console.log(`✅ ${insertedProducts.length} productos detallados insertados`);

        console.log("📊 Creando inventario...");
        for (const product of insertedProducts) {
            await Inventory.create({
                product: product._id,
                availableStock: product.stock,
                reservedStock: 0,
                lastUpdated: new Date()
            });
        }
        console.log("✅ Inventario creado");

        console.log("\n🎉 Seed completado!");
        console.log(`Total: ${insertedProducts.length} productos con información detallada única`);

    } catch (error) {
        console.error("❌ Error:", error);
        throw error;
    } finally {
        await mongoose.disconnect();
        console.log("👋 Desconectado");
    }
}

seedAllDetailedProducts()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

