export default function ProductCard({ p }) {
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
    </div>
  );
}
