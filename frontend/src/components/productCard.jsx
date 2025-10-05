import React, { useMemo, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext.jsx';
import { useInventory, inventoryUtils } from '../hooks/useInventory';
import WishlistButton from './WishlistButton';

const ProductCard = React.memo(({ p }) => {
  const { isAuthenticated } = useAuth();
  const cartContext = useCart();
  const navigate = useNavigate();
  const { inventory, loading: inventoryLoading } = useInventory(p._id);

  // Función memoizada para formatear el precio
  const formatPrice = useCallback((price) => {
    if (typeof price === 'number') {
      return `$${price.toFixed(2)}`;
    }
    return '$0.00';
  }, []);

  // Valores memoizados para evitar recálculos innecesarios
  const stockInfo = useMemo(() => {
    if (inventoryLoading) {
      return {
        status: 'Cargando...',
        color: 'bg-gray-100 text-gray-800',
        availableStock: 0,
        canAdd: false
      };
    }

    if (!inventory) {
      const stock = p.stock || 0;
      return {
        status: stock === 0 ? 'Agotado' : stock <= 5 ? 'Stock bajo' : 'Disponible',
        color: stock === 0 ? 'bg-red-100 text-red-800' :
          stock <= 5 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800',
        availableStock: stock,
        canAdd: stock >= 1
      };
    }

    return {
      status: inventoryUtils.getStockStatus(inventory),
      color: inventoryUtils.getStockStatusColor(inventory),
      availableStock: inventory.availableStock,
      canAdd: inventoryUtils.canAddToCart(inventory, 1)
    };
  }, [inventory, inventoryLoading, p.stock]);

  // Funciones memoizadas para obtener información del stock
  const getStockStatus = useCallback(() => stockInfo.status, [stockInfo.status]);
  const getStockStatusColor = useCallback(() => stockInfo.color, [stockInfo.color]);
  const getAvailableStock = useCallback(() => stockInfo.availableStock, [stockInfo.availableStock]);
  const canAddToCart = useCallback((requestedQuantity = 1) => {
    if (inventoryLoading) return false;
    if (!inventory) return (p.stock || 0) >= requestedQuantity;
    return inventoryUtils.canAddToCart(inventory, requestedQuantity);
  }, [inventoryLoading, inventory, p.stock]);

  const handleAddToCart = useCallback(async (e) => {
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
  }, [isAuthenticated, inventoryLoading, canAddToCart, getAvailableStock, cartContext, p]);

  const handleUpdateQuantity = useCallback(async (newQuantity, e) => {
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
  }, [inventoryLoading, canAddToCart, getAvailableStock, cartContext, p._id]);

  const handleProductClick = useCallback(() => {
    navigate(`/product/${p._id}`);
  }, [navigate, p._id]);

  return (
    <div className="group relative border-2 border-transparent rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:border-blue-500 transition-all duration-300 bg-white transform hover:-translate-y-2" onClick={handleProductClick}>
      {/* Imagen del producto */}
      {p.imageUrl && (
        <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 aspect-square">
          <img
            src={p.imageUrl}
            alt={p.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
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
          <div className="absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 animate-pulse"></div>

          {/* Badge de stock */}
          <div className={`absolute top-3 left-3 z-10 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm ${getStockStatusColor()}`}>
            {getStockStatus()}
          </div>

          {/* Botón de wishlist */}
          <div className="absolute top-3 right-3 z-10 transform transition-all duration-300 scale-0 group-hover:scale-100">
            <WishlistButton
              productId={p._id}
              productName={p.name}
              size="md"
            />
          </div>

          {/* Overlay de descuento (si aplica) */}
          {p.discount && (
            <div className="absolute bottom-3 right-3 bg-red-500 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg">
              -{p.discount}%
            </div>
          )}
        </div>
      )}

      {/* Contenido del producto */}
      <div className="p-4 space-y-3">
        {/* Categorías */}
        {p.categories && p.categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {p.categories.slice(0, 2).map((category, index) => (
              <span
                key={index}
                className="text-xs bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-3 py-1 rounded-full font-medium shadow-sm"
              >
                {category}
              </span>
            ))}
          </div>
        )}

        {/* Nombre del producto */}
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 line-clamp-2 min-h-[3.5rem] leading-tight">
          {p.name || 'Sin nombre'}
        </h3>

        {/* Marca */}
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          <span className="text-sm text-gray-600 font-medium">{p.brand || 'Sin marca'}</span>
        </div>

        {/* Descripción */}
        {p.description && (
          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
            {p.description}
          </p>
        )}

        {/* Stock info */}
        <div className="flex items-center gap-2 text-sm">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          {inventoryLoading ? (
            <span className="text-gray-400 animate-pulse">Cargando...</span>
          ) : (
            <span className="text-gray-700 font-medium">
              {getAvailableStock()} unidades disponibles
            </span>
          )}
        </div>

        {/* Precio */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="space-y-1">
            {p.originalPrice && p.originalPrice > p.price && (
              <p className="text-sm text-gray-400 line-through">{formatPrice(p.originalPrice)}</p>
            )}
            <p className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
              {formatPrice(p.price)}
            </p>
          </div>
          {p.discount && (
            <div className="bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-bold">
              AHORRA {p.discount}%
            </div>
          )}
        </div>
      </div>

      {/* Botones de carrito */}
      <div className="p-4 pt-0">
        {cartContext.isInCart(p._id) ? (
          <div className="space-y-3">
            {/* Contador de cantidad */}
            <div className="flex items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-3 border-2 border-green-200">
              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => handleUpdateQuantity(cartContext.getCartItemQuantity(p._id) - 1, e)}
                  disabled={inventoryLoading || !canAddToCart(1)}
                  className="bg-white text-gray-700 w-8 h-8 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all duration-200 flex items-center justify-center font-bold text-lg hover:scale-110"
                  aria-label="Reducir cantidad"
                >
                  −
                </button>
                <span className="text-lg font-bold text-gray-900 min-w-[2rem] text-center">
                  {cartContext.getCartItemQuantity(p._id)}
                </span>
                <button
                  onClick={(e) => handleUpdateQuantity(cartContext.getCartItemQuantity(p._id) + 1, e)}
                  disabled={inventoryLoading || !canAddToCart(cartContext.getCartItemQuantity(p._id) + 1)}
                  className="bg-white text-gray-700 w-8 h-8 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all duration-200 flex items-center justify-center font-bold text-lg hover:scale-110"
                  aria-label="Aumentar cantidad"
                >
                  +
                </button>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                </svg>
                <span className="text-sm font-bold text-green-600">En carrito</span>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={handleAddToCart}
            disabled={inventoryLoading || !canAddToCart(1)}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3.5 rounded-xl font-bold text-base shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 group"
          >
            {inventoryLoading ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Cargando...
              </>
            ) : !canAddToCart(1) ? (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Agotado
              </>
            ) : (
              <>
                <svg className="w-5 h-5 transform group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Agregar al Carrito
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
});

// Función de comparación personalizada para React.memo
ProductCard.displayName = 'ProductCard';

export default ProductCard;
