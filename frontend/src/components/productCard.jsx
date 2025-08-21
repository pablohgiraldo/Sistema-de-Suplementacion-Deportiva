export default function ProductCard({ p }) {
    return (
      <div className="border rounded-xl p-4 shadow-sm hover:shadow-md transition">
        <div className="text-lg font-semibold">{p.name}</div>
        <div className="text-sm text-gray-600">{p.brand}</div>
        <div className="mt-2 font-bold">$ {(p.price/1000).toFixed(3)} COP</div>
        <div className="text-xs text-gray-500">Stock: {p.stock}</div>
      </div>
    );
  }
  