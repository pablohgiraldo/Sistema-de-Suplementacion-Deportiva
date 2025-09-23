import { useState } from 'react';
import ProductCard from './productCard';

export default function ShoppingCart({ isOpen, onClose, cartItems = [], onUpdateQuantity, onRemoveItem }) {
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Calcular totales
  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const shipping = subtotal > 100000 ? 0 : 15000; // Envío gratis sobre $100,000
  const tax = subtotal * 0.19; // IVA 19%
  const total = subtotal + shipping + tax;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      onRemoveItem(itemId);
    } else {
      onUpdateQuantity(itemId, newQuantity);
    }
  };

  const handleCheckout = async () => {
    setIsCheckingOut(true);

    try {
      // Simular proceso de checkout
      await new Promise(resolve => setTimeout(resolve, 2000));

      alert('¡Compra realizada exitosamente! Te enviaremos un email de confirmación.');
      onClose();

    } catch (error) {
      console.error('Error en el checkout:', error);
      alert('Error al procesar la compra. Inténtalo de nuevo.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-black">Carrito de Compras</h2>
            <p className="text-gray-600 text-sm">
              {cartItems.length} {cartItems.length === 1 ? 'producto' : 'productos'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col lg:flex-row h-full">
          {/* Lista de productos */}
          <div className="flex-1 overflow-y-auto p-6">
            {cartItems.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4 text-gray-400">
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="9" cy="21" r="1" />
                    <circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Tu carrito está vacío
                </h3>
                <p className="text-gray-600 mb-6">
                  Agrega algunos productos para comenzar tu compra
                </p>
                <button
                  onClick={onClose}
                  className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Continuar comprando
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item._id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    {/* Imagen del producto */}
                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="max-w-full max-h-full object-contain transition-opacity duration-300"
                        loading="lazy"
                        decoding="async"
                        onLoad={(e) => {
                          e.target.style.opacity = '1';
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                        style={{ opacity: 0 }}
                      />
                      {/* Placeholder mientras carga */}
                      <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
                    </div>

                    {/* Información del producto */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-600 truncate">
                        {item.description}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        {item.badge && (
                          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                            {item.badge}
                          </span>
                        )}
                        <span className="text-sm text-gray-500">
                          {item.brand}
                        </span>
                      </div>
                    </div>

                    {/* Controles de cantidad */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                      >
                        −
                      </button>
                      <span className="w-8 text-center font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                      >
                        +
                      </button>
                    </div>

                    {/* Precio */}
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                      {item.quantity > 1 && (
                        <div className="text-sm text-gray-500">
                          {formatPrice(item.price)} c/u
                        </div>
                      )}
                    </div>

                    {/* Botón eliminar */}
                    <button
                      onClick={() => onRemoveItem(item._id)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Resumen de compra */}
          {cartItems.length > 0 && (
            <div className="lg:w-80 border-l border-gray-200 p-6 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Resumen de compra
              </h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Envío</span>
                  <span className="font-medium">
                    {shipping === 0 ? (
                      <span className="text-green-600">Gratis</span>
                    ) : (
                      formatPrice(shipping)
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">IVA (19%)</span>
                  <span className="font-medium">{formatPrice(tax)}</span>
                </div>

                <div className="border-t border-gray-300 pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>
              </div>

              {/* Promoción de envío gratis */}
              {shipping > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6">
                  <div className="text-sm text-green-800">
                    <strong>¡Envío gratis!</strong> Agrega{' '}
                    {formatPrice(100000 - subtotal)} más para obtener envío gratis.
                  </div>
                </div>
              )}

              {/* Botón de checkout */}
              <button
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isCheckingOut ? 'Procesando...' : 'Proceder al pago'}
              </button>

              {/* Métodos de pago */}
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500 mb-2">Métodos de pago aceptados</p>
                <div className="flex justify-center space-x-2">
                  <span className="text-xs bg-gray-200 px-2 py-1 rounded">💳</span>
                  <span className="text-xs bg-gray-200 px-2 py-1 rounded">🏦</span>
                  <span className="text-xs bg-gray-200 px-2 py-1 rounded">📱</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
