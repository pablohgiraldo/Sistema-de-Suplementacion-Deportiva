import { useAuth } from '../contexts/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext.jsx';
import { useInventory, inventoryUtils } from '../hooks/useInventory';
import WishlistButton from './WishlistButton';

export default function ProductCard({ p }) {
  const { isAuthenticated } = useAuth();
  const cartContext = useCart();
  const navigate = useNavigate();
  const { inventory, loading: inventoryLoading } = useInventory(p._id);

  // Función para formatear el precio
  const formatPrice = (price) => {
    if (typeof price === 'number') {
      return `$${price.toFixed(2)}`;
    }
    return '$0.00';
  };

  // Función para obtener el estado del stock (usando inventario real)
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
    if (!inventory) return p.stock || 0;
    return inventory.availableStock;
  };

  const canAddToCart = (requestedQuantity = 1) => {
    if (inventoryLoading) return false;
    if (!inventory) return (p.stock || 0) >= requestedQuantity;
    return inventoryUtils.canAddToCart(inventory, requestedQuantity);
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation(); // Evitar navegación al detalle del producto

    if (!isAuthenticated) {
      alert('Necesitas iniciar sesión para agregar productos al carrito');
      return;
    }

    if (inventoryLoading) {
      alert('Cargando información del producto...');
      return;
    }

    if (!canAddToCart(1)) {
      const availableStock = getAvailableStock();
      if (availableStock === 0) {
        alert('Este producto está agotado');
      } else {
        alert(`Stock insuficiente. Disponible: ${availableStock} unidades`);
      }
      return;
    }

    try {
      await cartContext.addToCart(p);
    } catch (error) {
      console.error('Error al agregar al carrito:', error);
      alert('Error al agregar al carrito');
    }
  };

  const handleUpdateQuantity = async (newQuantity, e) => {
    e.stopPropagation(); // Evitar navegación al detalle del producto

    if (newQuantity < 1) {
      // Si la cantidad es 0, eliminar del carrito
      console.log('🗑️ ProductCard: Eliminando producto del carrito:', p._id);
      try {
        await cartContext.removeFromCart(p._id);
      } catch (error) {
        console.error('Error al eliminar del carrito:', error);
        alert('Error al eliminar del carrito');
      }
      return;
    }

    if (inventoryLoading) {
      alert('Cargando información del producto...');
      return;
    }

    if (!canAddToCart(newQuantity)) {
      const availableStock = getAvailableStock();
      alert(`Stock insuficiente. Disponible: ${availableStock} unidades`);
      return;
    }

    try {
      await cartContext.updateQuantity(p._id, newQuantity);
    } catch (error) {
      console.error('Error al actualizar cantidad:', error);
      alert('Error al actualizar cantidad');
    }
  };

  const handleProductClick = () => {
    navigate(`/product/${p._id}`);
  };

  return (
    <div className="border rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02] sm:hover:scale-105 cursor-pointer bg-white" onClick={handleProductClick}>
      {p.imageUrl && (
        <div className="mb-2 sm:mb-3 relative overflow-hidden rounded-md sm:rounded-lg bg-gray-100 group">
          <img
            src={p.imageUrl}
            alt={p.name}
            className="w-full h-24 sm:h-32 object-cover transition-opacity duration-300"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
            onLoad={(e) => {
              e.target.style.opacity = '1';
            }}
            loading="lazy"
            decoding="async"
            style={{ opacity: 0 }}
          />
          {/* Placeholder mientras carga */}
          <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>

          {/* Botón de wishlist */}
          <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
            <WishlistButton
              productId={p._id}
              productName={p.name}
              size="sm"
            />
          </div>
        </div>
      )}

      <div className="text-base sm:text-lg font-semibold text-gray-800 mb-1 line-clamp-2">
        {p.name || 'Sin nombre'}
      </div>

      <div className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">
        {p.brand || 'Sin marca'}
      </div>

      <div className="text-base sm:text-lg font-bold text-green-600 mb-1 sm:mb-2">
        {formatPrice(p.price)}
      </div>

      <div className="text-xs text-gray-500 mb-1 sm:mb-2">
        {inventoryLoading ? (
          <span className="text-gray-400">Cargando stock...</span>
        ) : (
          `Stock: ${getAvailableStock()} unidades`
        )}
      </div>

      <div className={`text-xs px-2 py-1 rounded-full inline-block mb-2 sm:mb-3 ${getStockStatusColor()}`}>
        {getStockStatus()}
      </div>

      {p.description && (
        <div className="text-xs text-gray-600 mt-1 sm:mt-2 line-clamp-2 hidden sm:block">
          {p.description}
        </div>
      )}

      {p.categories && p.categories.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1 sm:mt-2">
          {p.categories.slice(0, 2).map((category, index) => (
            <span
              key={index}
              className="text-xs bg-blue-100 text-blue-800 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full"
            >
              {category}
            </span>
          ))}
        </div>
      )}

      {/* Botones de carrito */}
      <div className="mt-2 sm:mt-4">
        {cartContext.isInCart(p._id) ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1 sm:space-x-2">
              <button
                onClick={(e) => handleUpdateQuantity(cartContext.getCartItemQuantity(p._id) - 1, e)}
                disabled={inventoryLoading || !canAddToCart(1)}
                className="bg-gray-200 text-gray-600 px-1.5 sm:px-2 py-1 rounded-md hover:bg-gray-300 disabled:opacity-50 text-xs sm:text-sm min-w-[24px] sm:min-w-[32px] h-6 sm:h-8 flex items-center justify-center"
                aria-label="Reducir cantidad"
              >
                -
              </button>
              <span className="text-xs sm:text-sm font-medium min-w-[16px] text-center">
                {cartContext.getCartItemQuantity(p._id)}
              </span>
              <button
                onClick={(e) => handleUpdateQuantity(cartContext.getCartItemQuantity(p._id) + 1, e)}
                disabled={inventoryLoading || !canAddToCart(cartContext.getCartItemQuantity(p._id) + 1)}
                className="bg-gray-200 text-gray-600 px-1.5 sm:px-2 py-1 rounded-md hover:bg-gray-300 disabled:opacity-50 text-xs sm:text-sm min-w-[24px] sm:min-w-[32px] h-6 sm:h-8 flex items-center justify-center"
                aria-label="Aumentar cantidad"
              >
                +
              </button>
            </div>
            <span className="text-xs text-green-600 font-medium">En carrito</span>
          </div>
        ) : (
          <button
            onClick={handleAddToCart}
            disabled={inventoryLoading || !canAddToCart(1)}
            className="w-full bg-blue-600 text-white px-2 sm:px-4 py-1.5 sm:py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm font-medium"
          >
            {inventoryLoading ? 'Cargando...' :
              !canAddToCart(1) ? 'Agotado' : 'Agregar'}
          </button>
        )}
      </div>
    </div>
  );
}
