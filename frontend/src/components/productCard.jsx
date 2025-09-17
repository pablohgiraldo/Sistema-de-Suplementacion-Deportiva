export default function ProductCard({ p, onProductClick }) {
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

  // Función para calcular descuento
  const calculateDiscount = (originalPrice, currentPrice) => {
    if (!originalPrice || !currentPrice || originalPrice <= currentPrice) return null;
    const discount = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
    return discount > 0 ? discount : null;
  };

  // Función para obtener precio original si hay descuento
  const getOriginalPrice = (product) => {
    return product.originalPrice || product.price;
  };

  // Función para obtener precio actual
  const getCurrentPrice = (product) => {
    return product.price;
  };

  // Función para obtener el estado del stock
  const getStockStatus = (stock) => {
    if (stock === 0) return 'Agotado';
    if (stock < 10) return 'Stock bajo';
    return 'Disponible';
  };

  // Función para obtener el color del badge según el tipo
  const getBadgeColor = (badge) => {
    switch (badge) {
      case 'Bestseller':
        return 'bg-black text-white';
      case 'Outlet':
        return 'bg-black text-white';
      case 'Sample':
        return 'bg-black text-white';
      case 'Vegan':
        return 'bg-black text-white';
      default:
        return 'bg-black text-white';
    }
  };

  return (
    <div 
      className="group bg-white rounded-xl p-4 shadow-sm hover:shadow-2xl transition-all duration-500 hover:scale-[1.03] relative overflow-hidden border border-gray-100 hover:border-gray-300 cursor-pointer transform hover:-translate-y-1"
      onClick={() => onProductClick && onProductClick(p)}
    >
      {/* Badge */}
      {p.badge && (
        <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-bold z-10 ${getBadgeColor(p.badge)} group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
          {p.badge}
        </div>
      )}

    {/* Icono de favorito */}
    <div className="absolute top-3 right-3 text-gray-500 hover:text-red-500 cursor-pointer z-10 transition-all duration-300 group-hover:scale-125 group-hover:rotate-12">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    </div>

      {/* Logo de marca */}
      <div className="text-xs text-gray-500 mb-2 font-medium pt-6 group-hover:text-gray-600 transition-colors">
        SUPERGAINS ELITE SPORTS NUTRITION
      </div>

      {/* Imagen del producto */}
      <div className="mb-4 bg-gray-50 rounded-lg p-4 flex items-center justify-center h-32 group-hover:bg-gradient-to-br group-hover:from-gray-100 group-hover:to-gray-200 transition-all duration-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-transparent group-hover:from-blue-500/10 group-hover:to-purple-500/10 transition-all duration-500"></div>
        <img
          src={p.image}
          alt={p.name}
          className="max-w-full max-h-full object-contain group-hover:scale-110 transition-all duration-500 relative z-10"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      </div>

      {/* Información del producto */}
      <div className="space-y-2">
        <h3 className="font-semibold text-gray-800 text-sm line-clamp-2 group-hover:text-black transition-colors">
          {p.name || 'Sin nombre'}
        </h3>

        <p className="text-xs text-gray-600 line-clamp-2 group-hover:text-gray-700 transition-colors">
          {p.description || 'Sin descripción'}
        </p>

        {/* Valoración */}
        <div className="flex items-center gap-1">
          <div className="flex text-yellow-400 group-hover:text-yellow-500 transition-colors">
            {'★'.repeat(Math.floor(p.rating || 0))}
          </div>
          <span className="text-xs text-gray-500 group-hover:text-gray-600 transition-colors">
            ({p.reviews || 0} reseñas)
          </span>
        </div>

        {/* Precio */}
        <div className="space-y-1">
          {/* Precio original tachado si hay descuento */}
          {(() => {
            const originalPrice = getOriginalPrice(p);
            const currentPrice = getCurrentPrice(p);
            const discount = calculateDiscount(originalPrice, currentPrice);
            
            return (
              <>
                {discount && (
                  <div className="text-sm text-gray-500 line-through group-hover:text-gray-600 transition-colors">
                    {formatPrice(originalPrice)}
                  </div>
                )}
                
                {/* Precio actual */}
                <div className="text-lg font-bold text-gray-900 group-hover:text-black transition-colors">
                  {formatPrice(currentPrice)}
                </div>
                
                {/* Indicador de descuento */}
                {discount && (
                  <div className="inline-block bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold group-hover:bg-red-600 transition-colors">
                    -{discount}%
                  </div>
                )}
              </>
            );
          })()}
        </div>

        {/* Precio por unidad si está disponible */}
        {p.pricePerUnit && (
          <div className="text-xs text-gray-500 group-hover:text-gray-600 transition-colors">
            {formatPrice(p.pricePerUnit)}/kg
          </div>
        )}

        {/* Botón de acción */}
        <div className="flex justify-end">
          <button className="bg-white text-black w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 hover:scale-125 hover:rotate-12 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-gray-300/50 relative overflow-hidden border border-gray-200">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-gray-100/20 group-hover:from-gray-100/10 group-hover:to-gray-200/30 transition-all duration-300"></div>
            <span className="relative z-10">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1"/>
                <circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
            </span>
          </button>
        </div>
      </div>

      {/* Efecto de overlay sutil */}
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-transparent group-hover:from-blue-500/5 group-hover:via-purple-500/5 group-hover:to-pink-500/5 transition-all duration-500 pointer-events-none"></div>
      
      {/* Efecto de brillo */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/0 to-transparent group-hover:from-white/10 group-hover:via-white/20 group-hover:to-white/10 transition-all duration-700 pointer-events-none transform -skew-x-12 group-hover:translate-x-full"></div>
    </div>
  );
}
