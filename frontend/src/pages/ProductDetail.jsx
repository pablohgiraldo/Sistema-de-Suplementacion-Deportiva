import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../contexts/CartContext';
import { useInventory, inventoryUtils } from '../hooks/useInventory';
import api from '../services/api';

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
            const result = await addToCart(productId, quantity);
            if (result.success) {
                alert('Producto agregado al carrito');
            } else {
                alert(result.error || 'Error al agregar al carrito');
            }
        } catch (err) {
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
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
                        {/* Imagen del producto */}
                        <div className="space-y-4">
                            {product.imageUrl ? (
                                <img
                                    src={product.imageUrl}
                                    alt={product.name}
                                    className="w-full h-96 object-cover rounded-lg"
                                />
                            ) : (
                                <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                                    <span className="text-gray-400">Sin imagen</span>
                                </div>
                            )}
                        </div>

                        {/* Información del producto */}
                        <div className="space-y-6">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                    {product.name}
                                </h1>
                                <p className="text-lg text-gray-600 mb-4">
                                    {product.brand}
                                </p>
                                <p className="text-3xl font-bold text-green-600 mb-4">
                                    ${product.price.toFixed(2)}
                                </p>
                            </div>

                            {/* Información de stock */}
                            <div className="space-y-3">
                                <div className="flex items-center space-x-4">
                                    <span className="text-sm text-gray-600">
                                        Stock: {inventoryLoading ? 'Cargando...' : getAvailableStock()} unidades
                                    </span>
                                    <span className={`text-sm px-3 py-1 rounded-full ${getStockStatusColor()}`}>
                                        {getStockStatus()}
                                    </span>
                                </div>

                                {inventory && inventory.needsRestock && (
                                    <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                                        ⚠️ Stock bajo - Solo quedan {inventory.availableStock} unidades
                                    </div>
                                )}

                                {inventory && inventory.availableStock === 0 && (
                                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                                        ❌ Producto agotado
                                    </div>
                                )}
                            </div>

                            {/* Descripción */}
                            {product.description && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Descripción</h3>
                                    <p className="text-gray-600">{product.description}</p>
                                </div>
                            )}

                            {/* Categorías */}
                            {product.categories && product.categories.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Categorías</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {product.categories.map((category, index) => (
                                            <span
                                                key={index}
                                                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                                            >
                                                {category}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Controles de cantidad y carrito */}
                            <div className="space-y-4">
                                <div className="flex items-center space-x-4">
                                    <label className="text-sm font-medium text-gray-700">
                                        Cantidad:
                                    </label>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            disabled={quantity <= 1}
                                            className="bg-gray-200 text-gray-600 px-3 py-1 rounded-md hover:bg-gray-300 disabled:opacity-50"
                                        >
                                            -
                                        </button>
                                        <span className="w-12 text-center font-medium">
                                            {quantity}
                                        </span>
                                        <button
                                            onClick={() => setQuantity(quantity + 1)}
                                            disabled={!canAddToCart(quantity + 1)}
                                            className="bg-gray-200 text-gray-600 px-3 py-1 rounded-md hover:bg-gray-300 disabled:opacity-50"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                {/* Botones de carrito */}
                                {isInCart(productId) ? (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                                            <span className="text-green-800 font-medium">
                                                En carrito: {getCartItemQuantity(productId)} unidades
                                            </span>
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => handleUpdateQuantity(getCartItemQuantity(productId) - 1)}
                                                    disabled={inventoryLoading}
                                                    className="bg-gray-200 text-gray-600 px-2 py-1 rounded-md hover:bg-gray-300 disabled:opacity-50 text-sm"
                                                >
                                                    -
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateQuantity(getCartItemQuantity(productId) + 1)}
                                                    disabled={inventoryLoading || !canAddToCart(getCartItemQuantity(productId) + 1)}
                                                    className="bg-gray-200 text-gray-600 px-2 py-1 rounded-md hover:bg-gray-300 disabled:opacity-50 text-sm"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleAddToCart}
                                        disabled={inventoryLoading || !canAddToCart()}
                                        className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {inventoryLoading ? 'Cargando...' :
                                            !canAddToCart() ? 'Agotado' : 'Agregar al carrito'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
