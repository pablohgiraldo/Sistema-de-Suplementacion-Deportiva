import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useCart } from '../contexts/CartContext.jsx';
import { useInventory, inventoryUtils } from '../hooks/useInventory';
import api from '../services/api';
import WishlistButton from '../components/WishlistButton';

// Imágenes de productos reales para la galería
const sampleProductImages = [
    "https://images.unsplash.com/photo-1594736797933-d0c29d4b2c3e?w=800&h=800&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=800&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=800&h=800&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=800&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1594736797933-d0c29d4b2c3e?w=800&h=800&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=800&h=800&fit=crop&crop=center"
];

// Función para obtener imágenes de la galería
const getProductGalleryImages = (productId) => {
    const seed = productId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const images = [];

    for (let i = 0; i < 4; i++) {
        const index = (seed + i) % sampleProductImages.length;
        images.push(sampleProductImages[index]);
    }

    return images;
};

export default function ProductDetail() {
    const { productId } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const { addToCart, isInCart, getCartItemQuantity, updateQuantity } = useCart();
    const { inventory, loading: inventoryLoading } = useInventory(productId);


    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [selectedFlavor, setSelectedFlavor] = useState('');
    const [selectedSize, setSelectedSize] = useState('');
    const [expandedSections, setExpandedSections] = useState({
        description: false,
        nutritional: false,
        aminoAcids: false,
        ingredients: false,
        usage: false,
        allergens: false,
        storage: false
    });

    const [showReviewForm, setShowReviewForm] = useState(false);
    const [reviewForm, setReviewForm] = useState({
        rating: 5,
        title: '',
        content: '',
        userName: ''
    });
    const [userReviews, setUserReviews] = useState([]);

    // Función para obtener la galería de imágenes
    const galleryImages = useMemo(() => {
        if (!productId) return [];
        return getProductGalleryImages(productId);
    }, [productId]);

    // Función para determinar el badge del producto
    const getProductBadge = useCallback(() => {
        if (!product) return null;
        if (product.isBestseller || product.salesCount > 1000) {
            return { type: 'bestseller', text: 'Bestseller' };
        }
        if (product.isNew || product.createdAt > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) {
            return { type: 'new', text: 'Nuevo Sabor' };
        }
        return null;
    }, [product]);

    // Función para obtener sabores disponibles
    const getAvailableFlavors = useCallback(() => {
        const flavors = [
            'Chocolate', 'Vainilla', 'Fresa', 'Mango', 'Plátano',
            'Coco', 'Café', 'Caramelo', 'Nuez', 'Frutilla'
        ];
        return flavors.slice(0, Math.floor(Math.random() * 5) + 3);
    }, []);

    // Función para obtener tamaños disponibles
    const getAvailableSizes = useCallback(() => {
        return [
            { size: '30g muestra', portions: 1, price: Math.min(product?.price * 0.1, 15) },
            { size: '908g', portions: 30, price: Math.min(product?.price, 89) },
            { size: '2000g bolsa', portions: 66, price: Math.min(product?.price * 2.1, 150) }
        ];
    }, [product]);

    // Función para obtener rating
    const getRating = useCallback(() => {
        if (!productId) return { rating: 4.5, reviewCount: 1000 };
        const seed = productId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const rating = 4.5 + (seed % 50) / 100;
        const reviewCount = Math.floor(1000 + (seed % 9000));
        return { rating: Math.round(rating * 10) / 10, reviewCount };
    }, [productId]);

    // Función para toggle de secciones expandibles
    const toggleSection = useCallback((section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    }, []);

    const handleReviewFormChange = useCallback((field, value) => {
        setReviewForm(prev => ({
            ...prev,
            [field]: value
        }));
    }, []);

    const handleSubmitReview = useCallback((e) => {
        e.preventDefault();

        // Validar formulario
        if (!reviewForm.title.trim() || !reviewForm.content.trim() || !reviewForm.userName.trim()) {
            alert('Por favor, completa todos los campos');
            return;
        }

        // Crear nueva reseña
        const newReview = {
            id: `user-review-${Date.now()}`,
            userName: reviewForm.userName.trim(),
            rating: reviewForm.rating,
            title: reviewForm.title.trim(),
            content: reviewForm.content.trim(),
            verified: false,
            helpful: 0,
            date: new Date(),
            avatar: `https://i.pravatar.cc/100?img=${Math.floor(Math.random() * 70)}`
        };

        // Agregar a la lista de reseñas del usuario
        setUserReviews(prev => [newReview, ...prev]);

        // Aquí normalmente enviarías la reseña al backend
        console.log('Nueva reseña:', newReview);

        // Simular éxito
        alert('¡Gracias por tu reseña! Se ha enviado correctamente.');

        // Limpiar formulario y cerrar
        setReviewForm({
            rating: 5,
            title: '',
            content: '',
            userName: ''
        });
        setShowReviewForm(false);
    }, [reviewForm]);

    const cancelReviewForm = useCallback(() => {
        setReviewForm({
            rating: 5,
            title: '',
            content: '',
            userName: ''
        });
        setShowReviewForm(false);
    }, []);

    // Función para obtener valores nutricionales
    const getNutritionalValues = useCallback(() => {
        if (!productId) return null;
        const seed = productId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

        // Valores nutricionales por porción (30g) - Proteína Gold Whey Standard
        return {
            protein: Math.min(24 + (seed % 2), 26), // 24-26g por porción
            carbohydrates: Math.min(3 + (seed % 1), 4), // 3-4g (principalmente de edulcorantes)
            fats: Math.min(1 + (seed % 1), 2), // 1-2g
            fibres: 0, // Sin fibra
            calories: Math.min(100 + (seed % 20), 120), // 100-120 kcal
            servingSize: 30 // gramos por porción
        };
    }, [productId]);

    // Función para obtener perfil de aminoácidos
    const getAminoAcidProfile = useCallback(() => {
        if (!productId) return null;
        const seed = productId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

        // Perfil de aminoácidos esenciales - valores en mg por porción (30g) - Proteína Gold Whey Standard
        return {
            leucine: Math.round((2000 + (seed % 300)) / 100) * 100, // 2000-2300mg
            isoleucine: Math.round((1200 + (seed % 200)) / 100) * 100, // 1200-1400mg
            valine: Math.round((1300 + (seed % 200)) / 100) * 100, // 1300-1500mg
            lysine: Math.round((1800 + (seed % 300)) / 100) * 100, // 1800-2100mg
            phenylalanine: Math.round((1000 + (seed % 200)) / 100) * 100, // 1000-1200mg
            threonine: Math.round((900 + (seed % 200)) / 100) * 100, // 900-1100mg
            methionine: Math.round((500 + (seed % 100)) / 100) * 100, // 500-600mg
            tryptophan: Math.round((300 + (seed % 100)) / 100) * 100, // 300-400mg
            histidine: Math.round((400 + (seed % 100)) / 100) * 100, // 400-500mg
            servingSize: 30 // gramos por porción
        };
    }, [productId]);

    // Función para obtener lista de ingredientes
    const getIngredients = useCallback(() => {
        // Lista de ingredientes específica para Proteína Gold Whey Standard
        const baseIngredients = [
            "Proteína de suero de leche concentrada (Whey Protein Concentrate)",
            "Proteína de suero de leche aislada (Whey Protein Isolate)",
            "Cacao en polvo desgrasado",
            "Lecitina de girasol (emulgente)",
            "Sal",
            "Aroma natural de chocolate",
            "Edulcorante: Sucralosa",
            "Estabilizador: Goma guar",
            "Colorante: Caramelo (E150c)"
        ];

        return {
            ingredients: baseIngredients,
            origin: "Ingredientes de origen: UE/No UE",
            contentSize: "1kg / 33 porciones de 30g",
            allergens: "Contiene leche. Puede contener trazas de soja y huevo"
        };
    }, []);

    // Función para obtener información de uso recomendado
    const getUsageInstructions = useCallback(() => {
        // Información específica para Proteína Gold Whey Standard
        return {
            productType: "Proteína Gold Whey Standard",
            servingSize: "30g",
            preparation: {
                steps: [
                    "Mezcla 30g (1 scoop) de proteína con 200-250ml de agua, leche o tu bebida favorita",
                    "Agita vigorosamente durante 10-15 segundos en un shaker",
                    "Consume inmediatamente después de la preparación"
                ],
                tips: [
                    "Para mejor textura, usa agua fría o leche fría",
                    "Puedes añadir frutas o avena para crear batidos más completos",
                    "No uses agua hirviendo para preservar las propiedades de la proteína"
                ]
            },
            timing: {
                preWorkout: "30-45 minutos antes del entrenamiento",
                postWorkout: "Inmediatamente después del entrenamiento (ventana anabólica)",
                daily: "Entre comidas como snack proteico"
            },
            dosage: {
                beginners: "1 porción (30g) al día",
                intermediate: "1-2 porciones (30-60g) al día",
                advanced: "2-3 porciones (60-90g) al día"
            },
            storage: "Conservar en lugar fresco y seco, alejado de la luz directa",
            warnings: [
                "No exceder la dosis diaria recomendada",
                "Mantener fuera del alcance de los niños",
                "Consulte a un profesional de la salud si está embarazada, amamantando o tiene alguna condición médica"
            ]
        };
    }, []);

    // Función para obtener información de alérgenos
    const getAllergenInfo = useCallback(() => {
        // Información específica para Proteína Gold Whey Standard
        return {
            mainAllergens: [
                {
                    name: "Leche",
                    icon: "🥛",
                    description: "Contiene proteínas de suero de leche",
                    severity: "Alérgeno principal"
                }
            ],
            possibleTraces: [
                {
                    name: "Soja",
                    icon: "🌱",
                    description: "Puede contener trazas debido al procesamiento",
                    severity: "Trazas"
                },
                {
                    name: "Huevo",
                    icon: "🥚",
                    description: "Puede contener trazas debido al procesamiento",
                    severity: "Trazas"
                }
            ],
            allergenStatement: "Este producto contiene leche. Puede contener trazas de soja y huevo debido al procesamiento compartido.",
            crossContamination: "Fabricado en instalaciones que procesan productos que contienen leche, soja y huevo.",
            certification: "Certificado sin gluten",
            recommendations: [
                "Si eres alérgico a la leche, NO consumas este producto",
                "Si tienes alergias severas, consulta con tu médico antes del consumo",
                "Lee siempre la etiqueta antes de consumir",
                "En caso de reacción alérgica, suspende el consumo inmediatamente"
            ]
        };
    }, []);

    // Función para obtener información de almacenamiento
    const getStorageInfo = useCallback(() => {
        // Información específica para Proteína Gold Whey Standard
        return {
            idealConditions: {
                temperature: "15°C - 25°C (59°F - 77°F)",
                humidity: "Máximo 70% humedad relativa",
                light: "Proteger de la luz directa",
                ventilation: "Lugar bien ventilado"
            },
            recommendedLocations: [
                {
                    location: "Despensa",
                    icon: null,
                    description: "Lugar fresco y seco, alejado de fuentes de calor",
                    tips: ["Mantener en su envase original", "Evitar cambios bruscos de temperatura"]
                },
                {
                    location: "Refrigerador",
                    icon: null,
                    description: "Opcional para mayor duración, pero no necesario",
                    tips: ["Asegurar que esté bien sellado", "Dejar que alcance temperatura ambiente antes de usar"]
                }
            ],
            avoidConditions: [
                {
                    condition: "Calor extremo",
                    icon: null,
                    reason: "Puede degradar las proteínas y afectar la textura"
                },
                {
                    condition: "Humedad alta",
                    icon: null,
                    reason: "Puede causar formación de grumos y deterioro"
                },
                {
                    condition: "Luz directa",
                    icon: null,
                    reason: "Puede afectar la estabilidad de los nutrientes"
                },
                {
                    condition: "Cambios de temperatura",
                    icon: null,
                    reason: "Puede causar condensación y deterioro"
                }
            ],
            containerTips: [
                "Mantener en el envase original con tapa bien cerrada",
                "No transferir a otros recipientes a menos que sea necesario",
                "Usar una cuchara limpia y seca para medir",
                "Evitar introducir humedad en el producto"
            ],
            shelfLife: {
                unopened: "24 meses desde la fecha de fabricación",
                opened: "6 meses después de abrir",
                signs: "Cambio de color, olor extraño, o formación de grumos duros"
            },
            bestPractices: [
                "Rotar el stock (usar primero los productos más antiguos)",
                "Marcar la fecha de apertura en el envase",
                "Verificar regularmente el estado del producto",
                "No mezclar con otros suplementos en el mismo envase"
            ]
        };
    }, []);

    // Función para obtener información de descuentos
    const getDiscountInfo = useCallback(() => {
        if (!productId) return null;
        const seed = productId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

        // Simular diferentes tipos de descuentos basados en el productId
        const hasDiscount = (seed % 3) === 0; // 1 de cada 3 productos tiene descuento

        if (!hasDiscount) {
            return {
                hasDiscount: false,
                originalPrice: null,
                discountPrice: null,
                discountPercentage: 0,
                discountType: null,
                validUntil: null
            };
        }

        // Tipos de descuento posibles
        const discountTypes = [
            { type: "flash", name: "Oferta Flash", icon: "⚡", color: "red" },
            { type: "bundle", name: "Descuento por Volumen", icon: "📦", color: "blue" },
            { type: "loyalty", name: "Cliente Frecuente", icon: "⭐", color: "purple" },
            { type: "seasonal", name: "Oferta Especial", icon: "🎯", color: "green" }
        ];

        const discountType = discountTypes[seed % discountTypes.length];
        const basePrice = 89; // Precio base
        const discountPercentage = 15 + (seed % 20); // 15-35% descuento
        const discountPrice = Math.round(basePrice * (1 - discountPercentage / 100));

        return {
            hasDiscount: true,
            originalPrice: basePrice,
            discountPrice: discountPrice,
            discountPercentage: discountPercentage,
            discountType: discountType,
            validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 días desde ahora
        };
    }, [productId]);

    // Función para obtener reviews de usuarios
    const getProductReviews = useCallback(() => {
        if (!productId) return [];
        const seed = productId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

        // Nombres de usuarios realistas
        const userNames = [
            "María González", "Carlos Rodríguez", "Ana Martínez", "Luis Fernández",
            "Carmen López", "Javier Pérez", "Laura Sánchez", "Diego Martín",
            "Sofía García", "Miguel Hernández", "Elena Ruiz", "Antonio Jiménez",
            "Isabel Torres", "Francisco Vargas", "Lucía Moreno", "Rafael Castro"
        ];

        // Reviews específicas para Proteína Gold Whey Standard
        const reviewTemplates = [
            {
                rating: 5,
                title: "Excelente calidad y sabor",
                content: "La mejor proteína que he probado. Se disuelve perfectamente y el sabor a chocolate es increíble. No deja grumos y se mezcla muy bien con agua o leche.",
                verified: true,
                helpful: 24
            },
            {
                rating: 5,
                title: "Muy recomendada para deportistas",
                content: "Llevo 6 meses usándola y he notado una mejora significativa en mi recuperación muscular. La textura es perfecta y el precio es justo para la calidad que ofrece.",
                verified: true,
                helpful: 18
            },
            {
                rating: 4,
                title: "Buena relación calidad-precio",
                content: "Sabor decente, se disuelve bien. No es la mejor que he probado pero por el precio está muy bien. La recomiendo para principiantes.",
                verified: false,
                helpful: 12
            },
            {
                rating: 5,
                title: "Perfecta para mis objetivos",
                content: "Como atleta de powerlifting, necesito una proteína confiable. Esta cumple todas mis expectativas: buena calidad, buen sabor y resultados visibles.",
                verified: true,
                helpful: 31
            },
            {
                rating: 4,
                title: "Muy buena, pero podría mejorar",
                content: "La proteína es de buena calidad, se disuelve bien y el sabor está bien. Solo le pondría más variedad de sabores para elegir.",
                verified: true,
                helpful: 8
            },
            {
                rating: 5,
                title: "La compro desde hace años",
                content: "Soy cliente fiel de esta marca. La calidad es consistente, el sabor es excelente y siempre llega en perfecto estado. 100% recomendada.",
                verified: true,
                helpful: 42
            }
        ];

        // Generar reviews basadas en el seed
        const reviews = [];
        for (let i = 0; i < 6; i++) {
            const templateIndex = (seed + i) % reviewTemplates.length;
            const template = reviewTemplates[templateIndex];
            const userName = userNames[(seed + i) % userNames.length];
            const daysAgo = 1 + ((seed + i) % 90); // 1-90 días atrás

            reviews.push({
                id: `${productId}-review-${i}`,
                userName: userName,
                rating: template.rating,
                title: template.title,
                content: template.content,
                verified: template.verified,
                helpful: template.helpful,
                date: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
                avatar: `https://i.pravatar.cc/100?img=${(seed + i) % 70}` // Avatar aleatorio pero consistente
            });
        }

        return reviews.sort((a, b) => b.date - a.date); // Ordenar por fecha más reciente
    }, [productId]);

    // Función para obtener todas las reseñas (existentes + del usuario)
    const getAllReviews = useCallback(() => {
        const existingReviews = getProductReviews();
        return [...userReviews, ...existingReviews].sort((a, b) => b.date - a.date);
    }, [getProductReviews, userReviews]);


    // Función para obtener productos frecuentemente comprados juntos
    const getFrequentlyBoughtTogether = useCallback(() => {
        if (!productId) return [];

        // Productos frecuentemente comprados con la Proteína Gold Whey Standard
        const frequentlyBought = [
            {
                id: 'creatine-monohydrate',
                name: 'Creatina Monohidrato',
                variant: 'Polvo puro, 300g',
                price: 45,
                originalPrice: null,
                pricePerUnit: '$150.00 USD/kg',
                image: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400&h=400&fit=crop&crop=center',
                isThisProduct: false,
                isSelected: true
            },
            {
                id: 'bcaa-powder',
                name: 'BCAA en Polvo',
                variant: 'Sabor Frutas del Bosque, 500g',
                price: 55,
                originalPrice: 65,
                pricePerUnit: '$110.00 USD/kg',
                image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop&crop=center',
                isThisProduct: false,
                isSelected: true
            },
            {
                id: 'multivitamin',
                name: 'Multivitamínico Premium',
                variant: '120 cápsulas',
                price: 35,
                originalPrice: null,
                pricePerUnit: '$0.29 USD/cápsula',
                image: 'https://images.unsplash.com/photo-1594736797933-d0c29d4b2c3e?w=400&h=400&fit=crop&crop=center',
                isThisProduct: false,
                isSelected: true
            }
        ];

        return frequentlyBought;
    }, [productId]);

    // Estado para productos seleccionados en "Frequently bought together"
    const [selectedFrequentlyBought, setSelectedFrequentlyBought] = useState(() => {
        return getFrequentlyBoughtTogether().reduce((acc, product) => {
            acc[product.id] = product.isSelected;
            return acc;
        }, {});
    });
    const [showNutritionalOverlay, setShowNutritionalOverlay] = useState(false);
    const [selectedNutritionalPortion, setSelectedNutritionalPortion] = useState('porcion');
    const [showCrossSection, setShowCrossSection] = useState(false);

    // Funciones para manejar el overlay nutricional
    const toggleNutritionalOverlay = useCallback(() => {
        setShowNutritionalOverlay(prev => !prev);
    }, []);

    const closeNutritionalOverlay = useCallback(() => {
        setShowNutritionalOverlay(false);
    }, []);

    // Funciones para manejar la imagen de corte transversal
    const toggleCrossSection = useCallback(() => {
        setShowCrossSection(prev => !prev);
    }, []);

    const closeCrossSection = useCallback(() => {
        setShowCrossSection(false);
    }, []);

    // Función para obtener información de textura del producto
    const getCrossSectionInfo = useCallback(() => {
        if (!productId) return null;

        return {
            title: "Textura y Estructura Interna",
            description: "Descubre la textura fina y homogénea de nuestra proteína en polvo",
            texture: "Polvo fino y homogéneo",
            consistency: "Fácil de mezclar",
            color: "Marrón chocolate uniforme",
            particleSize: "Micro-partículas optimizadas",
            density: "Densidad perfecta para disolución",
            image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&crop=center",
            crossSectionImage: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=800&h=600&fit=crop&crop=center"
        };
    }, [productId]);


    // Función para obtener opciones de porción nutricional
    const getNutritionalPortionOptions = useCallback(() => {
        return [
            { id: 'porcion', label: 'Por porción (30g)', multiplier: 1 },
            { id: '100g', label: 'Por 100g', multiplier: 100 / 30 },
            { id: 'kg', label: 'Por kg', multiplier: 1000 / 30 },
            { id: 'envase', label: 'Por envase (908g)', multiplier: 908 / 30 }
        ];
    }, []);

    // Función para obtener datos nutricionales detallados
    const getDetailedNutritionalData = useCallback(() => {
        if (!productId) return null;

        const baseNutritional = getNutritionalValues();
        if (!baseNutritional) return null;

        const selectedOption = getNutritionalPortionOptions().find(opt => opt.id === selectedNutritionalPortion);
        const multiplier = selectedOption?.multiplier || 1;

        return {
            energy: Math.round(baseNutritional.calories * multiplier),
            protein: Math.round(baseNutritional.protein * multiplier * 10) / 10,
            carbohydrates: Math.round(baseNutritional.carbohydrates * multiplier * 10) / 10,
            fats: Math.round(baseNutritional.fats * multiplier * 10) / 10,
            fibres: Math.round(baseNutritional.fibres * multiplier * 10) / 10,
            salt: Math.round(0.09 * multiplier * 100) / 100,
            sugar: Math.round(baseNutritional.carbohydrates * 0.8 * multiplier * 10) / 10, // Asumiendo 80% son azúcares
            saturatedFat: Math.round(baseNutritional.fats * 0.6 * multiplier * 10) / 10, // Asumiendo 60% son saturadas
            sodium: Math.round(0.036 * multiplier * 1000) / 1000, // 36mg por porción
            potassium: Math.round(150 * multiplier), // 150mg por porción
            calcium: Math.round(200 * multiplier), // 200mg por porción
            iron: Math.round(0.5 * multiplier * 10) / 10, // 0.5mg por porción
            portion: selectedOption?.label || 'Por porción (30g)'
        };
    }, [productId, selectedNutritionalPortion, getNutritionalValues, getNutritionalPortionOptions]);

    // Función para obtener Key Facts del producto
    const getKeyFacts = useCallback(() => {
        if (!productId) return [];

        // Key Facts específicos para Proteína Gold Whey Standard
        const keyFacts = [
            {
                id: 'protein-power',
                title: 'Protein Power',
                subtitle: 'Potencia Proteica',
                description: '30g de proteína de suero de leche de alta calidad por porción',
                icon: (
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                ),
                color: 'purple',
                gradient: 'from-purple-500 to-purple-600',
                bgColor: 'purple-50',
                textColor: 'purple-900'
            },
            {
                id: 'no-added-sugar',
                title: 'No Added Sugar',
                subtitle: 'Sin Azúcar Añadido',
                description: 'Endulzado naturalmente con sucralosa, sin azúcares añadidos',
                icon: (
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                ),
                color: 'green',
                gradient: 'from-green-500 to-green-600',
                bgColor: 'green-50',
                textColor: 'green-900'
            },
            {
                id: 'maximum-key',
                title: 'Maximum Key',
                subtitle: 'Máxima Calidad',
                description: 'Procesado con tecnología avanzada para máxima pureza y absorción',
                icon: (
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                ),
                color: 'yellow',
                gradient: 'from-yellow-500 to-yellow-600',
                bgColor: 'yellow-50',
                textColor: 'yellow-900'
            },
            {
                id: 'many-flavors',
                title: 'Many Flavors',
                subtitle: 'Muchos Sabores',
                description: 'Disponible en múltiples sabores deliciosos para todos los gustos',
                icon: (
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                ),
                color: 'blue',
                gradient: 'from-blue-500 to-blue-600',
                bgColor: 'blue-50',
                textColor: 'blue-900'
            }
        ];

        return keyFacts;
    }, [productId]);


    // Función para alternar selección de producto
    const toggleFrequentlyBoughtSelection = useCallback((productId) => {
        setSelectedFrequentlyBought(prev => ({
            ...prev,
            [productId]: !prev[productId]
        }));
    }, []);

    // Función para calcular precio total
    const getFrequentlyBoughtTotal = useCallback(() => {
        const frequentlyBought = getFrequentlyBoughtTogether();
        const currentProductPrice = product?.price || 89;

        let total = currentProductPrice; // Siempre incluir el producto actual
        let originalTotal = currentProductPrice;

        frequentlyBought.forEach(item => {
            if (selectedFrequentlyBought[item.id]) {
                total += item.price;
                if (item.originalPrice) {
                    originalTotal += item.originalPrice;
                } else {
                    originalTotal += item.price;
                }
            }
        });

        return {
            total: total,
            originalTotal: originalTotal,
            hasDiscount: originalTotal > total
        };
    }, [getFrequentlyBoughtTogether, selectedFrequentlyBought, product]);

    // Función para agregar productos frecuentemente comprados al carrito
    const handleAddFrequentlyBoughtToCart = useCallback(async () => {
        if (!isAuthenticated) {
            alert('Debes iniciar sesión para agregar productos al carrito');
            return;
        }

        const frequentlyBought = getFrequentlyBoughtTogether();
        let successCount = 0;
        let errorCount = 0;

        try {
            // Agregar productos seleccionados
            for (const item of frequentlyBought) {
                if (selectedFrequentlyBought[item.id]) {
                    // Crear objeto producto para el carrito
                    const productToAdd = {
                        _id: item.id,
                        name: item.name,
                        price: item.price,
                        image: item.image,
                        brand: 'SuperGains'
                    };

                    const result = await addToCart(productToAdd, 1);
                    if (result.success) {
                        successCount++;
                    } else {
                        errorCount++;
                        console.error(`Error adding ${item.name}:`, result.error);
                    }
                }
            }

            if (successCount > 0) {
                alert(`¡Excelente! Se agregaron ${successCount} producto${successCount > 1 ? 's' : ''} al carrito${errorCount > 0 ? ` (${errorCount} con error)` : ''}.`);
            } else {
                alert('No se pudo agregar ningún producto al carrito. Inténtalo de nuevo.');
            }
        } catch (error) {
            console.error('Error adding frequently bought products to cart:', error);
            alert('Error al agregar productos al carrito. Inténtalo de nuevo.');
        }
    }, [isAuthenticated, getFrequentlyBoughtTogether, selectedFrequentlyBought, addToCart]);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/products/${productId}`);
                if (response.data.success) {
                    setProduct(response.data.data);
                } else {
                    setError('Producto no encontrado');
                }
            } catch (err) {
                setError('Error al cargar el producto');
                console.error('Error fetching product:', err);
            } finally {
                setLoading(false);
            }
        };

        if (productId) {
            fetchProduct();
        }
    }, [productId]);

    const handleAddToCart = async () => {
        if (!isAuthenticated) {
            alert('Necesitas iniciar sesión para agregar productos al carrito');
            return;
        }

        if (inventoryLoading) {
            alert('Cargando información del producto...');
            return;
        }

        if (!inventoryUtils.canAddToCart(inventory, quantity)) {
            const availableStock = inventory?.availableStock || 0;
            if (availableStock === 0) {
                alert('Este producto está agotado');
            } else {
                alert(`Stock insuficiente. Disponible: ${availableStock} unidades`);
            }
            return;
        }

        try {
            const result = await addToCart(product, quantity);
            if (result.success) {
                alert('Producto agregado al carrito');
            } else {
                alert(result.error || 'Error al agregar al carrito');
            }
        } catch (err) {
            console.error('Error adding to cart:', err);
            alert('Error al agregar al carrito');
        }
    };

    const handleUpdateQuantity = async (newQuantity) => {
        if (newQuantity < 1) {
            await updateQuantity(productId, 0);
            return;
        }

        if (!inventoryUtils.canAddToCart(inventory, newQuantity)) {
            const availableStock = inventory?.availableStock || 0;
            alert(`Stock insuficiente. Disponible: ${availableStock} unidades`);
            return;
        }

        await updateQuantity(productId, newQuantity);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-lg">Cargando producto...</div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Producto no encontrado</h1>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-gray-800 text-white px-6 py-3 rounded-md hover:bg-gray-700"
                    >
                        Volver a la tienda
                    </button>
                </div>
            </div>
        );
    }

    const getStockStatus = () => {
        if (inventoryLoading) return 'Cargando...';
        if (!inventory) return 'No disponible';
        return inventoryUtils.getStockStatus(inventory);
    };

    const getStockStatusColor = () => {
        if (inventoryLoading) return 'bg-gray-100 text-gray-800';
        if (!inventory) return 'bg-gray-100 text-gray-800';
        return inventoryUtils.getStockStatusColor(inventory);
    };

    const getAvailableStock = () => {
        if (inventoryLoading) return 0;
        if (!inventory) return product.stock || 0;
        return inventory.availableStock;
    };

    const canAddToCart = (requestedQuantity = quantity) => {
        if (inventoryLoading) return false;
        if (!inventory) return (product.stock || 0) >= requestedQuantity;
        return inventoryUtils.canAddToCart(inventory, requestedQuantity);
    };

    return (
        <div className="min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto min-h-screen">
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Galería de imágenes - Lado izquierdo */}
                    <div className="lg:w-1/2">
                        <div className="space-y-6">
                            {/* Imagen principal */}
                            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 aspect-[4/3]">
                                <img
                                    src={galleryImages[selectedImageIndex] || product?.imageUrl}
                                    alt={product?.name}
                                    className="w-full h-full object-cover transition-all duration-500"
                                    loading="eager"
                                />

                                {/* Botones de la imagen */}
                                <div className="absolute bottom-4 right-4 flex gap-3">
                                    {/* Botón de corte transversal */}
                                    <button
                                        onClick={toggleCrossSection}
                                        className="w-12 h-12 bg-gray-800 bg-opacity-90 hover:bg-opacity-100 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110"
                                    >
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                        </svg>
                                    </button>

                                    {/* Botón de información nutricional */}
                                    <button
                                        onClick={toggleNutritionalOverlay}
                                        className="w-12 h-12 bg-gray-800 bg-opacity-90 hover:bg-opacity-100 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110"
                                    >
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                    </button>

                                    {/* Botón de zoom */}
                                    <button className="w-12 h-12 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110">
                                        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Thumbnails */}
                            <div className="mt-8">
                                <div className="grid grid-cols-4 gap-4">
                                    {galleryImages.map((image, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setSelectedImageIndex(index)}
                                            className={`relative overflow-hidden rounded-xl aspect-square transition-all duration-300 ${selectedImageIndex === index
                                                ? 'ring-2 ring-blue-500 scale-105'
                                                : 'hover:scale-105 hover:ring-2 hover:ring-gray-300'
                                                }`}
                                        >
                                            <img
                                                src={image}
                                                alt={`${product?.name} ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Información del producto - Lado derecho */}
                    <div className="lg:w-1/2 space-y-8">
                        {/* Badge */}
                        {getProductBadge() && (
                            <div className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${getProductBadge().type === 'bestseller'
                                ? 'bg-black text-white'
                                : 'bg-gray-500 text-white'
                                }`}>
                                {getProductBadge().text}
                            </div>
                        )}

                        {/* Título del producto */}
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 mb-4">
                                {product?.name}
                            </h1>
                            <p className="text-lg text-gray-600 leading-relaxed">
                                {product?.description || 'Descripción del producto no disponible'}
                            </p>
                        </div>

                        {/* Rating */}
                        <div className="flex items-center gap-3">
                            <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                    <svg
                                        key={i}
                                        className={`w-5 h-5 ${i < Math.floor(getRating().rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                ))}
                            </div>
                            <span className="text-gray-600 font-medium">
                                {getRating().rating} ({getRating().reviewCount.toLocaleString()} reviews)
                            </span>
                        </div>

                        {/* Selector de sabor */}
                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-gray-700">
                                Sabor
                            </label>
                            <select
                                value={selectedFlavor}
                                onChange={(e) => setSelectedFlavor(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                            >
                                <option value="">Seleccionar sabor</option>
                                {getAvailableFlavors().map((flavor) => (
                                    <option key={flavor} value={flavor}>
                                        {flavor}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Opciones de tamaño */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700">
                                    Tamaño del contenido
                                </span>
                                <span className="text-sm text-gray-500">
                                    ${(product?.price / 30).toFixed(2)} USD / Porción
                                </span>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                {getAvailableSizes().map((sizeOption, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedSize(sizeOption.size)}
                                        className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${selectedSize === sizeOption.size
                                            ? 'border-black bg-gray-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <div className="font-medium text-gray-900">
                                            {sizeOption.size}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {sizeOption.portions} porciones
                                        </div>
                                        {sizeOption.size === '2000g bolsa' && (
                                            <div className="text-xs text-orange-600 mt-1">
                                                Avisar cuando esté disponible
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Precio */}
                        <div className="space-y-3">
                            {getDiscountInfo()?.hasDiscount ? (
                                <>
                                    {/* Badge de descuento */}
                                    <div className="flex items-center gap-2">
                                        <span className={`px-3 py-1 rounded-full text-sm font-bold text-white ${getDiscountInfo()?.discountType?.color === 'red' ? 'bg-gray-500' :
                                            getDiscountInfo()?.discountType?.color === 'blue' ? 'bg-gray-500' :
                                                getDiscountInfo()?.discountType?.color === 'purple' ? 'bg-gray-500' :
                                                    'bg-gray-500'
                                            }`}>
                                            {getDiscountInfo()?.discountType?.icon} {getDiscountInfo()?.discountType?.name}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            Válido hasta {getDiscountInfo()?.validUntil?.toLocaleDateString()}
                                        </span>
                                    </div>

                                    {/* Precios con descuento */}
                                    <div className="space-y-1">
                                        <div className="flex items-baseline gap-3">
                                            <span className="text-4xl font-bold text-gray-600">
                                                ${getDiscountInfo()?.discountPrice} USD
                                            </span>
                                            <span className="text-2xl font-bold text-gray-400 line-through">
                                                ${getDiscountInfo()?.originalPrice} USD
                                            </span>
                                            <span className="px-2 py-1 bg-green-100 text-green-800 text-sm font-bold rounded-full">
                                                -{getDiscountInfo()?.discountPercentage}%
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            ${(getDiscountInfo()?.discountPrice / 0.908).toFixed(2)} USD/kg, incl. IVA, excl. envío
                                        </div>
                                        <div className="text-sm text-red-600 font-bold">
                                            ¡Ahorras ${(getDiscountInfo()?.originalPrice - getDiscountInfo()?.discountPrice)} USD!
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* Precio normal */}
                                    <div className="text-4xl font-bold text-gray-900">
                                        ${product?.price.toFixed(2)} USD
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        ${(product?.price / 0.908).toFixed(2)} USD/kg, incl. IVA, excl. envío
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Botones de acción */}
                        <div className="flex gap-4">
                            {isInCart(productId) ? (
                                <div className="flex-1 space-y-3">
                                    <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span className="text-green-800 font-medium">
                                                En carrito: {getCartItemQuantity(productId)} unidades
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-center gap-3">
                                        <button
                                            onClick={() => handleUpdateQuantity(getCartItemQuantity(productId) - 1)}
                                            disabled={inventoryLoading}
                                            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                                            </svg>
                                        </button>

                                        <span className="w-16 text-center font-medium text-lg">
                                            {getCartItemQuantity(productId)}
                                        </span>

                                        <button
                                            onClick={() => handleUpdateQuantity(getCartItemQuantity(productId) + 1)}
                                            disabled={inventoryLoading || !canAddToCart(getCartItemQuantity(productId) + 1)}
                                            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={handleAddToCart}
                                    disabled={inventoryLoading || !canAddToCart()}
                                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    Agregar al Carrito
                                </button>
                            )}

                            <WishlistButton
                                productId={productId}
                                productName={product?.name}
                                size="lg"
                            />
                        </div>

                        {/* Información de entrega */}
                        <div className="flex items-center gap-2 text-gray-600">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                            <span className="text-sm">Entrega en 5-7 días hábiles</span>
                        </div>

                        {/* Key Facts */}
                        <div className="mt-12">
                            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">¿Por qué elegir este producto?</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {getKeyFacts().map((fact) => (
                                    <div key={fact.id} className="group">
                                        <div className={`relative p-6 rounded-2xl bg-${fact.bgColor} border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}>
                                            {/* Icono con gradiente */}
                                            <div className={`absolute top-4 right-4 w-16 h-16 bg-gradient-to-br ${fact.gradient} rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                                {fact.icon}
                                            </div>

                                            {/* Contenido */}
                                            <div className="pr-20">
                                                <h4 className={`text-xl font-bold text-${fact.textColor} mb-2`}>
                                                    {fact.title}
                                                </h4>
                                                <p className={`text-sm font-medium text-${fact.textColor} mb-3`}>
                                                    {fact.subtitle}
                                                </p>
                                                <p className="text-gray-700 text-sm leading-relaxed">
                                                    {fact.description}
                                                </p>
                                            </div>

                                            {/* Decoración inferior */}
                                            <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${fact.gradient} rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Secciones expandibles */}
                        <div className="space-y-4 mt-12">
                            {/* Descripción detallada */}
                            <div className="overflow-hidden">
                                <button
                                    onClick={() => toggleSection('description')}
                                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors duration-200"
                                >
                                    <span className="font-bold text-gray-900 text-lg">Descripción</span>
                                    <svg
                                        className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${expandedSections.description ? 'rotate-180' : ''
                                            }`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${expandedSections.description ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
                                    }`}>
                                    <div className="px-6 pb-6 border-t border-gray-100">
                                        <div className="pt-4 space-y-4">
                                            {/* Goals section */}
                                            <div>
                                                <div className="flex items-center gap-2 mb-3">
                                                    <span className="text-sm font-medium text-gray-700">Objetivos</span>
                                                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                                        Vida saludable
                                                    </span>
                                                </div>
                                                <p className="text-gray-600 leading-relaxed">
                                                    {product?.description || 'Descripción detallada del producto no disponible. Este suplemento está diseñado para apoyar tus objetivos de fitness y nutrición.'}
                                                </p>
                                            </div>

                                            {/* Key benefits */}
                                            <div>
                                                <h4 className="font-semibold text-gray-900 mb-3">Beneficios clave</h4>
                                                <ul className="space-y-2">
                                                    <li className="flex items-start gap-3">
                                                        <svg className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                        <span className="text-gray-600">Nuestra proteína más vendida</span>
                                                    </li>
                                                    <li className="flex items-start gap-3">
                                                        <svg className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                        <span className="text-gray-600">Hasta 15g de proteína por porción</span>
                                                    </li>
                                                    <li className="flex items-start gap-3">
                                                        <svg className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                        <span className="text-gray-600">Sin azúcares añadidos</span>
                                                    </li>
                                                    <li className="flex items-start gap-3">
                                                        <svg className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                        <span className="text-gray-600">Apoya la construcción y mantenimiento muscular</span>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Placeholder para las próximas secciones */}
                            <div className="overflow-hidden">
                                <button
                                    onClick={() => toggleSection('nutritional')}
                                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors duration-200"
                                >
                                    <span className="font-bold text-gray-900 text-lg">Tabla nutricional detallada</span>
                                    <svg
                                        className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${expandedSections.nutritional ? 'rotate-180' : ''
                                            }`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${expandedSections.nutritional ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
                                    }`}>
                                    <div className="px-6 pb-6 border-t border-gray-100">
                                        <div className="pt-4 space-y-6">
                                            {/* Selector de porción */}
                                            <div className="bg-gray-50 rounded-xl p-4">
                                                <h4 className="font-semibold text-gray-900 mb-3">Selecciona la porción de referencia</h4>
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                                    {getNutritionalPortionOptions().map((option) => (
                                                        <button
                                                            key={option.id}
                                                            onClick={() => setSelectedNutritionalPortion(option.id)}
                                                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${selectedNutritionalPortion === option.id
                                                                ? 'bg-gray-800 text-white shadow-md'
                                                                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
                                                                }`}
                                                        >
                                                            {option.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Tabla nutricional completa */}
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="font-semibold text-gray-900">
                                                        Información nutricional
                                                    </h4>
                                                    <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                                                        {getDetailedNutritionalData()?.portion}
                                                    </span>
                                                </div>

                                                <div className="overflow-hidden border border-gray-200 rounded-lg">
                                                    <table className="w-full">
                                                        <thead className="bg-gray-50">
                                                            <tr>
                                                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Nutriente</th>
                                                                <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">Cantidad</th>
                                                                <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">Unidad</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-200">
                                                            {/* Macronutrientes */}
                                                            <tr className="bg-gray-50">
                                                                <td className="px-4 py-3 text-sm font-medium text-gray-900">Energía</td>
                                                                <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">{getDetailedNutritionalData()?.energy}</td>
                                                                <td className="px-4 py-3 text-sm text-gray-600 text-right">kcal</td>
                                                            </tr>
                                                            <tr className="bg-gray-50">
                                                                <td className="px-4 py-3 text-sm font-medium text-gray-900">Proteína</td>
                                                                <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">{getDetailedNutritionalData()?.protein}</td>
                                                                <td className="px-4 py-3 text-sm text-gray-600 text-right">g</td>
                                                            </tr>
                                                            <tr>
                                                                <td className="px-4 py-3 text-sm text-gray-700">Carbohidratos</td>
                                                                <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">{getDetailedNutritionalData()?.carbohydrates}</td>
                                                                <td className="px-4 py-3 text-sm text-gray-600 text-right">g</td>
                                                            </tr>
                                                            <tr className="bg-gray-50">
                                                                <td className="px-4 py-3 text-sm text-gray-700">- de los cuales azúcares</td>
                                                                <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">{getDetailedNutritionalData()?.sugar}</td>
                                                                <td className="px-4 py-3 text-sm text-gray-600 text-right">g</td>
                                                            </tr>
                                                            <tr>
                                                                <td className="px-4 py-3 text-sm text-gray-700">Grasas</td>
                                                                <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">{getDetailedNutritionalData()?.fats}</td>
                                                                <td className="px-4 py-3 text-sm text-gray-600 text-right">g</td>
                                                            </tr>
                                                            <tr className="bg-gray-50">
                                                                <td className="px-4 py-3 text-sm text-gray-700">- de las cuales saturadas</td>
                                                                <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">{getDetailedNutritionalData()?.saturatedFat}</td>
                                                                <td className="px-4 py-3 text-sm text-gray-600 text-right">g</td>
                                                            </tr>
                                                            <tr>
                                                                <td className="px-4 py-3 text-sm text-gray-700">Fibras</td>
                                                                <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">{getDetailedNutritionalData()?.fibres}</td>
                                                                <td className="px-4 py-3 text-sm text-gray-600 text-right">g</td>
                                                            </tr>
                                                            <tr className="bg-gray-50">
                                                                <td className="px-4 py-3 text-sm text-gray-700">Sal</td>
                                                                <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">{getDetailedNutritionalData()?.salt}</td>
                                                                <td className="px-4 py-3 text-sm text-gray-600 text-right">g</td>
                                                            </tr>

                                                            {/* Separador */}
                                                            <tr>
                                                                <td colSpan="3" className="px-4 py-2">
                                                                    <div className="border-t border-gray-300"></div>
                                                                </td>
                                                            </tr>

                                                            {/* Micronutrientes */}
                                                            <tr>
                                                                <td className="px-4 py-3 text-sm text-gray-700">Sodio</td>
                                                                <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">{getDetailedNutritionalData()?.sodium}</td>
                                                                <td className="px-4 py-3 text-sm text-gray-600 text-right">g</td>
                                                            </tr>
                                                            <tr className="bg-gray-50">
                                                                <td className="px-4 py-3 text-sm text-gray-700">Potasio</td>
                                                                <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">{getDetailedNutritionalData()?.potassium}</td>
                                                                <td className="px-4 py-3 text-sm text-gray-600 text-right">mg</td>
                                                            </tr>
                                                            <tr>
                                                                <td className="px-4 py-3 text-sm text-gray-700">Calcio</td>
                                                                <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">{getDetailedNutritionalData()?.calcium}</td>
                                                                <td className="px-4 py-3 text-sm text-gray-600 text-right">mg</td>
                                                            </tr>
                                                            <tr className="bg-gray-50">
                                                                <td className="px-4 py-3 text-sm text-gray-700">Hierro</td>
                                                                <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">{getDetailedNutritionalData()?.iron}</td>
                                                                <td className="px-4 py-3 text-sm text-gray-600 text-right">mg</td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>

                                                {/* Nota informativa */}
                                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                                    <div className="flex items-start gap-3">
                                                        <svg className="w-5 h-5 text-amber-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                        </svg>
                                                        <div>
                                                            <h5 className="font-medium text-gray-800 mb-1">Información importante</h5>
                                                            <p className="text-sm text-gray-700">
                                                                Los valores nutricionales pueden variar ligeramente según el sabor seleccionado.
                                                                Esta información se basa en el análisis nutricional promedio del producto.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="overflow-hidden">
                                <button
                                    onClick={() => toggleSection('ingredients')}
                                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors duration-200"
                                >
                                    <span className="font-bold text-gray-900 text-lg">Ingredientes</span>
                                    <svg
                                        className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${expandedSections.ingredients ? 'rotate-180' : ''
                                            }`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${expandedSections.ingredients ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
                                    }`}>
                                    <div className="px-6 pb-6 border-t border-gray-100">
                                        <div className="pt-4 space-y-4">
                                            {/* Información del contenido */}
                                            <div className="bg-gray-50 rounded-xl p-4">
                                                <h4 className="font-semibold text-gray-900 mb-2">Contenido del paquete</h4>
                                                <p className="text-sm text-gray-600">{getIngredients()?.contentSize}</p>
                                                <p className="text-xs text-gray-500 mt-1">{getIngredients()?.origin}</p>
                                            </div>

                                            {/* Lista de ingredientes */}
                                            <div className="space-y-3">
                                                <h4 className="font-semibold text-gray-900">Ingredientes:</h4>
                                                <div className="space-y-2">
                                                    {getIngredients()?.ingredients.map((ingredient, index) => (
                                                        <div key={index} className="flex items-start gap-3">
                                                            <span className="text-orange-600 font-bold text-sm mt-0.5 flex-shrink-0">
                                                                {index + 1}.
                                                            </span>
                                                            <span className="text-sm text-gray-700 leading-relaxed">
                                                                {ingredient}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Información de alérgenos */}
                                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                                <div className="flex items-start gap-3">
                                                    <svg className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                    <div>
                                                        <h5 className="font-medium text-gray-900 mb-1">Información sobre alérgenos</h5>
                                                        <p className="text-sm text-red-700">{getIngredients()?.allergens}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Información nutricional adicional */}
                                            <div className="bg-gray-50 rounded-xl p-4">
                                                <h5 className="font-medium text-gray-900 mb-2">Información nutricional destacada</h5>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                        <span className="text-green-800">Sin azúcares añadidos</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                        <span className="text-green-800">Alto contenido proteico</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                        <span className="text-green-800">Con colágeno</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                        <span className="text-green-800">Edulcorantes naturales</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Perfil de aminoácidos */}
                            <div className="overflow-hidden">
                                <button
                                    onClick={() => toggleSection('aminoAcids')}
                                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors duration-200"
                                >
                                    <span className="font-bold text-gray-900 text-lg">Perfil de aminoácidos</span>
                                    <svg
                                        className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${expandedSections.aminoAcids ? 'rotate-180' : ''
                                            }`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${expandedSections.aminoAcids ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
                                    }`}>
                                    <div className="px-6 pb-6 border-t border-gray-100">
                                        <div className="pt-4 space-y-4">
                                            {/* Información del perfil */}
                                            <div className="bg-gray-50 rounded-xl p-4">
                                                <h4 className="font-semibold text-gray-900 mb-2">Aminoácidos esenciales por porción {getAminoAcidProfile()?.servingSize}g</h4>
                                                <p className="text-sm text-gray-600">
                                                    Los aminoácidos esenciales son componentes fundamentales de las proteínas que el cuerpo no puede producir por sí solo.
                                                </p>
                                            </div>

                                            {/* Perfil de aminoácidos con barras */}
                                            <div className="space-y-4">
                                                {/* Leucina */}
                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm font-medium text-gray-700">Leucina*</span>
                                                        <span className="text-sm font-bold text-gray-900">{getAminoAcidProfile()?.leucine}mg</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className="bg-gray-800 h-2 rounded-full transition-all duration-500"
                                                            style={{ width: `${(getAminoAcidProfile()?.leucine / 3200) * 100}%` }}
                                                        ></div>
                                                    </div>
                                                </div>

                                                {/* Isoleucina */}
                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm font-medium text-gray-700">Isoleucina*</span>
                                                        <span className="text-sm font-bold text-gray-900">{getAminoAcidProfile()?.isoleucine}mg</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className="bg-gray-500 h-2 rounded-full transition-all duration-500"
                                                            style={{ width: `${(getAminoAcidProfile()?.isoleucine / 1900) * 100}%` }}
                                                        ></div>
                                                    </div>
                                                </div>

                                                {/* Valina */}
                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm font-medium text-gray-700">Valina*</span>
                                                        <span className="text-sm font-bold text-gray-900">{getAminoAcidProfile()?.valine}mg</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className="bg-gray-500 h-2 rounded-full transition-all duration-500"
                                                            style={{ width: `${(getAminoAcidProfile()?.valine / 2000) * 100}%` }}
                                                        ></div>
                                                    </div>
                                                </div>

                                                {/* Lisina */}
                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm font-medium text-gray-700">Lisina*</span>
                                                        <span className="text-sm font-bold text-gray-900">{getAminoAcidProfile()?.lysine}mg</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className="bg-gray-500 h-2 rounded-full transition-all duration-500"
                                                            style={{ width: `${(getAminoAcidProfile()?.lysine / 2800) * 100}%` }}
                                                        ></div>
                                                    </div>
                                                </div>

                                                {/* Fenilalanina */}
                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm font-medium text-gray-700">Fenilalanina*</span>
                                                        <span className="text-sm font-bold text-gray-900">{getAminoAcidProfile()?.phenylalanine}mg</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className="bg-gray-700 h-2 rounded-full transition-all duration-500"
                                                            style={{ width: `${(getAminoAcidProfile()?.phenylalanine / 1600) * 100}%` }}
                                                        ></div>
                                                    </div>
                                                </div>

                                                {/* Treonina */}
                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm font-medium text-gray-700">Treonina*</span>
                                                        <span className="text-sm font-bold text-gray-900">{getAminoAcidProfile()?.threonine}mg</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className="bg-gray-700 h-2 rounded-full transition-all duration-500"
                                                            style={{ width: `${(getAminoAcidProfile()?.threonine / 1500) * 100}%` }}
                                                        ></div>
                                                    </div>
                                                </div>

                                                {/* Metionina */}
                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm font-medium text-gray-700">Metionina*</span>
                                                        <span className="text-sm font-bold text-gray-900">{getAminoAcidProfile()?.methionine}mg</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className="bg-gray-600 h-2 rounded-full transition-all duration-500"
                                                            style={{ width: `${(getAminoAcidProfile()?.methionine / 900) * 100}%` }}
                                                        ></div>
                                                    </div>
                                                </div>

                                                {/* Triptófano */}
                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm font-medium text-gray-700">Triptófano*</span>
                                                        <span className="text-sm font-bold text-gray-900">{getAminoAcidProfile()?.tryptophan}mg</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className="bg-gray-600 h-2 rounded-full transition-all duration-500"
                                                            style={{ width: `${(getAminoAcidProfile()?.tryptophan / 500) * 100}%` }}
                                                        ></div>
                                                    </div>
                                                </div>

                                                {/* Histidina */}
                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm font-medium text-gray-700">Histidina*</span>
                                                        <span className="text-sm font-bold text-gray-900">{getAminoAcidProfile()?.histidine}mg</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className="bg-gray-600 h-2 rounded-full transition-all duration-500"
                                                            style={{ width: `${(getAminoAcidProfile()?.histidine / 800) * 100}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Información adicional */}
                                            <div className="bg-gray-50 rounded-xl p-4">
                                                <h5 className="font-medium text-gray-900 mb-2">Beneficios de los aminoácidos esenciales</h5>
                                                <ul className="space-y-1 text-sm text-gray-600">
                                                    <li>• <strong>Leucina:</strong> Estimula la síntesis de proteínas musculares</li>
                                                    <li>• <strong>Isoleucina y Valina:</strong> Proporcionan energía durante el ejercicio</li>
                                                    <li>• <strong>Lisina:</strong> Importante para la absorción de calcio y colágeno</li>
                                                    <li>• <strong>BCAA:</strong> Leucina, Isoleucina y Valina trabajan juntos para el desarrollo muscular</li>
                                                </ul>
                                                <p className="text-xs text-gray-500 mt-3">*Por porción {getAminoAcidProfile()?.servingSize}g</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Uso recomendado */}
                            <div className="overflow-hidden">
                                <button
                                    onClick={() => toggleSection('usage')}
                                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors duration-200"
                                >
                                    <span className="font-bold text-gray-900 text-lg">Uso recomendado</span>
                                    <svg
                                        className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${expandedSections.usage ? 'rotate-180' : ''
                                            }`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${expandedSections.usage ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
                                    }`}>
                                    <div className="px-6 pb-6 border-t border-gray-100">
                                        <div className="pt-4 space-y-6">
                                            {/* Información del producto */}
                                            <div className="bg-gray-50 rounded-xl p-4">
                                                <h4 className="font-semibold text-gray-900 mb-2">{getUsageInstructions()?.productType}</h4>
                                                <p className="text-sm text-gray-600">Porción recomendada: {getUsageInstructions()?.servingSize}</p>
                                            </div>

                                            {/* Preparación */}
                                            <div className="space-y-4">
                                                <h4 className="font-semibold text-gray-900">Preparación</h4>
                                                <div className="space-y-3">
                                                    {getUsageInstructions()?.preparation.steps.map((step, index) => (
                                                        <div key={index} className="flex items-start gap-3">
                                                            <div className="w-6 h-6 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                                                                {index + 1}
                                                            </div>
                                                            <span className="text-sm text-gray-700 leading-relaxed">{step}</span>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Consejos */}
                                                <div className="bg-gray-50 rounded-lg p-4">
                                                    <h5 className="font-medium text-gray-900 mb-2">Consejos útiles</h5>
                                                    <ul className="space-y-1">
                                                        {getUsageInstructions()?.preparation.tips.map((tip, index) => (
                                                            <li key={index} className="text-sm text-gray-600">• {tip}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>

                                            {/* Momento de consumo */}
                                            <div className="space-y-4">
                                                <h4 className="font-semibold text-gray-900">Momento de consumo</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div className="bg-gray-50 rounded-lg p-4">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                            </svg>
                                                            <span className="font-medium text-gray-900">Pre-entrenamiento</span>
                                                        </div>
                                                        <p className="text-sm text-green-700">{getUsageInstructions()?.timing.preWorkout}</p>
                                                    </div>

                                                    <div className="bg-gray-50 rounded-lg p-4">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            <span className="font-medium text-gray-900">Post-entrenamiento</span>
                                                        </div>
                                                        <p className="text-sm text-gray-700">{getUsageInstructions()?.timing.postWorkout}</p>
                                                    </div>

                                                    <div className="bg-gray-50 rounded-lg p-4">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            <span className="font-medium text-orange-900">Snack diario</span>
                                                        </div>
                                                        <p className="text-sm text-orange-700">{getUsageInstructions()?.timing.daily}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Dosificación */}
                                            <div className="space-y-4">
                                                <h4 className="font-semibold text-gray-900">Dosificación recomendada</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div className="border border-gray-200 rounded-lg p-4">
                                                        <h5 className="font-medium text-gray-900 mb-2">Principiante</h5>
                                                        <p className="text-sm text-gray-600">{getUsageInstructions()?.dosage.beginners}</p>
                                                    </div>
                                                    <div className="border border-gray-200 rounded-lg p-4">
                                                        <h5 className="font-medium text-gray-900 mb-2">Intermedio</h5>
                                                        <p className="text-sm text-gray-600">{getUsageInstructions()?.dosage.intermediate}</p>
                                                    </div>
                                                    <div className="border border-gray-200 rounded-lg p-4">
                                                        <h5 className="font-medium text-gray-900 mb-2">Avanzado</h5>
                                                        <p className="text-sm text-gray-600">{getUsageInstructions()?.dosage.advanced}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Almacenamiento */}
                                            <div className="bg-gray-50 rounded-lg p-4">
                                                <div className="flex items-start gap-3">
                                                    <svg className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                    </svg>
                                                    <div>
                                                        <h5 className="font-medium text-gray-900 mb-1">Almacenamiento</h5>
                                                        <p className="text-sm text-yellow-700">{getUsageInstructions()?.storage}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Advertencias */}
                                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                                <div className="flex items-start gap-3">
                                                    <svg className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                    <div>
                                                        <h5 className="font-medium text-gray-900 mb-2">Advertencias importantes</h5>
                                                        <ul className="space-y-1">
                                                            {getUsageInstructions()?.warnings.map((warning, index) => (
                                                                <li key={index} className="text-sm text-red-700">• {warning}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Alérgenos */}
                            <div className="overflow-hidden">
                                <button
                                    onClick={() => toggleSection('allergens')}
                                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors duration-200"
                                >
                                    <span className="font-bold text-gray-900 text-lg">Alérgenos</span>
                                    <svg
                                        className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${expandedSections.allergens ? 'rotate-180' : ''
                                            }`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${expandedSections.allergens ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
                                    }`}>
                                    <div className="px-6 pb-6 border-t border-gray-100">
                                        <div className="pt-4 space-y-6">
                                            {/* Declaración principal de alérgenos */}
                                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                                <div className="flex items-start gap-3">
                                                    <svg className="w-6 h-6 text-gray-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900 mb-2">⚠️ Información sobre alérgenos</h4>
                                                        <p className="text-sm text-red-700 leading-relaxed">
                                                            {getAllergenInfo()?.allergenStatement}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Alérgenos principales */}
                                            <div className="space-y-4">
                                                <h4 className="font-semibold text-gray-900">Alérgenos principales</h4>
                                                <div className="grid grid-cols-1 gap-4">
                                                    {getAllergenInfo()?.mainAllergens.map((allergen, index) => (
                                                        <div key={index} className="bg-gray-100 rounded-lg p-4 border border-gray-300">
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-2xl">{allergen.icon}</span>
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-2">
                                                                        <h5 className="font-semibold text-gray-900">{allergen.name}</h5>
                                                                        <span className="px-2 py-1 bg-red-200 text-red-800 text-xs font-medium rounded-full">
                                                                            {allergen.severity}
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-sm text-red-700 mt-1">{allergen.description}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Posibles trazas */}
                                            <div className="space-y-4">
                                                <h4 className="font-semibold text-gray-900">Posibles trazas</h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    {getAllergenInfo()?.possibleTraces.map((allergen, index) => (
                                                        <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-xl">{allergen.icon}</span>
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-2">
                                                                        <h5 className="font-medium text-gray-900">{allergen.name}</h5>
                                                                        <span className="px-2 py-1 bg-yellow-200 text-yellow-800 text-xs font-medium rounded-full">
                                                                            {allergen.severity}
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-xs text-yellow-700 mt-1">{allergen.description}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Información adicional */}
                                            <div className="space-y-4">
                                                <h4 className="font-semibold text-gray-900">Información adicional</h4>

                                                <div className="bg-gray-50 rounded-lg p-4">
                                                    <div className="flex items-start gap-3">
                                                        <svg className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        <div>
                                                            <h5 className="font-medium text-gray-900 mb-1">Contaminación cruzada</h5>
                                                            <p className="text-sm text-gray-700">{getAllergenInfo()?.crossContamination}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="bg-gray-50 rounded-lg p-4">
                                                    <div className="flex items-start gap-3">
                                                        <svg className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                        <div>
                                                            <h5 className="font-medium text-gray-900 mb-1">Certificación</h5>
                                                            <p className="text-sm text-green-700">{getAllergenInfo()?.certification}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Recomendaciones importantes */}
                                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                                <div className="flex items-start gap-3">
                                                    <svg className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                                    </svg>
                                                    <div>
                                                        <h5 className="font-medium text-orange-900 mb-2">Recomendaciones importantes</h5>
                                                        <ul className="space-y-1">
                                                            {getAllergenInfo()?.recommendations.map((recommendation, index) => (
                                                                <li key={index} className="text-sm text-orange-700 flex items-start gap-2">
                                                                    <span className="text-orange-600 mt-1">•</span>
                                                                    <span>{recommendation}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Instrucciones de almacenamiento */}
                            <div className="overflow-hidden">
                                <button
                                    onClick={() => toggleSection('storage')}
                                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors duration-200"
                                >
                                    <span className="font-bold text-gray-900 text-lg">Instrucciones de almacenamiento</span>
                                    <svg
                                        className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${expandedSections.storage ? 'rotate-180' : ''
                                            }`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${expandedSections.storage ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
                                    }`}>
                                    <div className="px-6 pb-6 border-t border-gray-100">
                                        <div className="pt-4 space-y-6">
                                            {/* Condiciones ideales */}
                                            <div className="bg-gray-50 rounded-xl p-4">
                                                <h4 className="font-semibold text-gray-900 mb-4">Condiciones ideales de almacenamiento</h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div className="flex items-center gap-3">
                                                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                        </svg>
                                                        <div>
                                                            <span className="text-sm font-medium text-gray-700">Temperatura:</span>
                                                            <span className="text-sm text-gray-900 ml-1">{getStorageInfo()?.idealConditions.temperature}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                                                        </svg>
                                                        <div>
                                                            <span className="text-sm font-medium text-gray-700">Humedad:</span>
                                                            <span className="text-sm text-gray-900 ml-1">{getStorageInfo()?.idealConditions.humidity}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                                        </svg>
                                                        <div>
                                                            <span className="text-sm font-medium text-gray-700">Luz:</span>
                                                            <span className="text-sm text-gray-900 ml-1">{getStorageInfo()?.idealConditions.light}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2" />
                                                        </svg>
                                                        <div>
                                                            <span className="text-sm font-medium text-gray-700">Ventilación:</span>
                                                            <span className="text-sm text-gray-900 ml-1">{getStorageInfo()?.idealConditions.ventilation}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Lugares recomendados */}
                                            <div className="space-y-4">
                                                <h4 className="font-semibold text-gray-900">📍 Lugares recomendados</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {getStorageInfo()?.recommendedLocations.map((location, index) => (
                                                        <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                                            <div className="flex items-start gap-3">
                                                                <span className="text-2xl">{location.icon}</span>
                                                                <div className="flex-1">
                                                                    <h5 className="font-semibold text-gray-900 mb-1">{location.location}</h5>
                                                                    <p className="text-sm text-gray-700 mb-2">{location.description}</p>
                                                                    <ul className="space-y-1">
                                                                        {location.tips.map((tip, tipIndex) => (
                                                                            <li key={tipIndex} className="text-xs text-gray-600 flex items-start gap-2">
                                                                                <span className="text-gray-600 mt-1">•</span>
                                                                                <span>{tip}</span>
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Condiciones a evitar */}
                                            <div className="space-y-4">
                                                <h4 className="font-semibold text-gray-900">⚠️ Condiciones a evitar</h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    {getStorageInfo()?.avoidConditions.map((condition, index) => (
                                                        <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                                            <div className="flex items-start gap-3">
                                                                <span className="text-xl">{condition.icon}</span>
                                                                <div className="flex-1">
                                                                    <h5 className="font-medium text-gray-900 mb-1">{condition.condition}</h5>
                                                                    <p className="text-sm text-red-700">{condition.reason}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Consejos para el envase */}
                                            <div className="space-y-4">
                                                <h4 className="font-semibold text-gray-900">📦 Consejos para el envase</h4>
                                                <div className="bg-gray-50 rounded-lg p-4">
                                                    <ul className="space-y-2">
                                                        {getStorageInfo()?.containerTips.map((tip, index) => (
                                                            <li key={index} className="text-sm text-gray-700 flex items-start gap-3">
                                                                <svg className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                </svg>
                                                                <span>{tip}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>

                                            {/* Vida útil */}
                                            <div className="space-y-4">
                                                <h4 className="font-semibold text-gray-900">Vida útil del producto</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                                        <h5 className="font-medium text-gray-900 mb-2">Sin abrir</h5>
                                                        <p className="text-sm text-green-700">{getStorageInfo()?.shelfLife.unopened}</p>
                                                    </div>
                                                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                                        <h5 className="font-medium text-gray-900 mb-2">Abierto</h5>
                                                        <p className="text-sm text-yellow-700">{getStorageInfo()?.shelfLife.opened}</p>
                                                    </div>
                                                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                                        <h5 className="font-medium text-gray-900 mb-2">Señales de deterioro</h5>
                                                        <p className="text-sm text-red-700">{getStorageInfo()?.shelfLife.signs}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Mejores prácticas */}
                                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                                <h5 className="font-semibold text-gray-900 mb-3">Mejores prácticas</h5>
                                                <ul className="space-y-2">
                                                    {getStorageInfo()?.bestPractices.map((practice, index) => (
                                                        <li key={index} className="text-sm text-purple-700 flex items-start gap-3">
                                                            <svg className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                            <span>{practice}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            {/* Frequently bought together - Centrado en toda la página */}
            <div className="max-w-4xl mx-auto mt-16 px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Frequently bought together</h3>
                    <p className="text-gray-600">
                        Optimiza tu entrenamiento con estos productos combinados
                    </p>
                </div>

                <div className="p-6">
                    <div className="max-w-2xl mx-auto">
                        <div className="space-y-4">
                            {/* Producto actual */}
                            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                                <div className="w-6 h-6 bg-black rounded flex items-center justify-center">
                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <img
                                    src={product?.image || 'https://images.unsplash.com/photo-1594736797933-d0c29d4b2c3e?w=400&h=400&fit=crop&crop=center'}
                                    alt={product?.name}
                                    className="w-16 h-16 object-cover rounded"
                                />
                                <div className="flex-1">
                                    <div className="inline-block px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded mb-1">
                                        Este producto
                                    </div>
                                    <h4 className="font-semibold text-gray-900">{product?.name}</h4>
                                    <p className="text-sm text-gray-600 underline">Chocolate, 908g</p>
                                </div>
                                <div className="text-right">
                                    <div className="font-semibold text-gray-900">${product?.price || 89} USD</div>
                                    <div className="text-sm text-gray-500">(${(product?.price / 0.908 || 98.02).toFixed(2)}/kg)</div>
                                </div>
                            </div>

                            {/* Productos adicionales */}
                            {getFrequentlyBoughtTogether().map((item, index) => (
                                <div key={item.id} className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg">
                                    <button
                                        onClick={() => toggleFrequentlyBoughtSelection(item.id)}
                                        className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${selectedFrequentlyBought[item.id]
                                            ? 'bg-black'
                                            : 'bg-gray-200 hover:bg-gray-300'
                                            }`}
                                    >
                                        {selectedFrequentlyBought[item.id] && (
                                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </button>
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-16 h-16 object-cover rounded"
                                    />
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-900">{item.name}</h4>
                                        <p className="text-sm text-gray-600 underline">{item.variant}</p>
                                    </div>
                                    <div className="text-right">
                                        {item.originalPrice ? (
                                            <>
                                                <div className="font-semibold text-gray-600">${item.price} USD</div>
                                                <div className="text-sm text-gray-400 line-through">${item.originalPrice} USD</div>
                                            </>
                                        ) : (
                                            <div className="font-semibold text-gray-900">${item.price} USD</div>
                                        )}
                                        <div className="text-sm text-gray-500">({item.pricePerUnit})</div>
                                    </div>
                                    <button
                                        onClick={() => navigate(`/product/${item.id}`)}
                                        className="text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Precio total */}
                        <div className="mt-6 pt-4 border-t border-gray-200 text-center">
                            <div className="flex items-center justify-center gap-2 mb-4">
                                <span className="text-lg font-medium text-gray-900">Precio total:</span>
                                <span className="text-2xl font-bold text-gray-600">${getFrequentlyBoughtTotal().total} USD</span>
                                {getFrequentlyBoughtTotal().hasDiscount && (
                                    <span className="text-lg text-gray-400 line-through">${getFrequentlyBoughtTotal().originalTotal} USD</span>
                                )}
                            </div>

                            {/* Botón de agregar al carrito */}
                            <button
                                onClick={handleAddFrequentlyBoughtToCart}
                                disabled={!Object.values(selectedFrequentlyBought).some(selected => selected)}
                                className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 ${Object.values(selectedFrequentlyBought).some(selected => selected)
                                    ? 'bg-gray-800 hover:bg-gray-700 text-white shadow-lg hover:shadow-xl'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                            >
                                {Object.values(selectedFrequentlyBought).some(selected => selected)
                                    ? 'Agregar seleccionados al carrito'
                                    : 'Selecciona productos para agregar'
                                }
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Overlay de información nutricional */}
            {showNutritionalOverlay && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Header del overlay */}
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
                            <div className="flex items-center justify-between">
                                <h3 className="text-2xl font-bold text-gray-900">Información Nutricional</h3>
                                <button
                                    onClick={closeNutritionalOverlay}
                                    className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
                                >
                                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Contenido del overlay */}
                        <div className="p-6">
                            {/* Imagen del producto con overlay */}
                            <div className="relative mb-6 rounded-xl overflow-hidden">
                                <img
                                    src={galleryImages[selectedImageIndex] || product?.imageUrl}
                                    alt={product?.name}
                                    className="w-full h-64 object-cover"
                                />

                                {/* Overlay nutricional superpuesto */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent">
                                    <div className="absolute bottom-4 left-4 right-4">
                                        <div className="bg-white/95 backdrop-blur-sm rounded-lg p-4">
                                            <h4 className="font-bold text-gray-900 mb-2">Por porción {getNutritionalValues()?.servingSize}g</h4>

                                            {/* Información nutricional compacta */}
                                            <div className="grid grid-cols-2 gap-3 text-sm">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-gray-600">Proteína:</span>
                                                    <span className="font-semibold text-gray-600">{getNutritionalValues()?.protein}g</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-gray-600">Carbohidratos:</span>
                                                    <span className="font-semibold text-gray-900">{getNutritionalValues()?.carbohydrates}g</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-gray-600">Grasas:</span>
                                                    <span className="font-semibold text-gray-900">{getNutritionalValues()?.fats}g</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-gray-600">Calorías:</span>
                                                    <span className="font-semibold text-orange-600">{getNutritionalValues()?.calories} kcal</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Información nutricional detallada */}
                            <div className="space-y-6">
                                {/* Valores nutricionales */}
                                <div>
                                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Valores Nutricionales por porción</h4>

                                    <div className="space-y-3">
                                        {/* Proteína */}
                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                                                <span className="font-medium text-gray-900">Proteína</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="font-bold text-gray-600">{getNutritionalValues()?.protein}g</span>
                                                <div className="text-xs text-gray-500">83% del valor diario</div>
                                            </div>
                                        </div>

                                        {/* Carbohidratos */}
                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                                                <span className="font-medium text-gray-900">Carbohidratos</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="font-bold text-gray-900">{getNutritionalValues()?.carbohydrates}g</span>
                                                <div className="text-xs text-gray-500">1% del valor diario</div>
                                            </div>
                                        </div>

                                        {/* Grasas */}
                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                                                <span className="font-medium text-gray-900">Grasas</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="font-bold text-gray-900">{getNutritionalValues()?.fats}g</span>
                                                <div className="text-xs text-gray-500">2% del valor diario</div>
                                            </div>
                                        </div>

                                        {/* Calorías */}
                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                                                <span className="font-medium text-gray-900">Calorías</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="font-bold text-orange-600">{getNutritionalValues()?.calories} kcal</span>
                                                <div className="text-xs text-gray-500">6% del valor diario</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Ingredientes principales */}
                                <div>
                                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Ingredientes Principales</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="p-3 bg-gray-50 rounded-lg">
                                            <div className="font-medium text-gray-900">Proteína de Suero</div>
                                            <div className="text-sm text-gray-700">Fuente principal de proteína</div>
                                        </div>
                                        <div className="p-3 bg-gray-50 rounded-lg">
                                            <div className="font-medium text-gray-900">Cacao Natural</div>
                                            <div className="text-sm text-green-700">Sabor y antioxidantes</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Beneficios */}
                                <div>
                                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Beneficios Clave</h4>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3">
                                            <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            <span className="text-gray-700">Recuperación muscular rápida</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            <span className="text-gray-700">Alto contenido proteico</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            <span className="text-gray-700">Bajo en carbohidratos</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            <span className="text-gray-700">Fácil de digerir</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer del overlay */}
                        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-2xl">
                            <button
                                onClick={closeNutritionalOverlay}
                                className="w-full py-3 px-6 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de corte transversal del producto */}
            {showCrossSection && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Header del modal */}
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
                            <div className="flex items-center justify-between">
                                <h3 className="text-2xl font-bold text-gray-900">{getCrossSectionInfo()?.title}</h3>
                                <button
                                    onClick={closeCrossSection}
                                    className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
                                >
                                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Contenido del modal */}
                        <div className="p-6">
                            {/* Descripción */}
                            <div className="mb-6">
                                <p className="text-gray-700 text-lg leading-relaxed">
                                    {getCrossSectionInfo()?.description}
                                </p>
                            </div>

                            {/* Comparación de imágenes */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                                {/* Imagen del producto normal */}
                                <div className="space-y-4">
                                    <h4 className="text-lg font-semibold text-gray-900 text-center">Producto Completo</h4>
                                    <div className="relative overflow-hidden rounded-xl bg-gray-50 aspect-square">
                                        <img
                                            src={getCrossSectionInfo()?.image}
                                            alt="Producto completo"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <p className="text-sm text-gray-600 text-center">
                                        Vista externa del envase de proteína
                                    </p>
                                </div>

                                {/* Imagen de corte transversal */}
                                <div className="space-y-4">
                                    <h4 className="text-lg font-semibold text-gray-900 text-center">Corte Transversal</h4>
                                    <div className="relative overflow-hidden rounded-xl bg-gray-50 aspect-square">
                                        <img
                                            src={getCrossSectionInfo()?.crossSectionImage}
                                            alt="Corte transversal del producto"
                                            className="w-full h-full object-cover"
                                        />
                                        {/* Overlay de análisis */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent">
                                            <div className="absolute bottom-4 left-4 right-4">
                                                <div className="bg-white/95 backdrop-blur-sm rounded-lg p-3">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                                                        <span className="text-sm font-medium text-gray-900">Textura Uniforme</span>
                                                    </div>
                                                    <p className="text-xs text-gray-600">
                                                        Estructura homogénea sin grumos
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600 text-center">
                                        Vista interna mostrando la textura del polvo
                                    </p>
                                </div>
                            </div>

                            {/* Características de la textura */}
                            <div className="bg-gray-50 rounded-xl p-6">
                                <h4 className="text-lg font-semibold text-gray-900 mb-6 text-center">Características de la Textura</h4>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {/* Textura */}
                                    <div className="bg-white rounded-lg p-4 shadow-sm">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                                </svg>
                                            </div>
                                            <h5 className="font-semibold text-gray-900">Textura</h5>
                                        </div>
                                        <p className="text-sm text-gray-600">{getCrossSectionInfo()?.texture}</p>
                                    </div>

                                    {/* Consistencia */}
                                    <div className="bg-white rounded-lg p-4 shadow-sm">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                </svg>
                                            </div>
                                            <h5 className="font-semibold text-gray-900">Consistencia</h5>
                                        </div>
                                        <p className="text-sm text-gray-600">{getCrossSectionInfo()?.consistency}</p>
                                    </div>

                                    {/* Color */}
                                    <div className="bg-white rounded-lg p-4 shadow-sm">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                                                </svg>
                                            </div>
                                            <h5 className="font-semibold text-gray-900">Color</h5>
                                        </div>
                                        <p className="text-sm text-gray-600">{getCrossSectionInfo()?.color}</p>
                                    </div>

                                    {/* Tamaño de partículas */}
                                    <div className="bg-white rounded-lg p-4 shadow-sm">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                                </svg>
                                            </div>
                                            <h5 className="font-semibold text-gray-900">Tamaño de Partículas</h5>
                                        </div>
                                        <p className="text-sm text-gray-600">{getCrossSectionInfo()?.particleSize}</p>
                                    </div>

                                    {/* Densidad */}
                                    <div className="bg-white rounded-lg p-4 shadow-sm">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                                                </svg>
                                            </div>
                                            <h5 className="font-semibold text-gray-900">Densidad</h5>
                                        </div>
                                        <p className="text-sm text-gray-600">{getCrossSectionInfo()?.density}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Beneficios de la textura */}
                            <div className="mt-8">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">¿Por qué es importante la textura?</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                                        <svg className="w-5 h-5 text-gray-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        <div>
                                            <h5 className="font-medium text-gray-900 mb-1">Mejor Disolución</h5>
                                            <p className="text-sm text-green-700">Se mezcla perfectamente sin formar grumos</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                                        <svg className="w-5 h-5 text-gray-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        <div>
                                            <h5 className="font-medium text-gray-900 mb-1">Textura Suave</h5>
                                            <p className="text-sm text-gray-700">Experiencia de consumo agradable y cremosa</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                                        <svg className="w-5 h-5 text-gray-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        <div>
                                            <h5 className="font-medium text-gray-900 mb-1">Absorción Óptima</h5>
                                            <p className="text-sm text-purple-700">Micro-partículas para mejor digestión</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                                        <svg className="w-5 h-5 text-orange-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        <div>
                                            <h5 className="font-medium text-orange-900 mb-1">Calidad Premium</h5>
                                            <p className="text-sm text-orange-700">Procesamiento avanzado para máxima pureza</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer del modal */}
                        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-2xl">
                            <button
                                onClick={closeCrossSection}
                                className="w-full py-3 px-6 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Sección de Reviews centrada al final */}
            <div className="max-w-4xl mx-auto mt-16">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Opiniones de clientes</h2>
                    <p className="text-gray-600">
                        {getAllReviews().length} reseñas • Promedio: {getRating()?.average?.toFixed(1) || '4.8'}/5 ⭐
                    </p>
                </div>

                <div className="space-y-6">
                    {getAllReviews().map((review) => (
                        <div key={review.id} className="border-b border-gray-100 pb-6 last:border-b-0 last:pb-0">
                            <div className="flex items-start gap-4">
                                {/* Avatar */}
                                <img
                                    src={review.avatar}
                                    alt={review.userName}
                                    className="w-12 h-12 rounded-full object-cover"
                                />

                                {/* Contenido de la review */}
                                <div className="flex-1">
                                    {/* Header */}
                                    <div className="flex items-center gap-2 mb-2">
                                        <h4 className="font-semibold text-gray-900">{review.userName}</h4>
                                        {review.verified && (
                                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                                ✓ Compra verificada
                                            </span>
                                        )}
                                    </div>

                                    {/* Rating y fecha */}
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="flex items-center gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <svg
                                                    key={i}
                                                    className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                                                        }`}
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            ))}
                                        </div>
                                        <span className="text-sm text-gray-500">
                                            {review.date.toLocaleDateString('es-ES', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </span>
                                    </div>

                                    {/* Título */}
                                    <h5 className="font-medium text-gray-900 mb-2">{review.title}</h5>

                                    {/* Contenido */}
                                    <p className="text-gray-700 leading-relaxed mb-3">{review.content}</p>

                                    {/* Acciones */}
                                    <div className="flex items-center gap-4">
                                        <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                            </svg>
                                            Útil ({review.helpful})
                                        </button>
                                        <button className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                                            Responder
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Ver más reviews */}
                <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                    <button className="px-6 py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium rounded-lg transition-colors duration-200">
                        Ver todas las reseñas ({getAllReviews().length})
                    </button>
                </div>

                {/* Escribir review */}
                <div className="mt-6">
                    {!showReviewForm ? (
                        <button
                            onClick={() => setShowReviewForm(true)}
                            className="w-full py-3 px-4 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-medium rounded-lg transition-colors duration-200"
                        >
                            Escribir una reseña
                        </button>
                    ) : (
                        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">Escribir una reseña</h4>

                            <form onSubmit={handleSubmitReview} className="space-y-4">
                                {/* Nombre del usuario */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tu nombre
                                    </label>
                                    <input
                                        type="text"
                                        value={reviewForm.userName}
                                        onChange={(e) => handleReviewFormChange('userName', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                                        placeholder="Ingresa tu nombre"
                                        required
                                    />
                                </div>

                                {/* Rating */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Calificación
                                    </label>
                                    <div className="flex items-center gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <button
                                                key={i}
                                                type="button"
                                                onClick={() => handleReviewFormChange('rating', i + 1)}
                                                className={`w-8 h-8 ${i < reviewForm.rating ? 'text-yellow-400' : 'text-gray-300'
                                                    } hover:text-gray-900 transition-colors`}
                                            >
                                                <svg className="w-full h-full" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            </button>
                                        ))}
                                        <span className="ml-2 text-sm text-gray-600">
                                            {reviewForm.rating} de 5 estrellas
                                        </span>
                                    </div>
                                </div>

                                {/* Título */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Título de tu reseña
                                    </label>
                                    <input
                                        type="text"
                                        value={reviewForm.title}
                                        onChange={(e) => handleReviewFormChange('title', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                                        placeholder="Ej: Excelente producto, muy recomendado"
                                        required
                                    />
                                </div>

                                {/* Contenido */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tu experiencia
                                    </label>
                                    <textarea
                                        value={reviewForm.content}
                                        onChange={(e) => handleReviewFormChange('content', e.target.value)}
                                        rows={4}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                                        placeholder="Comparte tu experiencia con este producto..."
                                        required
                                    />
                                </div>

                                {/* Botones */}
                                <div className="flex gap-3">
                                    <button
                                        type="submit"
                                        className="flex-1 py-2 px-4 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors duration-200"
                                    >
                                        Enviar reseña
                                    </button>
                                    <button
                                        type="button"
                                        onClick={cancelReviewForm}
                                        className="flex-1 py-2 px-4 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium rounded-lg transition-colors duration-200"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
