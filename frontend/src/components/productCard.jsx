import React, { useMemo, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext.jsx';
import { useInventory, inventoryUtils } from '../hooks/useInventory';
import { useDesignSystem } from '../hooks/useDesignSystem';
import WishlistButton from './WishlistButton';

// Imágenes de productos reales - Suplementos deportivos profesionales
const sampleProductImages = [
  "https://images.unsplash.com/photo-1594736797933-d0c29d4b2c3e?w=500&h=500&fit=crop&crop=center", // Proteína Whey
  "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=500&fit=crop&crop=center", // Creatina Monohidrato
  "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=500&h=500&fit=crop&crop=center", // BCAAs
  "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=500&h=500&fit=crop&crop=center", // Pre-workout
  "https://images.unsplash.com/photo-1506629905607-2b0b0b0b0b0b?w=500&h=500&fit=crop&crop=center", // Multivitamínicos
  "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=500&h=500&fit=crop&crop=center", // Omega 3
  "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=500&fit=crop&crop=center", // Glutamina
  "https://images.unsplash.com/photo-1594736797933-d0c29d4b2c3e?w=500&h=500&fit=crop&crop=center", // Caseína
  "https://images.unsplash.com/photo-1621057621391-7ed446a24b41?w=500&h=500&fit=crop&crop=center", // Proteína Vegana
  "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=500&h=500&fit=crop&crop=center", // Mass Gainer
  "https://images.unsplash.com/photo-1594736797933-d0c29d4b2c3e?w=500&h=500&fit=crop&crop=center", // L-Carnitina
  "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=500&fit=crop&crop=center", // Colágeno
  "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=500&h=500&fit=crop&crop=center", // ZMA
  "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=500&h=500&fit=crop&crop=center", // Beta-Alanina
  "https://images.unsplash.com/photo-1506629905607-2b0b0b0b0b0b?w=500&h=500&fit=crop&crop=center" // Proteína Isolada
];

// Función para obtener una imagen basada en el ID del producto
const getProductImage = (productId) => {
  const seed = productId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const index = seed % sampleProductImages.length;
  return sampleProductImages[index];
};

const ProductCard = React.memo(({ p }) => {
  const { isAuthenticated } = useAuth();
  const cartContext = useCart();
  const navigate = useNavigate();
  const { inventory, loading: inventoryLoading } = useInventory(p._id);
  const { getCardStyles, colors, typography } = useDesignSystem();

  // Función memoizada para formatear el precio
  const formatPrice = useCallback((price) => {
    if (typeof price === 'number') {
      return `$${price.toFixed(2)} USD`;
    }
    return '$0.00 USD';
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
      return { type: 'new', text: 'Nuevo Sabor' };
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
    <div className={`${getCardStyles('default')} border border-gray-100 group relative`} onClick={handleProductClick}>
      {/* Botón de favoritos - Esquina superior derecha */}
      <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <WishlistButton productId={p._id} />
      </div>

      {/* Imagen del producto - Fondo gris según PRD */}
      <div className="relative aspect-square bg-gray-100 overflow-hidden">
        <img
          src={getProductImageUrl()}
          alt={p.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = getProductImage(p._id);
          }}
          loading="lazy"
        />
        
        {/* Indicador de stock bajo */}
        {stockInfo.isLowStock && (
          <div className="absolute bottom-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
            ¡Últimas unidades!
          </div>
        )}

        {/* Icono de acción (bolsa de compras) - Circular negro */}
        <div className="absolute bottom-3 right-3 z-10 transition-all duration-300 group-hover:scale-110">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart(e);
            }}
            disabled={inventoryLoading || !canAddToCart(1)}
            className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-800 hover:shadow-xl hover:scale-110 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5 transition-transform duration-300 hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Contenido de la tarjeta */}
      <div className="p-5">
        {/* Logo de marca - Según PRD */}
        <div className="text-xs text-gray-500 mb-2 font-bold tracking-wide">
          SUPERGAINS ELITE SPORTS NUTRITION
        </div>
        
        {/* Nombre del producto */}
        <h3 className="font-bold text-black mb-2 line-clamp-2 text-base leading-tight">
          {p.name || 'Sin nombre'}
        </h3>
        
        {/* Descripción */}
        {p.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2 leading-relaxed">
            {p.description}
          </p>
        )}
        
        {/* Valoración - Según PRD */}
        <div className="flex items-center mb-4">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-sm text-gray-500 ml-2 font-medium">(4.8)</span>
        </div>
        
        {/* Precio */}
        <div className="flex items-center justify-between">
          <div className="text-xl font-black text-black">
            {formatPrice(p.price)}
          </div>
          {stockInfo.isLowStock && (
            <div className="text-sm text-red-500 font-bold">
              Solo {stockInfo.availableStock} disponibles
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

// Función de comparación personalizada para React.memo
ProductCard.displayName = 'ProductCard';

export default ProductCard;
