import { useNavigate } from 'react-router-dom';
import useWishlist from '../hooks/useWishlist';
import { useCart } from '../contexts/CartContext';
import LoadingSpinner from '../components/LoadingSpinner';
import useNotifications from '../hooks/useNotifications';

const Wishlist = () => {
    const navigate = useNavigate();
    const { items, itemCount, isLoading, isError, error, removeFromWishlist, clearWishlist } = useWishlist();
    const { addToCart } = useCart();
    const { showSuccess, showError } = useNotifications();

    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(price);
    };

    const handleAddToCart = async (product) => {
        try {
            await addToCart(product._id, 1);
            showSuccess(`${product.name} agregado al carrito`);
        } catch (error) {
            showError(error.response?.data?.message || 'Error al agregar al carrito');
        }
    };

    const handleRemoveFromWishlist = async (productId, productName) => {
        try {
            await removeFromWishlist(productId);
            showSuccess(`${productName} removido de tu lista de deseos`);
        } catch (error) {
            showError(error.response?.data?.message || 'Error al remover de la lista');
        }
    };

    const handleClearWishlist = async () => {
        if (confirm('¿Estás seguro de que quieres limpiar toda tu lista de deseos?')) {
            try {
                await clearWishlist();
                showSuccess('Lista de deseos limpiada');
            } catch (error) {
                showError(error.response?.data?.message || 'Error al limpiar la lista');
            }
        }
    };

    if (isLoading) {
        return <LoadingSpinner text="Cargando lista de deseos..." />;
    }

    if (isError) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 mb-4">Error: {error.message}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Mi Lista de Deseos</h1>
                            <p className="mt-2 text-gray-600">
                                {itemCount === 0 ? 'No tienes productos guardados' : `${itemCount} ${itemCount === 1 ? 'producto guardado' : 'productos guardados'}`}
                            </p>
                        </div>
                        {itemCount > 0 && (
                            <button
                                onClick={handleClearWishlist}
                                className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                            >
                                Limpiar Lista
                            </button>
                        )}
                    </div>
                </div>

                {/* Lista de productos */}
                {items.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-12">
                        <div className="text-center">
                            <svg className="w-24 h-24 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            <h3 className="text-xl font-medium text-gray-900 mb-2">
                                Tu lista de deseos está vacía
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Explora nuestros productos y guarda tus favoritos para después
                            </p>
                            <button
                                onClick={() => navigate('/')}
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Ver Productos
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {items.map((item) => {
                            const product = item.product;
                            if (!product) return null;

                            return (
                                <div
                                    key={item.product._id}
                                    className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow"
                                >
                                    {/* Imagen */}
                                    <div className="relative h-48 bg-gray-200 overflow-hidden group">
                                        {product.imageUrl ? (
                                            <img
                                                src={product.imageUrl}
                                                alt={product.name}
                                                className="w-full h-full object-cover cursor-pointer transition-transform group-hover:scale-105"
                                                onClick={() => navigate(`/product/${product._id}`)}
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-gray-400">
                                                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                        )}

                                        {/* Botón de remover */}
                                        <button
                                            onClick={() => handleRemoveFromWishlist(product._id, product.name)}
                                            className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors opacity-0 group-hover:opacity-100"
                                            title="Remover de lista de deseos"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>

                                    {/* Información del producto */}
                                    <div className="p-4">
                                        <h3
                                            className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2 cursor-pointer hover:text-blue-600"
                                            onClick={() => navigate(`/product/${product._id}`)}
                                        >
                                            {product.name}
                                        </h3>
                                        {product.brand && (
                                            <p className="text-sm text-gray-600 mb-2">{product.brand}</p>
                                        )}
                                        <p className="text-xl font-bold text-green-600 mb-3">
                                            {formatPrice(product.price)}
                                        </p>

                                        {/* Fecha agregada */}
                                        <p className="text-xs text-gray-500 mb-4">
                                            Agregado el {new Date(item.addedAt).toLocaleDateString('es-ES')}
                                        </p>

                                        {/* Botones de acción */}
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleAddToCart(product)}
                                                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                            >
                                                Agregar al Carrito
                                            </button>
                                            <button
                                                onClick={() => navigate(`/product/${product._id}`)}
                                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                                title="Ver detalles"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Wishlist;

