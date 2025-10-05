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
                        className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700"
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
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Galería de imágenes - Lado izquierdo */}
                    <div className="space-y-6">
                        {/* Imagen principal */}
                        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 aspect-square">
                            <img
                                src={galleryImages[selectedImageIndex] || product?.imageUrl}
                                alt={product?.name}
                                className="w-full h-full object-cover transition-all duration-500"
                                loading="eager"
                            />

                            {/* Botón de zoom */}
                            <button className="absolute bottom-4 right-4 w-12 h-12 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110">
                                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                </svg>
                            </button>
                        </div>

                        {/* Thumbnails */}
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

                    {/* Información del producto - Lado derecho */}
                    <div className="space-y-8">
                        {/* Badge */}
                        {getProductBadge() && (
                            <div className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${getProductBadge().type === 'bestseller'
                                ? 'bg-black text-white'
                                : 'bg-blue-500 text-white'
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
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        <div className="space-y-2">
                            <div className="text-4xl font-bold text-gray-900">
                                ${product?.price.toFixed(2)} USD
                            </div>
                            <div className="text-sm text-gray-600">
                                ${(product?.price / 0.908).toFixed(2)} USD/kg, incl. IVA, excl. envío
                            </div>
                        </div>

                        {/* Botones de acción */}
                        <div className="flex gap-4">
                            {isInCart(productId) ? (
                                <div className="flex-1 space-y-3">
                                    <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
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
                    </div>
                </div>
            </div>
        </div>
    );
}
