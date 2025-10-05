import React, { useMemo, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext.jsx';
import { useInventory, inventoryUtils } from '../hooks/useInventory';
import WishlistButton from './WishlistButton';
import { getProductImage } from '../data/sampleProducts';

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

  // Función para determinar el badge del producto
  const getProductBadge = useCallback(() => {
    // Lógica para determinar si es Bestseller o New Flavor
    // Por ahora usaremos datos del producto o lógica simple
    if (p.isBestseller || p.salesCount > 1000) {
      return { type: 'bestseller', text: 'Bestseller' };
    }
    if (p.isNew || p.createdAt > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) {
      return { type: 'new', text: 'New Flavor' };
    }
    return null;
  }, [p]);

  // Función para obtener el sabor principal y contador
  const getFlavorInfo = useCallback(() => {
    const primaryFlavor = p.flavor || p.name?.split(' ').pop() || 'Original';
    // Usar el ID del producto para generar un número consistente de sabores
    const seed = p._id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const totalFlavors = p.availableFlavors?.length || Math.floor(5 + (seed % 20)); // 5-24 basado en el ID
    return { primaryFlavor, totalFlavors };
  }, [p._id, p.flavor, p.name, p.availableFlavors]);

  // Función para generar rating simulado (usando ID del producto para consistencia)
  const getRating = useCallback(() => {
    // Usar el ID del producto para generar un número consistente
    const seed = p._id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const rating = p.rating || 4.5 + (seed % 50) / 100; // 4.5-5.0 basado en el ID
    const reviewCount = p.reviewCount || Math.floor(1000 + (seed % 9000)); // 1000-9999 basado en el ID
    return { rating: Math.round(rating * 10) / 10, reviewCount };
  }, [p._id, p.rating, p.reviewCount]);

  // Función para calcular precio por kg
  const getPricePerKg = useCallback(() => {
    const weightInKg = p.weightInGrams ? p.weightInGrams / 1000 : 1; // Default 1kg si no hay peso
    const pricePerKg = p.price / weightInKg;
    return pricePerKg;
  }, [p]);

  // Función para obtener la imagen del producto
  const getProductImageUrl = useCallback(() => {
    // Si el producto ya tiene una imagen, usarla; sino usar una imagen de muestra
    return p.imageUrl || getProductImage(p._id);
  }, [p.imageUrl, p._id]);

  return (
    <div className="group relative border-2 border-transparent rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:border-blue-500 transition-all duration-300 bg-white transform hover:-translate-y-2" onClick={handleProductClick}>
      {/* Imagen del producto */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 aspect-square">
        <img
          src={getProductImageUrl()}
          alt={p.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            // Si falla la imagen, usar imagen de respaldo simple
            e.target.src = getProductImage(p._id);
          }}
          loading="lazy"
        />

        {/* Badge del producto (Bestseller/New Flavor) */}
        {getProductBadge() && (
          <div className={`absolute top-3 left-3 z-10 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg ${getProductBadge().type === 'bestseller'
              ? 'bg-black text-white'
              : 'bg-blue-500 text-white'
            }`}>
            {getProductBadge().text}
          </div>
        )}

        {/* Botón de wishlist */}
        <div className="absolute top-3 right-3 z-10">
          <WishlistButton
            productId={p._id}
            productName={p.name}
            size="sm"
          />
        </div>

        {/* Icono de acción (bolsa de compras) */}
        <div className="absolute bottom-3 right-3 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart(e);
            }}
            disabled={inventoryLoading || !canAddToCart(1)}
            className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Contenido del producto */}
      <div className="p-4 space-y-3">
        {/* Tags de sabores */}
        {(() => {
          const flavorInfo = getFlavorInfo();
          return (
            <div className="flex flex-wrap gap-2">
              <span className="text-xs bg-gray-200 text-gray-800 px-3 py-1 rounded-full font-medium">
                {flavorInfo.primaryFlavor} + {flavorInfo.totalFlavors}
              </span>
            </div>
          );
        })()}

        {/* Nombre del producto */}
        <h3 className="text-lg font-bold text-gray-900 line-clamp-2 leading-tight">
          {p.name || 'Sin nombre'}
        </h3>

        {/* Descripción */}
        {p.description && (
          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
            {p.description}
          </p>
        )}

        {/* Rating con estrellas */}
        {(() => {
          const rating = getRating();
          return (
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-4 h-4 ${i < Math.floor(rating.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm text-gray-600">({rating.reviewCount.toLocaleString()})</span>
            </div>
          );
        })()}

        {/* Precio */}
        <div className="space-y-1">
          {p.originalPrice && p.originalPrice > p.price && (
            <p className="text-sm text-gray-400 line-through">{formatPrice(p.originalPrice)}</p>
          )}
          <div className="flex items-baseline gap-2">
            <p className="text-lg font-bold text-gray-900">
              {formatPrice(p.price)}
            </p>
            <p className="text-sm text-gray-600">
              ({formatPrice(getPricePerKg())}/kg)
            </p>
          </div>
        </div>
      </div>

      {/* Indicador de cantidad en carrito */}
      {cartContext.isInCart(p._id) && (
        <div className="absolute top-2 left-2 z-20 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
          {cartContext.getCartItemQuantity(p._id)} en carrito
        </div>
      )}
    </div>
  );
});

// Función de comparación personalizada para React.memo
ProductCard.displayName = 'ProductCard';

export default ProductCard;
