import { useAuth } from '../hooks/useAuth';
import { useContext } from 'react';
import { CartContext } from '../contexts/CartContext';

// Hook seguro para usar el carrito
function useCartSafe() {
  try {
    return useContext(CartContext);
  } catch {
    return null;
  }
}

export default function ProductCard({ p }) {
  const { isAuthenticated } = useAuth();
  const cartContext = useCartSafe();

  // Función para formatear el precio
  const formatPrice = (price) => {
    if (typeof price === 'number') {
      return `$${price.toFixed(2)}`;
    }
    return '$0.00';
  };

  // Función para obtener el estado del stock
  const getStockStatus = (stock) => {
    if (stock === 0) return 'Agotado';
    if (stock < 10) return 'Stock bajo';
    return 'Disponible';
  };

  const handleAddToCart = async () => {
    if (!cartContext) {
      alert('Funcionalidad de carrito no disponible');
      return;
    }

    if (!isAuthenticated) {
      alert('Necesitas iniciar sesión para agregar productos al carrito');
      return;
    }

    if (p.stock === 0) {
      alert('Este producto está agotado');
      return;
    }

    try {
      const result = await cartContext.addToCart(p._id, 1);
      if (result.success) {
        // El estado se actualizará automáticamente
      } else {
        alert(result.error || 'Error al agregar al carrito');
      }
    } catch {
      alert('Error al agregar al carrito');
    }
  };

  const handleUpdateQuantity = async (newQuantity) => {
    if (!cartContext) {
      alert('Funcionalidad de carrito no disponible');
      return;
    }

    if (newQuantity < 1) {
      // Si la cantidad es 0, eliminar del carrito
      await cartContext.updateQuantity(p._id, 0);
      return;
    }

    try {
      const result = await cartContext.updateQuantity(p._id, newQuantity);
      if (!result.success) {
        alert(result.error || 'Error al actualizar cantidad');
      }
    } catch {
      alert('Error al actualizar cantidad');
    }
  };

  return (
    <div className="border rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105">
      {p.imageUrl && (
        <div className="mb-3">
          <img
            src={p.imageUrl}
            alt={p.name}
            className="w-full h-32 object-cover rounded-lg"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
      )}

      <div className="text-lg font-semibold text-gray-800 mb-1">
        {p.name || 'Sin nombre'}
      </div>

      <div className="text-sm text-gray-600 mb-2">
        {p.brand || 'Sin marca'}
      </div>

      <div className="text-lg font-bold text-green-600 mb-2">
        {formatPrice(p.price)}
      </div>

      <div className="text-xs text-gray-500 mb-2">
        Stock: {p.stock || 0} unidades
      </div>

      <div className={`text-xs px-2 py-1 rounded-full inline-block ${p.stock === 0 ? 'bg-red-100 text-red-800' :
        p.stock < 10 ? 'bg-yellow-100 text-yellow-800' :
          'bg-green-100 text-green-800'
        }`}>
        {getStockStatus(p.stock)}
      </div>

      {p.description && (
        <div className="text-xs text-gray-600 mt-2 line-clamp-2">
          {p.description}
        </div>
      )}

      {p.categories && p.categories.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {p.categories.slice(0, 3).map((category, index) => (
            <span
              key={index}
              className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full"
            >
              {category}
            </span>
          ))}
        </div>
      )}

      {/* Botones de carrito */}
      {cartContext && (
        <div className="mt-4">
          {cartContext.isInCart(p._id) ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleUpdateQuantity(cartContext.getCartItemQuantity(p._id) - 1)}
                  disabled={p.stock === 0}
                  className="bg-gray-200 text-gray-600 px-2 py-1 rounded-md hover:bg-gray-300 disabled:opacity-50 text-sm"
                >
                  -
                </button>
                <span className="text-sm font-medium">
                  {cartContext.getCartItemQuantity(p._id)}
                </span>
                <button
                  onClick={() => handleUpdateQuantity(cartContext.getCartItemQuantity(p._id) + 1)}
                  disabled={p.stock === 0}
                  className="bg-gray-200 text-gray-600 px-2 py-1 rounded-md hover:bg-gray-300 disabled:opacity-50 text-sm"
                >
                  +
                </button>
              </div>
              <span className="text-xs text-green-600 font-medium">En carrito</span>
            </div>
          ) : (
            <button
              onClick={handleAddToCart}
              disabled={p.stock === 0}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {p.stock === 0 ? 'Agotado' : 'Agregar al carrito'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
