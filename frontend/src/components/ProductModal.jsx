import { useState, useEffect } from 'react';

export default function ProductModal({ product, isOpen, onClose, onAddToCart }) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // Función para formatear el precio en COP
  const formatPrice = (price) => {
    if (typeof price === 'number') {
      return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
      }).format(price);
    }
    return '$0';
  };

  // Función para obtener el color del badge según el tipo
  const getBadgeColor = (badge) => {
    switch (badge) {
      case 'Bestseller':
        return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white';
      case 'Outlet':
        return 'bg-gradient-to-r from-red-500 to-pink-500 text-white';
      case 'Sample':
        return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white';
      case 'Vegan':
        return 'bg-gradient-to-r from-green-600 to-green-700 text-white';
      default:
        return 'bg-black text-white';
    }
  };

  // Cerrar modal con tecla Escape
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal */}
        <div 
          className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            {/* Header del modal */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1">
                <div className="text-xs text-gray-500 mb-2 font-medium">
                  SUPERGAINS ELITE SPORTS NUTRITION
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {product.name}
                </h2>
                <div className="flex items-center gap-4">
                  {/* Badge */}
                  {product.badge && (
                    <div className={`px-3 py-1 rounded-full text-sm font-bold ${getBadgeColor(product.badge)}`}>
                      {product.badge}
                    </div>
                  )}
                  {/* Valoración */}
                  <div className="flex items-center gap-2">
                    <div className="flex text-yellow-400">
                      {'★'.repeat(Math.floor(product.rating || 0))}
                    </div>
                    <span className="text-sm text-gray-500">
                      ({product.reviews || 0} reseñas)
                    </span>
                  </div>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-2xl ml-4"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Columna izquierda - Imágenes */}
              <div>
                <div className="bg-gray-50 rounded-lg p-6 flex items-center justify-center h-80 mb-4">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="max-w-full max-h-full object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
                
                {/* Información adicional de la imagen */}
                <div className="text-center text-sm text-gray-500">
                  Imagen del producto {product.name}
                </div>
              </div>

              {/* Columna derecha - Información del producto */}
              <div className="space-y-6">
                {/* Descripción */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Descripción</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {product.description || 'Descripción no disponible para este producto.'}
                  </p>
                </div>

                {/* Especificaciones */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Especificaciones</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Marca:</span>
                      <span className="font-medium">{product.brand || 'SuperGains'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Categoría:</span>
                      <span className="font-medium">{product.category || 'Suplemento'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Stock disponible:</span>
                      <span className={`font-medium ${product.stock > 10 ? 'text-green-600' : product.stock > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {product.stock || 0} unidades
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Valoración:</span>
                      <span className="font-medium">{product.rating || 0}/5 estrellas</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Reseñas:</span>
                      <span className="font-medium">{product.reviews || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Precio */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900 mb-2">
                      {formatPrice(product.price)}
                    </div>
                    {product.pricePerUnit && (
                      <div className="text-sm text-gray-500 mb-4">
                        {formatPrice(product.pricePerUnit)}/kg
                      </div>
                    )}
                    
                    {/* Selector de cantidad */}
                    <div className="flex items-center justify-center gap-4 mb-4">
                      <span className="text-gray-600">Cantidad:</span>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-medium">{quantity}</span>
                        <button 
                          onClick={() => setQuantity(Math.min(product.stock || 10, quantity + 1))}
                          className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Precio total */}
                    <div className="text-lg font-semibold text-gray-700 mb-4">
                      Total: {formatPrice(product.price * quantity)}
                    </div>

                    {/* Botones de acción */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => onAddToCart && onAddToCart({...product, quantity})}
                        className="flex-1 bg-black text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="9" cy="21" r="1"/>
                          <circle cx="20" cy="21" r="1"/>
                          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                        </svg>
                        Agregar al carrito
                      </button>
      <button className="flex-1 bg-gray-100 text-gray-500 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
        Favoritos
      </button>
                    </div>
                  </div>
                </div>

                {/* Información adicional */}
                <div className="text-sm text-gray-500 space-y-1">
                  <div>• Envío gratis en compras superiores a $150.000</div>
                  <div>• Garantía de satisfacción 30 días</div>
                  <div>• Soporte al cliente 24/7</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
